var rabbitmq = require('../utils/rabbitmq');
var express = require('express');
var router = express.Router();
var app = require('../app').app;
var mysql = require('../utils/mysql').getPool();
var randtoken = require('rand-token');
var userConsumer = require('../consumers/user');
var async = require('async');

// Api for new user registration
router.post('/register', function(req, res) {
  var user = req.body;

  mysql.getConnection(function(err, connection){
    if (err) {
       res.json(err)
    } else {
      var token = randtoken.generate(16);
      var result;

      async.series([function(callback){
        var rand = Math.floor(Math.random() * (3 - 1) + 1);
        connection.query('INSERT INTO user(username, password, token, photo) VALUES(?, ?, ?, ?)', [user.username, user.password, token, 'http://bootdey.com/img/Content/user_' + rand + '.jpg'], function(err, rows, fields) {
          if (!err) callback(null);
          else callback(err)
        });
      }, function(callback){
        connection.query('SELECT * FROM user WHERE token = ?', [token], function(err, rows, fields) {
          if (!err) {
            result = rows ? rows[0] : null;
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
          res.json(result)
        }
      })
    }
  })
});

// Api for user login
router.post('/login', function(req, res) {
  var user = req.body;

  mysql.getConnection(function(err, connection){
    if (err) {
       res.json(err)
    } else {
      var result;

      async.series([function(callback){
        connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [user.username, user.password], function(err, rows, fields) {
          if (!err) {
            result = rows ? rows[0] : null;

            if (result) {
              req.session.uid = result.uid;
              req.session.username = result.username;
              req.session.token = result.token;
            }

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
        } else if (!result) {
          res.status(400);
          res.json({
            error: 'Username atau password tidak sesuai'
          })
        } else {
          res.json(result);
          // userConsumer.initChat(result)
        }
      })
    }
  })
});

// Api for user logout
router.get('/logout', function(req, res) {
  req.session.destroy(function(err){
    if (err) {
      res.status(500);
    } else {
      res.redirect('/')
    }
  });
});

// Get user data by uid
router.get('/uid/:uid', function(req, res) {
  var uid = req.params.uid;
  var result;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      var result;

      async.series([function(callback){
        connection.query('SELECT * FROM user WHERE uid = ?', [uid], function(err, rows, fields) {
          if (!err) {
            result = rows[0];
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
          res.json(result);
        }
      })
    }
  })
});

// Get user own data
router.get('/me', function(req, res) {
  var uid = req.session.uid;
  var result;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      var result;

      async.series([function(callback){
        connection.query('SELECT * FROM user WHERE uid = ?', [uid], function(err, rows, fields) {
          if (!err) {
            result = rows[0];
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
            me: result
          });
        }
      })
    }
  })
});

// List a user's friends
router.get('/friends', function(req, res) {
  var uid = req.session.uid;
  var result;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      var result;

      async.series([function(callback){
        connection.query('SELECT * FROM user_friend UF INNER JOIN user U ON UF.fid = U.uid WHERE UF.uid = ?', [uid, uid], function(err, rows, fields) {
          if (!err) {
            result = rows;
            callback(null)
          } else callback(err)
        });
      }, function(callback){
        connection.query('SELECT * FROM user_friend UF INNER JOIN user U ON UF.uid = U.uid WHERE UF.fid = ?', [uid, uid], function(err, rows, fields) {
          if (!err) {
            result = result.concat(rows);
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
            friends: result
          });
        }
      })
    }
  })
});

// List a user's groups
router.get('/groups', function(req, res) {
  var uid = req.session.uid;
  var result;

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      var result;

      async.series([function(callback){
        connection.query('SELECT * FROM group_members GM INNER JOIN groups G ON GM.gid = G.gid WHERE GM.uid = ?', [uid], function(err, rows, fields) {
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
            groups: result
          });
        }
      })
    }
  })
});

// Api for user add friend
router.post('/add', function(req, res) {
  var username = req.body.username;
  var uid = req.session.uid;

  console.log(req.body);

  mysql.getConnection(function(err, connection){
    if (err) {
      res.json(err)
    } else {
      var result;

      async.series([function(callback){
        connection.query('SELECT * FROM user WHERE username = ?', [username], function(err, rows, fields) {
          if (!err) {
            result = rows.length ? rows[0] : null;

            if (result) callback(null);
            else callback(new Error('User tidak ditemukan..'))
          } else callback(err)
        });
      }, function(callback){
        connection.query('INSERT INTO user_friend(uid, fid, create_time) VALUES(?, ?, NOW())', [uid, result.uid], function(err, rows, fields) {
          if (!err) {
            callback(null)
          } else callback(err)
        });
      }], function(err){
        connection.release();

        if (err) {
          res.status(400);
          res.json({
            error: err.message
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