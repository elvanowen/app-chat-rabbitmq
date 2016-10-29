var rabbitmq = require('../utils/rabbitmq');
var chalk = require('chalk');
var mysql = require('../utils/mysql').getPool();
var async = require('async');
var socket = require('../utils/socket');

module.exports = {
  init: function(){
    var connection = rabbitmq.getConnection();

    if (connection) {
      connection.exchange('user_controller', options = {type: 'direct', confirm: true}, function (exchange) {
        connection.queue('user_add', function (q) {
          q.bind(exchange, 'user_add', function(){
            q.subscribe(function (message) {
              var user = message.body.user;
              var uid = message.session.uid;
              var from;

              mysql.getConnection(function(err, connection){
                if (err) {
                  console.log(chalk.red(err));
                } else {
                  var result;

                  async.series([function(callback){
                    connection.query('SELECT * FROM user WHERE uid = ?', [uid], function(err, rows, fields) {
                      if (!err) {
                        from = rows.length ? rows[0] : null;

                        if (from.username == user.username) callback(new Error('Cannot add self'))
                        else callback(null)
                      } else callback(err)
                    });
                  }, function(callback){
                    connection.query('SELECT * FROM user WHERE username = ?', [user.username], function(err, rows, fields) {
                      if (!err) {
                        user = rows.length ? rows[0] : null;
                        callback(null)
                      } else callback(err)
                    });
                  }, function(callback){
                    connection.query('INSERT INTO user_friend(uid, fid, create_time) VALUES(?, ?, NOW())', [uid, user.uid], function(err, rows, fields) {
                      if (!err) {
                        callback(null)
                      } else callback(err)
                    });
                  }], function(err){
                    connection.release();

                    if (err) {
                      console.log(chalk.red(err));
                      // Requeue
                    } else {
                      // Notify user
                      socket.broadcast("userAdd", [from.uid, user.uid], {
                        from: from,
                        user: user
                      });
                    }
                  })
                }
              });
            });
          });
        });
        console.log(chalk.green('User Add Listener subscribed successfully..'));
      });
    }
  }
};