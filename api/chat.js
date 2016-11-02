var rabbitmq = require('../utils/rabbitmq');
var express = require('express');
var router = express.Router();
var async = require('async');
var socket = require('../utils/socket');
var mysql = require('../utils/mysql').getPool();

router.get('/user/:uid', function(req, res) {
  var uid = req.session.uid;
  var result;

  var limit = req.query["limit"];
  var limitQuery = '';
  if (limit) limitQuery = ' LIMIT ' + limit;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      async.series([function(callback){
        connection.query('SELECT * FROM (SELECT * FROM chat WHERE (chat_from = ? AND chat_to = ?) OR (chat_from = ? AND chat_to = ?) ORDER BY create_time DESC' + limitQuery + ') X ORDER BY create_time ASC', [uid, req.params["uid"], req.params["uid"], uid], function(err, rows, fields) {
          if (!err) {
            result = rows;
            callback(null)
          } else callback(err)
        });
      }], function(err){
        connection.release();

        if (err) {
          res.status(500);
          res.json({
            error: err.message
          })
        } else {
          res.json({
            chats: result
          });
        }
      })
    }
  })
});

router.get('/group/:gid', function(req, res) {
  var result;

  var limit = req.query["limit"];
  var limitQuery = '';
  if (limit) limitQuery = ' LIMIT ' + limit;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {

      async.series([function(callback){
        connection.query('SELECT * FROM (SELECT * FROM chat WHERE chat_to_group = ? ORDER BY create_time DESC' + limitQuery + ') X ORDER BY create_time ASC', [req.params["gid"]], function(err, rows, fields) {
          if (!err) {
            result = rows;
            callback(null)
          } else callback(err)
        });
      }], function(err){
        connection.release();

        if (err) {
          res.status(500);
          res.json({
            error: err.message
          })
        } else {
          res.json({
            chats: result
          });
        }
      })
    }
  })
});

// Api for chat user
router.post('/user/:uid', function(req, res) {
  var data = {
    body: req.body,
    session: req.session,
    to_uid: req.params.uid
  };
  var connection = rabbitmq.getConnection();
  if (connection) {
    connection.exchange('chat_controller', options = {type: 'direct', confirm: true}, function (exchange) {
      exchange.publish('chat_user', data, options = {}, function(transmissionFailed){
        if (transmissionFailed){
          res.status(500);
          res.json({
            error: 1
          })
        }else{
          res.json({
            success: 1
          })
        }
      })
    });
  }


  //var uid = req.session.uid;
  //
  //mysql.getConnection(function(err, connection){
  //  if (err) {
  //    res.json(err)
  //  } else {
  //    var newChatId, newChat;
  //
  //    async.series([function(callback){
  //      connection.query('INSERT INTO chat(chat_from, chat_to, content, create_time) VALUES(?, ?, ?, NOW())', [uid, req.params.uid, req.body.message], function(err, rows, fields) {
  //        if (!err) {
  //          newChatId = rows.insertId;
  //          callback(null)
  //        } else callback(err)
  //      });
  //    }, function(callback){
  //      connection.query('SELECT * FROM chat WHERE cid = ?', [newChatId], function(err, rows, fields) {
  //        if (!err) {
  //          newChat = rows[0];
  //          callback(null)
  //        } else callback(err)
  //      });
  //    }], function(err){
  //      connection.release();
  //
  //      if (err) {
  //        res.status(500);
  //        res.json({
  //          error: err.message
  //        })
  //      } else {
  //        res.json({
  //          success: 1
  //        });
  //
  //        // Temporary for testing
  //        // socket.broadcast("newFriendChat", [uid, req.params.uid], newChat);
  //      }
  //    })
  //  }
  //})
});

// Api for group chat
router.post('/group/:gid', function(req, res) {
  var data = {
    body: req.body,
    session: req.session,
    to_gid: req.params.gid
  };
  var connection = rabbitmq.getConnection();
  if (connection) {
    connection.exchange('chat_controller', options = {type: 'direct', confirm: true}, function (exchange) {
      exchange.publish('chat_group', data, options = {}, function (transmissionFailed) {
        if (transmissionFailed) {
          res.status(500);
          res.json({
            error: 1
          })
        } else {
          res.json({
            success: 1
          })
        }
      })
    });
  }



  //var uid = req.session.uid;
  //
  //mysql.getConnection(function(err, connection){
  //  if (err) {
  //    res.json(err)
  //  } else {
  //    var newChatId, newChat;
  //
  //    async.series([function(callback){
  //      connection.query('INSERT INTO chat(chat_from, chat_to_group, content, create_time) VALUES(?, ?, ?, NOW())', [uid, req.params.gid, req.body.message], function(err, rows, fields) {
  //        if (!err) {
  //          newChatId = rows.insertId;
  //          callback(null)
  //        } else callback(err)
  //      });
  //    }, function(callback){
  //      connection.query('SELECT * FROM chat WHERE cid = ?', [newChatId], function(err, rows, fields) {
  //        if (!err) {
  //          newChat = rows[0];
  //          callback(null)
  //        } else callback(err)
  //      });
  //    }], function(err){
  //      connection.release();
  //
  //      if (err) {
  //        res.status(500);
  //        res.json({
  //          error: err.message
  //        })
  //      } else {
  //        res.json({
  //          success: 1
  //        });
  //
  //        // Temporary for testing
  //        // socket.broadcast("newGroupChat", [uid], newChat);
  //      }
  //    })
  //  }
  //})
});

module.exports = router;