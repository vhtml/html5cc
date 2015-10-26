var express = require('express');
var router = express.Router();
var User = require('../models/User.js');
var vv = require('../lib/vv.js');

//用户注册
router.post('/register', function(req, res, next) {
	console.log('register:' + req.body);
	var json = req.body;
	User.save(json, function(err, isExist) {
		if (err) {
			return vv.retServerError(err, res);
		}
		if (isExist) {
			res.json(vv.parse({
				code: 60010,
				message: 'user is existed'
			}));
			return;
		}
		res.json(vv.parse(0));
	});
});

//用户登录
router.post('/login', function(req, res, next) {
	console.log('login:' + JSON.stringify(req.body));
	var json = req.body;
	User.verifyUser(json, function(err, isMatch, user) {
		if (err) {
			return vv.retServerError(err, res);
		}
		if (!isMatch) {
			if (!user) {
				res.json(vv.parse({
					code: 60001,
					message: 'user is not found'
				}));
			} else {
				res.json(vv.parse({
					code: 60002,
					message: 'password is incorrect'
				}));
			}
			return;
		}
		console.log('login_user:' + JSON.stringify(user));
		//保存session
		req.session.user = user;
		req.session.save(function(err) {
			if (err) {
				return vv.retServerError(err, res);
			}
			res.json(vv.parse(0, {
				user: user
			}));
		});
	});
});

//用户登出
router.get('/logout', function(req, res, next) {
	//删除session
	console.log('user_logout:' + JSON.stringify(req.session.user));
	req.session.destroy(function(err) {
		if (err) {
			return vv.retServerError(err, res);
		}
		res.json(vv.parse(0));
	});
});

//用户主页
router.get('/home', function(req, res, next) {
	next();
});
router.get('/home/:reqUserId', function(req, res, next) {
	var reqUserId = req.params.reqUserId;
	User.getUserById(reqUserId, function(err, reqUser) {
		if (err) {
			console.log('get user error' + err);
			return;
		}
		if (!reqUser) {
			next();
			return;
		}
		res.render('user_home', {
			title: reqUser.nickname+' - 个人空间',
			reqUser: reqUser
		});
	});
});

module.exports = router;