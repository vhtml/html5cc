var mongoose = require('./mongodb').mongoose;
var Schema = mongoose.Schema;

var RssSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		unique: true,
		required: true
	},
	category: [{
		title: { //default 我的订阅
			type: String,
			required: true,
			trim: true
		},
		list: [{
			rssLink: String,
			title: String
		}],
		isDefault: {
			type: Boolean,
			default: false
		}
	}]
});

var rssDefault = {
	userId: null,
	category: [{
		title: '我的订阅',
		list: [],
		isDefault: true
	}],
	defaultCategory: '我的订阅'
};


RssSchema.statics = {

};

var Rss = mongoose.model('Rss', RssSchema);
var RssDAO = function() {};
module.exports = new RssDAO();

RssDAO.prototype.setDefault = function(userId, cb) {
	Rss.findOne({
		userId: userId
	}, function(err, rss) {
		if (err) {
			cb(err);
		} else {
			if (!rss) {
				rssDefault.userId = userId;
				var newRss = new Rss(rssDefault);
				newRss.save(function(err) {
					console.log('save rss:' + err);
					cb(err);
				});
			} else {
				cb(null, true);
			}
		}
	});
};

RssDAO.prototype.addRss = function(rssJson, cb) {
	Rss.update({
		userId: rssJson.userId,
		"category._id": rssJson.rssCategory,
		"category.list.rssLink": {
			"$ne": rssJson.rss.rssLink
		}
	}, {
		$push: {
			"category.$.list": rssJson.rss
		}
	}, function(err, result) {
		cb(err, result);
	});
};

RssDAO.prototype.addCategory = function(rssJson, cb) {
	Rss.update({
		userId: rssJson.userId,
		'category.title': {
			"$ne": rssJson.newCategory
		}
	}, {
		$push: {
			"category": {
				title: rssJson.newCategory,
				list: []
			}
		}
	}, function(err, result) {
		cb(err, result);
	});
};

RssDAO.prototype.removeRssItem = function(userId, cb) {
	Rss.update({
		userId: rssJson.userId,
		"category._id": rssJson.rssCategory
	}, {
		$pull: {
			"category.$.list": {
				rssLink: rssJson.rssLink
			}
		}
	});
};

RssDAO.prototype.removeByUserId = function(userId, cb) {
	Rss.remove({
		userId: userId
	}, function(err, result) {
		cb(err);
	});
};

RssDAO.prototype.getRssByUserId = function(userId, cb) {
	Rss.findOne({
		userId: userId
	}, function(err, res) {
		cb(err, res);
	});
};