/**
 * Hekper for various tasks
 */

const crypto = require('crypto');
const config = require('../config');

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
    }
};