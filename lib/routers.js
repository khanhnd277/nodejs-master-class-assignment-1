/**
 * Define all routers for API
 */
const handlers = require('./handlers');

module.exports = {
    notFound: handlers.notFound,
    hello: handlers.hello,
    users: handlers.users,
    tokens: handlers.tokens,
    checks: handlers.checks
};