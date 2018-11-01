/**
 * Define all routers for API
 */
const handlers = require('./handlers');

module.exports = {
    hello: handlers.hello,
    notFound: handlers.notFound,
};