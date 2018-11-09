/**
 * Primary file for API
 */

const server = require('./lib/server');

// Start https server
server.initHttpsServer();
// Start http server
server.initHttpServer();
