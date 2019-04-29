/**
 * Sub-handler for users
 */

const helpers = require('../helpers');
const _data = require('../data');
const tokenHandler = require('./token');

module.exports = {
    // User post
    post: (data, callback) => {
        // Validate input
        const firstName = typeof(data.payload.firstName) == 'string'
            && data.payload.firstName.trim().length > 0 ? 
            data.payload.firstName.trim() : false;
        const lastName = typeof(data.payload.lastName) == 'string'
            && data.payload.lastName.trim().length > 0 ? 
            data.payload.lastName.trim() : false;
        const phone = typeof(data.payload.phone) == 'string'
            && data.payload.phone.trim().length == 10 ? 
            data.payload.phone.trim() : false;
        const password = typeof(data.payload.password) == 'string'
            && data.payload.password.trim().length > 0 ? 
            data.payload.password.trim() : false;
        const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' 
            && data.payload.tosAgreement == true ? true : false;

        if (firstName && lastName && phone && password && tosAgreement) {
            // Check user existed
            _data.read('users', phone, (err, data) => {
                // if (err) {
                    // Hash password
                    const hashPassword = helpers.hash(password);

                    if (hashPassword) {
                        // Create user object
                        const userObject = {
                            firstName: firstName,
                            lastName: lastName,
                            phone: phone,
                            password: hashPassword,
                            tosAgreement: true,
                            checks: []
                        };

                        // Store the user
                        _data.create('users', phone, userObject, (err) => {
                            if (!err) {
                                callback(200);
                            } else {
                                console.log(err);
                                callback(500, {Error: 'Could not create new '
                                    + 'user'});
                            }
                        })
                    } else {
                        callback(500, 
                            {Error: 'Could not use user\'s password'});
                    }
                // } else {
                //     callback(400, {Error: 'A user with phone number already '
                //         + 'existed'});
                // }
            });
        } else {
            callback(400, {Error: 'Missing required fields'});
        }
    },

    // User get
    // Required field: phone
    // Optional field: none 
    get: (data, callback) => {
        // Check that the phone number is valid
        const phone = typeof(data.queryStringObject.phone) == 'string'
            && data.queryStringObject.phone.trim().length == 10 ?
            data.queryStringObject.phone.trim() : false;
        if (phone) {

            // Get the token from headers
            const token = typeof(data.headers.token) == 'string' ?
                data.headers.token : false;
            
            if (token) {
                // Verify the given token is valid for the phone number
                tokenHandler.verifyToken(token, phone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // Look up the users
                        _data.read('users', phone, (err, data) => {
                            if (!err && data) {
                                // Remove the hashed password from the user 
                                // object before return it to the request
                                delete data.password;
                                callback(200, data);
                            } else {
                                callback(404);
                            }
                        });
                    } else {
                        callback(403, {Error: 'Token is invalid'});
                    }
                });
            } else {
                callback(403, {Error: 'Missing required token in header'});
            }
        } else {
            callback(400, {Error: 'Missing required fields'});
        }
    },

    // User put
    // Required field: phone
    // Optional field: firstName, lastName, password (at least one must be 
    // specified) 
    put: (data, callback) => {
        // Check for the required field
        const phone = typeof(data.payload.phone) == 'string'
            && data.payload.phone.trim().length == 10 ?
            data.payload.phone.trim() : false;
        const firstName = typeof(data.payload.firstName) == 'string'
            && data.payload.firstName.trim().length > 0 ? 
            data.payload.firstName.trim() : false;
        const lastName = typeof(data.payload.lastName) == 'string'
            && data.payload.lastName.trim().length > 0 ? 
            data.payload.lastName.trim() : false;
        const password = typeof(data.payload.password) == 'string'
            && data.payload.password.trim().length > 0 ? 
            data.payload.password.trim() : false;
        if (phone) {
            if (firstName || lastName || password) {
                // Get the token from headers
                const token = typeof(data.headers.token) == 'string' ?
                    data.headers.token : false;
                
                if (token) {
                    // Verify the given token is valid for the phone number
                    tokenHandler.verifyToken(token, phone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            // Look up user
                            _data.read('users', phone, (err, userData) => {
                                if (!err && userData) {
                                    // Update the fields
                                    if (firstName) {
                                        userData.firstName = firstName;
                                    }
                                    if (lastName) {
                                        userData.lastName = lastName;
                                    }
                                    if (password) {
                                        userData.password =
                                            helpers.hash(password);
                                    }

                                    // Store the new updates
                                    _data.
                                        update('users', phone, userData, 
                                        (err) => {
                                        if (!err) {
                                            callback(200);
                                        } else {
                                            console.log(err);
                                            callback(500, {Error: 'Could not '
                                            + 'update the users'})
                                        }
                                    });
                                } else {
                                    callback(400, {Error: 'The specified user'
                                    + ' does not exist'});
                                }
                            });
                        } else {
                            callback(403, {Error: 'Token is invalid'});
                        }
                    });
                } else {
                    callback(403, {Error: 'Missing required token in header'})
                    ;
                }
            } else {
                callback(400, {Error: 'Missing fields to update'});
            }
        } else {
            callback(400, {Error: 'Missing required fields'});
        }
    },

    // User delete
    // Required field: phone
    delete: (data, callback) => {
        // Check that the phone number is valid
        const phone = typeof(data.queryStringObject.phone) == 'string'
            && data.queryStringObject.phone.trim().length == 10 ?
            data.queryStringObject.phone.trim() : false;
        if (phone) {

            // Get the token from headers
            const token = typeof(data.headers.token) == 'string' ?
                data.headers.token : false;
            
            if (token) {
                // Verify the given token is valid for the phone number
                tokenHandler.verifyToken(token, phone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // Look up the users
                        _data.read('users', phone, (err, data) => {
                            if (!err && data) {
                                _data.delete('users', phone, (err) => {
                                    if (!err) {
                                        // Delete each of the check associate with user
                                        const userCheck = typeof(data.checks) == 'object'
                                            && data.checks instanceof Array ? data.checks : false;
                                        const checksToDelete = userCheck.length;
                                        if (checksToDelete > 0) {
                                            let deletedCheckNo = 0;
                                            let deletionError = false;

                                            // Loop through the checks
                                            userCheck.forEach(checkId => {
                                                // Delete the check
                                                _data.delete('checks', checkId, (err) => {
                                                    if (err) {
                                                        deletionError = true;
                                                    } else {
                                                        deletedCheckNo++;
                                                    }
                                                    if (checksToDelete === deletedCheckNo) {
                                                        if (!deletionError) {
                                                            callback(200);
                                                        } else {
                                                            callback(500, {Error: 'Errors encountered while attemping to delete the checks'})
                                                        }
                                                    }
                                                });
                                            });
                                        } else {    
                                            callback(200);
                                        }
                                    } else {
                                        callback(500, {Error: 'Could not '
                                        + 'delete the specified user'})
                                    }
                                });
                            } else {
                                callback(400, {Error: 'Coudld not find the '
                                + 'specified user'});
                            }
                        });
                    } else {
                        callback(403, {Error: 'Token is invalid'});
                    }
                });
            } else {
                callback(403, {Error: 'Missing required token in header'});
            }
        } else {
            callback(400, {Error: 'Missing required fields'});
        }
    }
}
