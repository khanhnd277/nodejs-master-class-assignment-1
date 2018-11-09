/**
 * Create and export configuration variable
 * 
 */

// Container for all environments
let environments = {};

// Staging (default) environment
environments.staging = {
    envName: 'staging',
    httpPort: 3000,
    httpsPort: 3001,
    hashingSecret: 'ashjd#46$hdf'
};

// Production environment
environments.production = {
    envName: 'production',
    httpPort: 8080,
    httpsPort: 443,
    hashingSecret: 'ashjd#46$hdf'
};

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ?
    process.env.NODE_ENV.toLowerCase() : '';

const environmentToExport = 
    typeof(environments[currentEnvironment]) == 'object' ? 
    environments[currentEnvironment] : environments['staging'];

module.exports = environmentToExport;