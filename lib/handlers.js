/**
 * Define all handlers for routers
 */

const userHandler = require('./handlers/user');
const tokenHandler = require('./handlers/token');
const checkHandler = require('./handlers/check');

module.exports = {

    /* Not found handler */
    notFound: (data, callback) => {
        callback(404);
    },

    /* Hello handler */
    hello: (data, callback) => {
        callback(200, {message: "Hello World!"});
    },

    /* Users handler */
    users: (data, callback) => {
        const acceptableMethod = ['post', 'get', 'put', 'delete'];
        if (acceptableMethod.indexOf(data.method) > -1) {
            userHandler[data.method](data, callback);
        } else {
            callback(405);
        }
    },

    /* Tokens handler */
    tokens: (data, callback) => {
        const acceptableMethod = ['post', 'get', 'put', 'delete'];
        if (acceptableMethod.indexOf(data.method) > -1) {
            tokenHandler[data.method](data, callback);
        } else {
            callback(405);
        }
    },

    /* Checks handler */
    checks: (data, callback) => {
        const acceptableMethod = ['post', 'get', 'put', 'delete'];
        if (acceptableMethod.indexOf(data.method) > -1) {
            checkHandler[data.method](data, callback);
        } else {
            callback(405);
        }
    },
}
