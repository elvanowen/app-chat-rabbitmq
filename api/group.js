var rabbitmq = require('../utils/rabbitmq');
var express = require('express');
var router = express.Router();
var mysql = require('../utils/mysql').getPool();
var async = require('async');

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
  var data = {
    body: req.body,
    session: req.session
  };
  var connection = rabbitmq.getConnection();

  if (connection) {
    connection.exchange('group_controller', options = {type: 'direct', confirm: true}, function (exchange) {
      exchange.publish('group_create', data, options = {}, function(transmissionFailed){
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
});

router.post('/invite', function(req, res) {
  var data = {
    body: req.body,
    session: req.session
  };
  var connection = rabbitmq.getConnection();

  if (connection) {
    connection.exchange('group_controller', options = {type: 'direct', confirm: true}, function (exchange) {
      exchange.publish('group_invite', data, options = {}, function(transmissionFailed){
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
});

router.post('/kick', function(req, res) {
  var data = {
    body: req.body,
    session: req.session
  };
  var connection = rabbitmq.getConnection();

  if (connection) {
    connection.exchange('group_controller', options = {type: 'direct', confirm: true}, function (exchange) {
      exchange.publish('group_kick', data, options = {}, function(transmissionFailed){
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
});

module.exports = router;