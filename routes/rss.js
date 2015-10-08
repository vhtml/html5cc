var express = require('express');
var router = express.Router();
var xml2js = require('xml2js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({});
});

module.exports = router;