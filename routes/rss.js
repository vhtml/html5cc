var express = require('express');
var router = express.Router();
var RssChannel = require('../models/RssChannel.js');
var Rss = require('../models/Rss.js');
var vv = require('../lib/vv.js');


router.get('/', function(req, res, next) {
	var rssLink = req.query.rssLink;
	if (rssLink) {
		RssChannel.getRssChannel(rssLink, function(err, rss) {
			if (err) {
				return vv.retServerError(err, res);
			}
			if (!rss) {
				makeRssContent(rssLink, res);
			} else {
				//如果已存在，判断是否应该更新了，上次更新时间在该整点前可更新
				if (checkUpdateTime(rss.meta.updateAt)) {
					makeRssContent(rssLink, res);
				} else {
					res.json(vv.parse(0, {
						rss: rss
					}));
				}
			}
		});
	} else {
		res.json(vv.parse({
			code: 403,
			message: 'arguments is incorrect'
		}));
	}
});

//添加订阅
router.post('/add', function(req, res, next){
	var user = req.session.user;
	var rssLink = req.body.rssLink;
	if(!user){
		res.json(vv.parse({
			code: 401,
			message: 'login required'
		}));
		return;
	}
	//存储Rss

});

//用户订阅列表
router.get('/list/:userId', function(req, res, next) {

});


module.exports = router;

function checkUpdateTime(lastUpdateTime) {
	//计算当前时间的整点时间戳
	var integralTime = new Date();
	integralTime.setMinutes(0);
	integralTime.setSeconds(0);
	integralTime.setMilliseconds(0);
	return lastUpdateTime <= integralTime;
}

function makeRssContent(rssLink, res) {
	RssChannel.makeRssContent(rssLink, function(err, channel) {
		if (err) {
			console.log(err);
			res.json(vv.parse({
				code: 600100,
				message: 'xml parse error from ' + rssLink
			}));
			return;
		}
		res.json(vv.parse(0, {
			rss: channel
		}));
	});
}