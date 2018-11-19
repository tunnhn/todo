const Mongoose = require('mongoose');

Mongoose.set('debug', true);

/**
 * Connect to database.
 *
 * @param options
 * @returns {Connection}
 */
module.exports = (options = {}) => {
    let uri = 'mongodb://admin:admin1234@ds241493.mlab.com:41493/nodejs';

    // If the node process ends, close the mongoose connection
    process.on('SIGINT', () => {
        Mongoose.connection.close(() => {
            console.log('Mongo Database disconnected through app termination')
            process.exit(0)
        })
    })

    const connection = Mongoose
        .createConnection(uri, options, () => {
        })

    connection.on('error', (error) => {
        console.error('MONGODB_ERROR', error)
    })

    return connection;
}
