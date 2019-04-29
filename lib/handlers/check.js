/**
 * Sub-handler for checks
 */

const helpers = require('../helpers');
const config = require('../config')
const _data = require('../data');
const tokenHandler = require('./token');

module.exports = {

    // Checks - post
    // Required fields: protocol, url, method, successCodes, timeoutSeconds
    // Optional fields: none
    post: (data, callback) => {
        // Validate input
        const protocol = typeof(data.payload.protocol) == 'string'
            && ['https', 'http'].indexOf(data.payload.protocol.trim()) > -1 ?
            data.payload.protocol.trim() : false;
        const url = typeof(data.payload.url) == 'string'
            && data.payload.url.trim().length > 0 ? 
            data.payload.url.trim() : false;
        const method = typeof(data.payload.method) == 'string'
            && ['post', 'get', 'put', 'delete']
                .indexOf(data.payload.method.trim()) > -1 ?
                data.payload.method.trim() : false;
        const successCodes = typeof(data.payload.successCodes) == 'object'
            && data.payload.successCodes instanceof Array 
            && data.payload.successCodes.length > 0? 
            data.payload.successCodes : false;
        const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number'
            && data.payload.timeoutSeconds % 1 === 0 
            && data.payload.timeoutSeconds >= 1
            && data.payload.timeoutSeconds <= 5 ? 
            data.payload.timeoutSeconds : false;
        
        if (protocol && url && method && successCodes && timeoutSeconds) {
            // get the token from the header
            const token = typeof(data.headers.token) == 'string' ? 
                data.headers.token : false;

            // Lookup the user by reading token
            _data.read('tokens', token, (err, tokenData) => {
                if (!err && tokenData) {
                    const userPhone = tokenData.phone;

                    // Look up the user data
                    _data.read('users', userPhone, (err, userData) => {
                        if (!err && userData) {
                            const userCheck = 
                                typeof(userData.checks) == 'object'
                                && userData.checks instanceof Array ?
                                userData.checks : false;
                            // Verify that user has less than the maxcheck per
                            // user
                            if (userCheck.length < config.maxChecks) {
                                // Create a random id for the check
                                const checkId = helpers
                                    .createRandomString(20);
                                // Create the check object, and include the 
                                // user phone
                                const checkObject = {
                                    id: checkId,
                                    userPhone: userPhone,
                                    protocol: protocol,
                                    url: url,
                                    method: method,
                                    successCodes: successCodes,
                                    timeoutSeconds: timeoutSeconds
                                };

                                // Save the object
                                _data.create('checks', checkId, checkObject,
                                    (err) => {
                                    if (!err) {
                                        // Add the check id to the user object
                                        userData.checks = userCheck;

                                        userData.checks.push(checkId);

                                        // Save the user data
                                        _data.update('users', userPhone, userData, (err) => {
                                            if (!err) {
                                                callback(200, checkObject);
                                            } else {
                                                callback(500, {Error: 'Could not update the user with the new check'})
                                            }
                                        })
                                    } else {
                                        callback(500, {Error: 'Could not create the check'})
                                    }
                                });
                            } else {
                                callback(400, {Error : 'The user has already maximum number of checks (' + config.maxChecks + ')'})
                            }
                        } else {
                            callback(403);
                        }
                    });
                } else {
                    callback(403);
                }
            });
        } else {
            callback(400, {Error: 'Missing required inputs, or inputs invalid'})
        }
    },

    // Checks - get
    // Required fields : id
    // Optional fields: none
    get: (data, callback) => {
        // Validate input
        const id = typeof(data.queryStringObject.id) == 'string'
            && data.queryStringObject.id.trim().length == 20 ?
            data.queryStringObject.id.trim() : false;
        if (id) {
            // Look up the check
            _data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    // Get the token from headers
                    const token = typeof(data.headers.token) == 'string' ?
                        data.headers.token : false;
                    
                    if (token) {
                        // Verify the given token is valid for the phone number
                        tokenHandler.verifyToken(token, checkData.userPhone, 
                            (tokenIsValid) => {
                            if (tokenIsValid) {
                                callback(200, checkData);
                            } else {
                                callback(403, {Error: 'Token is invalid'});
                            }
                        });
                    } else {
                        callback(403, {Error: 'Missing required token in header'});
                    }
                } else {
                    callback(404);
                }
            });
        } else {
            callback(400, {Error: 'Missing required fields'});
        }
    },

    // Checks - put
    // Required field: id
    // Optional field: protocol, url, method, successCodes, timeoutSeconds
    put: (data, callback) => {
        // Check for the required field
        const id = typeof(data.queryStringObject.id) == 'string'
            && data.queryStringObject.id.trim().length == 20 ?
            data.queryStringObject.id.trim() : false;
        
        // Check for the optional field
        const protocol = typeof(data.payload.protocol) == 'string'
            && ['https', 'http'].indexOf(data.payload.protocol.trim()) > -1 ?
            data.payload.protocol.trim() : false;
        const url = typeof(data.payload.url) == 'string'
            && data.payload.url.trim().length > 0 ? 
            data.payload.url.trim() : false;
        const method = typeof(data.payload.method) == 'string'
            && ['post', 'get', 'put', 'delete']
                .indexOf(data.payload.method.trim()) > -1 ?
                data.payload.method.trim() : false;
        const successCodes = typeof(data.payload.successCodes) == 'object'
            && data.payload.successCodes instanceof Array 
            && data.payload.successCodes.length > 0? 
            data.payload.successCodes : false;
        const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number'
            && data.payload.timeoutSeconds % 1 === 0 
            && data.payload.timeoutSeconds >= 1
            && data.payload.timeoutSeconds <= 5 ? 
            data.payload.timeoutSeconds : false;

        if (id) {
            if (protocol || url || method || successCodes || timeoutSeconds) {
                // Look up the check
                _data.read('checks', id, (err, checkData) => {
                    if (!err && checkData) {
                        // Get the token from headers
                        const token = typeof(data.headers.token) == 'string' ?
                            data.headers.token : false;
                    
                        if (token) {
                            // Verify the given token is valid for the phone number
                            tokenHandler.verifyToken(token, 
                                checkData.userPhone, (tokenIsValid) => {
                                if (tokenIsValid) {
                                    if (protocol) {
                                        checkData.protocol = protocol;
                                    }
                                    if (url) {
                                        checkData.url = url;
                                    }
                                    if (method) {
                                        checkData.method = method;
                                    }
                                    if (successCodes) {
                                        checkData.successCodes = successCodes;
                                    }
                                    if (timeoutSeconds) {
                                        checkData.timeoutSeconds =  
                                            timeoutSeconds;
                                    }

                                    _data.update('checks', id, checkData, 
                                        (err) => {
                                        if (!err) {
                                            callback(200);
                                        } else {
                                            callback(500, {Error: 'Could update the check'});
                                        }
                                    })
                                    
                                } else {
                                    callback(403, {Error: 'Token is invalid'});
                                }
                            });
                        } else {
                            callback(403, {Error: 'Missing required token in header'});
                        }
                    } else {
                        callback(400, {Error: 'The specified check does not ' 
                            + 'exist'});
                    }
                });
            } else {
                callback(400, {Error: 'Missing fields to update'});
            }
        } else {
            callback(400, {Error: 'Missing required field(s) or field(s) are '
            + 'invalid'});
        }
    },

    // Checks - delete
    // Required field: id
    delete: (data, callback) => {
        // Check that the phone number is valid
        const id = typeof(data.queryStringObject.id) == 'string'
            && data.queryStringObject.id.trim().length == 20 ?
            data.queryStringObject.id.trim() : false;
        if (id) {

            // Look up the check
            _data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    // Get the token from headers
                    const token = typeof(data.headers.token) == 'string' ?
                        data.headers.token : false;
                    
                    if (token) {
                        // Verify the given token is valid for the phone 
                        // number
                        tokenHandler.verifyToken(token, checkData.userPhone, 
                            (tokenIsValid) => {
                            if (tokenIsValid) {
                                // Delete the check
                                _data.delete('checks', id, (err) => {
                                    if (!err) {
                                        // Lookup the user
                                        _data.read('users', checkData.userPhone, (err, userData) => {
                                            if (!err && userData) {
                                                const userCheck = 
                                                    typeof(userData.checks) == 'object'
                                                    && userData.checks instanceof Array ?
                                                    userData.checks : false;
                                                
                                                // Remove the deleted check from user's list of checks

                                                const checkPosition = userCheck.indexOf(id);
                                                if (checkPosition > -1) {
                                                    userCheck.splice(checkPosition, 1);

                                                    userData.checks = userCheck;
                                                    // Re-save the user data
                                                    _data.update('users', userData.phone, userData, (err) => {
                                                        if (!err) {
                                                            callback(200);
                                                        } else {
                                                            callback(500, {Error: 'Could update the user'});
                                                        }
                                                    });
                                                } else {
                                                    callback(500, {Error: 'Could not remove the check from the user'})
                                                }
                                            } else {
                                                callback(500, {Error : 'Could not find the user who create the check'})
                                            }
                                        });
                                    } else {
                                        callback(500, {Error: 'Could not delete the check data'})
                                    }
                                });
                                
                            } else {
                                callback(403, 
                                    {Error: 'Token is invalid'});
                            }
                        });
                    } else {
                        callback(403, {Error: 'Missing required token in header'});
                    }
                } else {
                    callback(403)
                }
            });
        } else {
            callback(400, {Error: 'Missing required fields'});
        }
    }
}
