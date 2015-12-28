var express = require('express');
var router = express.Router();
var User = require('../models/User.js');

router.get('/', function(req, res, next) {
	User.getAllValidUser(function(err, users){
		if (err) {
			console.log(err);
		}
		res.render('index',{
			users: users
		});
	});
});


module.exports = router;


