/**
 * Primary file for API
 */

const server = require('./lib/server');
const workers = require('./lib/workers');

var app = {};

app.init = () => {
    // Start https server
    // server.initHttpsServer();
    // Start http server
    server.initHttpServer();

    // Start the worker
    // workers.init();
}

app.init();

module.exports = app;