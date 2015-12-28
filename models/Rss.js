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
		alias: {
			type: String,
			trim: true,
			lowercase: true
		},
		list: [{
			title: String,
			rssLink: String
		}]
	}],
	meta: {
		defaultCategory: {
			type: String
		}
	}
});

var rssDefault = {
	userId: null,
	category: [{
		title: '我的订阅',
		alias: 'default',
		list: []
	}],
	meta: {
		defaultCategory: 'default'
	}
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

RssDAO.prototype.update = function(rssJson, cb) {

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