var express = require('express');
var router = express.Router();
var async = require('async');
var User = require('../models/User.js');
var Rss = require('../models/Rss.js');
var vv = require('../lib/vv.js');

//用户注册
router.post('/register', function(req, res, next) {
	console.log('register:' + req.body);
	var json = req.body;
	User.save(json, function(err, isExist, userId) {
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
		//注册成功，补充完整用户必备信息表
		Rss.setDefault(userId, function() {
			res.json(vv.parse(0));
		});
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

//彻底删除用户
router.post('/remove', function(req, res, next) {
	var currentUser = req.session.user;
	if (currentUser.role === 0) {
		var userId = req.body.user;
		if (userId) {
			User.removeUser(userId, function(err) {
				if (err) {
					return vv.retServerError(err, res);
				} else {
					res.json(vv.parse(0));
				}
			});
		} else {
			res.json(vv.parse({
				code: 60001,
				message: 'args is incorrect'
			}));
		}
	} else {
		next();
	}
});

//普通删除用户
router.post('/delete', function(req, res, next) {
	var currentUser = req.session.user;
	if (currentUser.role === 0) {
		var userId = req.body.user;
		if (userId) {
			User.delUser(userId, function(err) {
				if (err) {
					return vv.retServerError(err, res);
				} else {
					res.json(vv.parse(0));
				}
			});
		} else {
			res.json(vv.parse({
				code: 60001,
				message: 'args is incorrect'
			}));
		}
	} else {
		next();
	}
});

//用户主页
router.get('/home', function(req, res, next) {
	var user = req.session.user;
	if (user) {
		var userId = user._id;
		res.redirect('/user/home/' + userId);
		return;
	}
	res.redirect('/');
});
router.get('/home/:hostUserId', function(req, res, next) {
	var hostUserId = req.params.hostUserId;
	async.series({
		hostUser: function(cb) {
			User.getUserById(hostUserId, function(err, hostUser) {
				cb(err, hostUser);
			});
		},
		rss: function(cb) {
			//查询该用户RSS分类
			Rss.getRssByUserId(hostUserId, function(err, rss) {
				cb(err, rss);
			});
		}
	}, function(err, results) {
		if (err) next(err);
		res.render('user_home', {
			title: results.hostUser.nickname + ' - 个人空间',
			hostUser: results.hostUser,
			rss: results.rss
		});
	});

});

module.exports = router;