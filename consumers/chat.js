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
            connection.exchange('chat_controller', options = {type: 'direct', confirm: true}, function (exchange) {
                connection.queue('chat_user', function (q) {
                    q.bind(exchange, 'chat_user', function(){
                        q.subscribe(function (data) {
                            var message = data.body.message;
                            var uid = data.session.uid;
                            var to_uid = data.to_uid;

                            mysql.getConnection(function(err, connection){
                                if (err) {
                                    console.log(chalk.red(err));
                                } else {
                                    var newChatId, newChat;

                                    async.series([function(callback){
                                        connection.query('INSERT INTO chat(chat_from, chat_to, content, create_time) VALUES(?, ?, ?, NOW())', [uid, to_uid, message], function(err, rows, fields) {
                                            if (!err) {
                                                newChatId = rows.insertId;
                                                callback(null);
                                            }
                                            else callback(err)
                                        });
                                    }, function(callback){
                                        connection.query('SELECT * FROM chat WHERE cid = ?', [newChatId], function(err, rows, fields) {
                                            if (!err) {
                                                newChat = rows[0];
                                                callback(null)
                                            } else callback(err)
                                        });
                                    }], function(err){
                                        connection.release();

                                        if (err) {
                                            console.log(chalk.red(err));
                                            // Requeue message
                                        } else {
                                            // Notify user
                                            socket.broadcast("newFriendChatSelf", [uid], newChat);
                                            socket.broadcast("newFriendChat", [to_uid], newChat);
                                        }
                                    })
                                }
                            })
                        });
                    });
                });
                console.log(chalk.green('New Friend Chat Listener subscribed successfully..'));

                connection.queue('chat_group', function (q) {
                    q.bind(exchange, 'chat_group', function(){
                        q.subscribe(function (data) {
                            var message = data.body.message;
                            var uid = data.session.uid;
                            var to_gid = data.to_gid;

                            mysql.getConnection(function(err, connection){
                                if (err) {
                                    console.log(chalk.red(err));
                                } else {
                                    var newChatId, newChat, members;

                                    async.series([function(callback){
                                        connection.query('INSERT INTO chat(chat_from, chat_to_group, content, create_time) VALUES(?, ?, ?, NOW())', [uid, to_gid, message], function(err, rows, fields) {
                                            if (!err) {
                                                newChatId = rows.insertId;
                                                callback(null)
                                            } else callback(err)
                                        });
                                    }, function(callback){
                                        connection.query('SELECT * FROM chat WHERE cid = ?', [newChatId], function(err, rows, fields) {
                                            if (!err) {
                                                newChat = rows[0];
                                                callback(null)
                                            } else callback(err)
                                        });
                                    }, function(callback){
                                        connection.query('SELECT * FROM group_members WHERE gid = ?', [to_gid], function(err, rows, fields) {
                                            if (!err) {
                                                members = rows;
                                                callback(null)
                                            } else callback(err)
                                        });
                                    }], function(err){
                                        connection.release();

                                        if (err) {
                                            console.log(chalk.red(err));
                                            // Requeue message
                                        } else {
                                            // Notify user
                                            for (var i=0;i<members.length;i++){
                                                socket.broadcast("newGroupChat", [members[i].uid], newChat);
                                            }
                                        }
                                    })
                                }
                            })
                        });
                    });
                });
                console.log(chalk.green('New Group Chat Listener subscribed successfully..'));

            });
        }
    }
};