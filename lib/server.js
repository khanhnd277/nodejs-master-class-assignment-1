const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const {StringDecoder} = require('string_decoder');
const config = require('../config');
const routers = require('./routers');
const helpers = require('./helpers');

/**
 * Init http server
 */
function initHttpServer() {
    // Instantiate http server
    const httpServer = http.createServer((req, res) => {
        processRequest(req, res);
    });

    // Start http the server
    httpServer.listen(config.httpPort, () => {
        console.log(`Http server is listening on port ${config.httpPort}`);
    });
};

/**
 * Init https server
 */
function initHttpsServer() {
    // Instantiate https server
    const httpsServerOptions = {
        key : fs.readFileSync('./https/key.pem'),
        cert: fs.readFileSync('./https/cert.pem')
    };
    const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
        processRequest(req, res);
    });

    // Start https the server
    httpsServer.listen(config.httpsPort, () => {
        console.log(`Https server listening on port ${config.httpsPort}`);
    });
};

/**
 * All the server logic with both http and https
 */
function processRequest(req, res) {
    // Get the URL and parse it
    const parseUrl = url.parse(req.url, true);

    // Get the path
    const path = parseUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'')

    // Get the HTTP method
    const method = req.method.toLowerCase();

    // Get query string
    const queryStringObject = parseUrl.query;

    // Get header
    const headers = req.headers;

    // Get payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();
        // Choose the handler
        let chosenHandler = typeof(routers[trimmedPath]) !== 'undefined' ? 
            routers[trimmedPath] : routers['notFound'];
        // Construct data object to send the handler
        const data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: helpers.parseJSONToObject(buffer)
        };

        // Router request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code called back by the handler, or default to 
            // 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload calledback to the handler, or default to an 
            // emplty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert payload to string
            const payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
};

module.exports = {
    initHttpServer,
    initHttpsServer
};