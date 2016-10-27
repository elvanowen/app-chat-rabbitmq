var rabbitmq = require('../utils/rabbitmq');
var chalk = require('chalk');
var app = require('../app').app;

module.exports = {
  init: function() {
    var connection = rabbitmq.getConnection();

    if (connection) {
      connection.exchange('group_event', options = {type: 'direct', confirm: true}, function (exchange) {
        connection.queue('group_add_user', function (q) {
          q.bind(exchange, 'group_add_user', function(){
            q.subscribe(function (message) {
              // TODO
              console.log(message)
            });

            console.log(chalk.green('Group Add User Listener subscribed successfully..'));
          });
        });

        connection.queue('group_kick_user', function (q) {
          q.bind(exchange, 'group_kick_user', function(){
            q.subscribe(function (message) {
              // TODO
              console.log(message)
            });

            console.log(chalk.green('Group Kick User Listener subscribed successfully..'));
          });
        });
      });
    }
  }
}