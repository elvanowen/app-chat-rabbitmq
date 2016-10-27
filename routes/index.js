var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.uid) {
    res.locals.uid = req.session.uid;
    res.render('index');
  } else {
    res.redirect('/login');
  }
});

module.exports = router;
