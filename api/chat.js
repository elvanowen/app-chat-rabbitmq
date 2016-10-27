var rabbitmq = require('../utils/rabbitmq');
var express = require('express');
var router = express.Router();
var async = require('async');
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
            error: err.message()
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
            error: err.message()
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

router.post('/user/:uid', function(req, res) {
  var uid = req.session.uid;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      var result;

      async.series([function(callback){
        connection.query('INSERT INTO chat(chat_from, chat_to, content, create_time) VALUES(?, ?, ?, NOW())', [uid, req.params.uid, req.body.message], function(err, rows, fields) {
          if (!err) {
            callback(null)
          } else callback(err)
        });
      }], function(err){
        connection.release();

        if (err) {
          res.status(500);
          res.json({
            error: err.message()
          })
        } else {
          res.json({
            success: 1
          });
        }
      })
    }
  })
});

router.post('/group/:gid', function(req, res) {
  var uid = req.session.uid;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      async.series([function(callback){
        connection.query('INSERT INTO chat(chat_from, chat_to_group, content, create_time) VALUES(?, ?, ?, NOW())', [uid, req.params.gid, req.body.message], function(err, rows, fields) {
          if (!err) {
            callback(null)
          } else callback(err)
        });
      }], function(err){
        connection.release();

        if (err) {
          res.status(500);
          res.json({
            error: err.message()
          })
        } else {
          res.json({
            success: 1
          });
        }
      })
    }
  })
});

module.exports = router;