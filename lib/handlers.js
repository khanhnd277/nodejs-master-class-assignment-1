/**
 * Define all handlers for routers
 */
module.exports = {

    /* Hello handler */
    hello: (data, callback) => {
        callback(200, {message: "Hello World!"});
    },

    /* Not found handler */
    notFound: (data, callback) => {
        callback(404);
    }
}