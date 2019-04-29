/**
 * Hekper for various tasks
 */

const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const queryString = require('querystring');

module.exports = {

    // Create a SHA265 hash
    hash: (password) => {
        if (typeof(password) == 'string' && password.length > 0) {
            const hash = crypto.createHash('sha256', config.hashingSecret)
                .update(password)
                .digest('hex');
            return hash;
        } else {    
            return false;
        }
    },

    // Parse a JSON string to object in all cases, without throwing
    parseJSONToObject: (str) => {
        try {
            const obj = JSON.parse(str);
            return obj;
        } catch (e) {
            return {};
        }
    },

    // Create string of random alphanumeric characters, of a given length
    createRandomString: (length) => {
        length = typeof(length) == 'number' && length > 0 ? length : false;
        if (length) {
            // Define all the possible characters
            const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

            // Start the final string
            let str = '';
            for (i = 1; i <= length; i++) {
                // Get a random from possibleCharacters
                const randomCharacter = possibleCharacters.charAt(
                    Math.floor(Math.random() * possibleCharacters.length));

                // Append this character to final string
                str += randomCharacter;
            }
            return str;
        } else {
            return false;
        }
    },

    // Send a SMS messsage via Twilio
    sendTwilioSms: (phone, msg, callback) => {
        // Validate parameter
        phone = typeof(phone) == 'string' && phone.trim().length > 0 ? phone.trim() : false;
        msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600? msg.trim() : false;

        if (phone && msg) {
            // Configure the request payload
            const payload = {
                From : config.twilio.fromPhone,
                To: '+84' + phone,
                Body: msg
            }

            // Stringify the payload
            const stringPayload = queryString.stringify(payload);

            // Configure the request detail
            const requestDetails = {
                protocol: 'https:',
                hostname: 'api.twilio.com',
                method: 'POST',
                path: '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
                auth: config.twilio.accountSid + ':' + config.twilio.authToken,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(stringPayload) 
                }
            };

            // Instantiate the request object
            let req = https.request(requestDetails, (res) => {
                // Grab the status of the sent request
                const status = res.statusCode;

                // Callback successfully if the request sent through
                if (status == 200 || status == 201) {
                    callback(false);
                } else {
                    callback('Status code returned was ' + status);
                }
            });

            // Bind to the error event so it doesn't get thrown
            req.on('err', (e) => {
                callback(e);
            });

            // Add the payload
            req.write(stringPayload);

            // End the request
            req.end();
        } else {
            callback('Invalid parameter');
        }
    } 
};