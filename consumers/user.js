var rabbitmq = require('../utils/rabbitmq');
var chalk = require('chalk');
var app = require('../app').app;
var mysql = require('../utils/mysql').getPool();
var randtoken = require('rand-token');

module.exports = {
  initChat: function() {
    // Every client has one unique private queue
    // Create a queue for every client
    connection.exchange('direct_chat', options = {type: 'direct', confirm: true}, function (exchange) {
      var queueName = 'uq:' + user.token

      connection.queue(queueName, function (q) {
        q.bind(exchange, queueName, function(){
          q.subscribe(function (message) {
            // TODO
            var clientSocket = app.get('clientSocket')[user.token];
            clientSocket ? clientSocket.emit('chat', message) : null;
            console.log(message)
          });

          console.log(chalk.green('User Direct Chat Listener subscribed successfully..'));
        });
      });
    });

    for (var i=0;i<user.groups.length;i++) {
      var exchangeName = 'group_chat:' + user.groups[i];

      connection.exchange(exchangeName, options = {type: 'fanout', confirm: true}, function (exchange) {
        var queueName = 'uq:' + user.token

        connection.queue(queueName, function (q) {
          q.bind(exchange, '#', function(){
            q.subscribe(function (message) {
              // TODO
              var clientSocket = app.get('clientSocket')[user.token];
              clientSocket ? clientSocket.emit('chat', message) : null;
              console.log(message)
            });

            console.log(chalk.green('User Group Chat Listener subscribed successfully..'));
          });
        });
      })
    }
  }
}