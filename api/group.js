var rabbitmq = require('../utils/rabbitmq');
var express = require('express');
var router = express.Router();

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