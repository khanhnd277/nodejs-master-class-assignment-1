/**
 * Primary file for API
 */

const server = require('./lib/server');
const _data = require('./lib/data')

// TESTING
// @TODO delete this
// _data.create('test', 'newFile', {foo : 'bar'}, (err) => {
//     console.log('This was the error', err);
// })

// _data.read('test', 'newFile', (err, data) => {
//     console.log('This was the error', err, ' and this was the data: ', data);
// })

// _data.update('test', 'newFile', {fizz: 'buzz'}, (err) => {
//     console.log('This was the error', err);
// })

// _data.delete('test', 'newFile', (err) => {
//     console.log('This was the error', err);
// })
// Start https server
server.initHttpsServer();
// Start http server
server.initHttpServer();

