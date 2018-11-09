/**
 * Sub-handler for tokens
 */

const helpers = require('../helpers');
const _data = require('../data');

module.exports = {
    // Token post
    // Required fields: phone, password
    // Optional fields: none 
    post: (data, callback) => {
        // Validate input
        const phone = typeof(data.payload.phone) == 'string'
            && data.payload.phone.trim().length == 10 ? 
            data.payload.phone.trim() : false;
        const password = typeof(data.payload.password) == 'string'
            && data.payload.password.trim().length > 0 ? 
            data.payload.password.trim() : false;

        if (phone && password) {
            // Look up the users
            _data.read('users', phone, (err, data) => {
                if (!err && data) {
                    // Hash password and compare with hashed password store 
                    // in DB
                    const hashPassword = helpers.hash(password);
                    if (hashPassword === data.password) {
                        // Create token with expiration 1 hour
                        const tokenId = helpers.createRandomString(20);
                        const expires = Date.now() + 1000 * 60 * 60;
                        const tokenObject = {
                            phone: phone,
                            id: tokenId,
                            expires: expires
                        };

                        // Store the token
                        _data
                            .create('tokens', tokenId, tokenObject, (err) => {
                            if (!err) {
                                callback(200, tokenObject);
                            } else {
                                callback(500, {Error: 'Could not create new '
                                + 'token'});
                            }
                        })
                     } else {
                        callback(400, {Error: 'Password not matched'});
                    }
                    
                } else {
                    callback(400, {Error: 'Could not find the specified '
                    + 'user'});
                }
            });
        } else {
            callback(400, {Error: 'Missing required fields'});
        }
    },

    // Token get
    // Required field: id
    // Optional field: none 
    get: (data, callback) => {
        // Check that the id is valid
        const id = typeof(data.queryStringObject.id) == 'string'
            && data.queryStringObject.id.trim().length == 20 ?
            data.queryStringObject.id.trim() : false;
        if (id) {
            // Look up the token
            _data.read('tokens', id, (err, tokenData) => {
                if (!err && data) {
                    callback(200, tokenData);
                } else {
                    callback(404);
                }
            });
        } else {
            callback(400, {Error: 'Missing required fields'});
        }
    },

    // Token put
    // Required field: id, extend
    // Optional field: none 
    put: (data, callback) => {
        // Check for the required field
        const id = typeof(data.queryStringObject.id) == 'string'
            && data.queryStringObject.id.trim().length == 20 ?
            data.queryStringObject.id.trim() : false;
        const extend = typeof(data.payload.extend) == 'boolean'
            && data.payload.extend == true ? 
            data.payload.extend : false;
        if (id && extend) {
            // Look up token
            _data.read('tokens', id, (err, tokenData) => {
                if (!err && tokenData) {
                    // Check token is already expired
                    if (tokenData.expires > Date.now()) {
                        // Set the experition an hour from now
                        tokenData.expires = Date.now() + 1000 * 60 * 60;

                        // Store the new update
                        _data.update('tokens', id, tokenData, (err) => {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, {Error: 'Could not update the '
                                + 'token\'s expiration'});
                            }
                        });
                    } else {
                        callback(400, {Error: 'The token has already expired '
                        + 'and cannot be extended'})
                    }
                } else {
                    callback(400, {Error: 'The specified token does not ' 
                        + 'exist'});
                }
            });
        } else {
            callback(400, {Error: 'Missing required field(s) or field(s) are '
            + 'invalid'});
        }
    },

    // Token delete
    // Required field: id
    delete: (data, callback) => {
        // Check that the id is valid
        const id = typeof(data.queryStringObject.id) == 'string'
            && data.queryStringObject.id.trim().length == 20 ?
            data.queryStringObject.id.trim() : false;
        if (id) {
            // Look up the token
            _data.read('tokens', id, (err, data) => {
                if (!err && data) {
                    _data.delete('tokens', id, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {Error: 'Coudld not delete the '
                            + 'specified token'})
                        }
                    });
                } else {
                    callback(400, {Error: 'Coudld not find the specified '
                    + 'token'});
                }
            });
        } else {
            callback(400, {Error: 'Missing required fields'});
        }
    },

    // Verify if a given token id is currently valid for a given user
    verifyToken: (id, phone, callback) => {
        // Look up the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                if(tokenData.phone === phone &&
                    tokenData.expires > Date.now()) {
                    callback(true);
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        });
    }
}
