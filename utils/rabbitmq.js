var amqp = require('amqp');
var chalk = require('chalk');
var connection = null;
var isConnectionReady = false;

module.exports = {
    init: function(callback){
        connection = amqp.createConnection({host: "localhost", port: 5672});

        // add this for better debuging
        connection.on('error', function(e) {
            console.log(chalk.red('ERR AMQP : ', e));
        });

        // Wait for connection to become established.
        connection.on('ready', function () {
            console.log(chalk.green('AMQP Connection ready..'));
            isConnectionReady = true;

            callback();
        });
    },
    getConnection: function(){
        return isConnectionReady ? connection : null;
    }
};