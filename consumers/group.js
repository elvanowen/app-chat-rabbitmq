var rabbitmq = require('../utils/rabbitmq');
var chalk = require('chalk');
var socket = require('../utils/socket');
var mysql = require('../utils/mysql').getPool();
var async = require('async');
var randtoken = require('rand-token');

module.exports = {
  init: function() {
    var connection = rabbitmq.getConnection();

    if (connection) {
      connection.exchange('group_controller', options = {type: 'direct', confirm: true}, function (exchange) {
        connection.queue('group_invite', function (q) {
          q.bind(exchange, 'group_invite', function(){
            q.subscribe(function (message) {
              var group = message.body.group;
              var users = message.body.users;
              var uid = message.session.uid;

              mysql.getConnection(function(err, connection){
                if (err) {
                  console.log(chalk.red(err));
                } else {
                  async.series([function(callback){
                    var bulkInsertData = [];

                    for (var i=0;i<users.length;i++){
                      bulkInsertData.push([group.gid, users[i]])
                    }

                    connection.query('INSERT INTO group_members(gid, uid) VALUES ?', [bulkInsertData], function(err, rows, fields) {
                      if (!err) callback(null);
                      else callback(err)
                    });
                  }, function(callback){
                    connection.query('SELECT * FROM groups WHERE gid = ?', [group.gid], function(err, rows, fields) {
                      if (!err) {
                        group = rows[0];
                        callback(null);
                      } else callback(err)
                    });
                  }], function(err){
                    connection.release();

                    if (err) {
                      console.log(chalk.red(err));
                      // Requeue message
                    } else {
                      // Notify user
                      socket.broadcast("groupInviteUser", users, {
                        group: group
                      });
                    }
                  })
                }
              })
            });
          });
        });
        console.log(chalk.green('Group Add User Listener subscribed successfully..'));

        connection.queue('group_kick', function (q) {
          q.bind(exchange, 'group_kick', function(){
            q.subscribe(function (message) {
              var group = message.body.group;
              var users = message.body.users;
              var uid = message.session.uid;

              mysql.getConnection(function(err, connection){
                if (err) {
                  console.log(chalk.red(err));
                } else {
                  async.series([function(callback){
                    connection.query('DELETE FROM group_members WHERE gid = ? AND uid = (?)', [group.gid, users.join(' OR ')], function(err, rows, fields) {
                      if (!err) callback(null);
                      else callback(err)
                    });
                  }, function(callback){
                    connection.query('SELECT * FROM groups WHERE gid = ?', [group.gid], function(err, rows, fields) {
                      if (!err) {
                        group = rows[0];
                        callback(null);
                      } else callback(err)
                    });
                  }], function(err){
                    connection.release();

                    if (err) {
                      console.log(chalk.red(err));
                      // Requeue message
                    } else {
                      // Notify user
                      socket.broadcast("groupKickUser", users, {
                        group: group
                      });
                    }
                  })
                }
              })
            });
          });
        });
        console.log(chalk.green('Group Kick User Listener subscribed successfully..'));

        connection.queue('group_create', function(q){
          q.bind(exchange, 'group_create', function(){
            q.subscribe(function(message){
              var group = message.body.group;
              var users = message.body.users;
              var uid = message.session.uid;

              mysql.getConnection(function(err, connection){
                if (err) {
                  console.log(chalk.red(err));
                } else {
                  var token = randtoken.generate(16);

                  async.series([function(callback){
                    connection.query('INSERT INTO groups(nama, admin, token) VALUES (?, ?, ?)', [group.nama, uid, token], function(err, rows, fields) {
                      if (!err) {
                        group.gid = rows.insertId;
                        callback(null);
                      }
                      else callback(err)
                    });
                  }, function(callback){
                    var bulkInsertData = [];

                    for (var i=0;i<users.length;i++){
                      bulkInsertData.push([group.gid, users[i]])
                    }

                    // Insert self
                    bulkInsertData.push([group.gid, uid]);

                    connection.query('INSERT INTO group_members(gid, uid) VALUES ?', [bulkInsertData], function(err, rows, fields) {
                      if (!err) callback(null);
                      else callback(err)
                    });
                  }, function(callback){
                    connection.query('SELECT * FROM groups WHERE gid = ?', [group.gid], function(err, rows, fields) {
                      if (!err) {
                        group = rows[0];
                        callback(null);
                      } else callback(err)
                    });
                  }], function(err){
                    connection.release();

                    if (err) {
                      console.log(chalk.red(err));
                      // Requeue message
                    } else {
                      // Notify user
                      socket.broadcast("newGroupCreated", [uid], message.body);
                      socket.broadcast("groupInviteUser", users, message.body);
                    }
                  })
                }
              })
            });
          })
        });
        console.log(chalk.green('Group Create Listener subscribed successfully..'));
      });
    }
  }
};