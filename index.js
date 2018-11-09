/**
 * Primary file for API
 */

const server = require('./lib/server');
const _data = require('./lib/data')

// Start https server
server.initHttpsServer();
// Start http server
server.initHttpServer();
