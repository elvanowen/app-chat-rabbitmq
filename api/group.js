var rabbitmq = require('../utils/rabbitmq');
var express = require('express');
var router = express.Router();
var mysql = require('../utils/mysql').getPool();
var async = require('async');
var randtoken = require('rand-token');

router.post('/add', function(req, res) {
  var user = req.body;
  var connection = rabbitmq.getConnection();

  if (connection) {
    connection.exchange('group_event', options = {type: 'direct', confirm: true}, function (exchange) {
      exchange.publish('group_add_user', user, options = {}, function(transmissionFailed){
        if (transmissionFailed == true){
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
});

router.get('/list/:gid', function(req, res) {
  var uid = req.session.uid;
  var result;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      async.series([function(callback){
        connection.query('SELECT * FROM group_members GM INNER JOIN user U ON GM.uid = U.uid WHERE GM.gid = ?', [req.params['gid']], function(err, rows, fields) {
          if (!err) {
            result = rows;
            callback(null);
          }
          else callback(err)
        });
      }], function(err){
        connection.release();

        if (err) {
          console.log(err);
          res.status(500);
          res.json({
            error: err.message
          })
        } else {
          res.json({
            members: result
          })
        }
      })
    }
  })
});

router.post('/create', function(req, res) {
  var group = req.body.group;
  var users = req.body.users;
  var uid = req.session.uid;

  console.log(req.body);

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      var token = randtoken.generate(16);
      var result;

      async.series([function(callback){
        connection.query('INSERT INTO groups(nama, admin, token) VALUES (?, ?, ?)', [group.nama, uid, token], function(err, rows, fields) {
          if (!err) callback(null);
          else callback(err)
        });
      }, function(callback){
        connection.query('SELECT * FROM groups WHERE token = ?', [token], function(err, rows, fields) {
          if (!err) {
            result = rows.length ? rows[0] : null;
            callback(null)
          } else callback(err)
        });
      }, function(callback){
        var bulkInsertData = [];

        for (var i=0;i<users.length;i++){
          bulkInsertData.push([result.gid, users[i]])
        }

        // Insert self
        bulkInsertData.push([result.gid, uid]);

        connection.query('INSERT INTO group_members(gid, uid) VALUES ?', [bulkInsertData], function(err, rows, fields) {
          if (!err) callback(null);
          else callback(err)
        });
      }], function(err){
        connection.release();

        if (err) {
          console.log(err)
          res.status(500);
          res.json({
            error: err
          })
        } else {
          res.json({
            success: 1
          })
        }
      })
    }
  })
});

router.post('/delete', function(req, res) {
  var group = req.body;
  var uid = req.session.uid;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      async.series([function(callback){
        connection.query('DELETE FROM groups WHERE gid = ? AND admin = ?', [group.gid, uid], function(err, rows, fields) {
          if (!err) callback(null);
          else callback(err)
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
            success: 1
          })
        }
      })
    }
  })
});

router.post('/invite', function(req, res) {
  var group = req.body.group;
  var users = req.body.users;

  console.log(req.body);

  res.json({
    success: 1
  });

  return;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      async.series([function(callback){
        connection.query('INSERT INTO group_members(gid, uid) VALUES(?, ?)', [group.gid, user.uid], function(err, rows, fields) {
          if (!err) callback(null);
          else callback(err)
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
            success: 1
          })
        }
      })
    }
  })
});

router.post('/kick', function(req, res) {
  var group = req.body.group;
  var users = req.body.users;

  console.log(req.body);

  res.json({
    success: 1
  });

  return;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      async.series([function(callback){
        connection.query('DELETE FROM group_members WHERE gid = ? AND uid = ?', [group.gid, user.uid], function(err, rows, fields) {
          if (!err) callback(null);
          else callback(err)
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
            success: 1
          })
        }
      })
    }
  })
});

router.post('/kick', function(req, res) {
  var user = req.body;
  var connection = rabbitmq.getConnection();

  if (connection) {
    connection.exchange('group_event', options = {type: 'direct', confirm: true}, function (exchange) {
      exchange.publish('group_kick_user', user, options = {}, function(transmissionFailed){
        if (transmissionFailed == true){
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
});

module.exports = router;