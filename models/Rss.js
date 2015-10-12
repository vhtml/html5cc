var mongoose = require('./mongodb').mongoose;
var Schema = mongoose.Schema;


var RssSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		unique: true,
		required: true
	},
	category: [{
		title: {
			type: String,
			unique: true,
			required: true,
			trim: true
		},
		alias: {
			type: String,
			unique: true,
			parsed: true,
			trim: true,
			lowercase: true
		},
		list: [{
			title: String,
			rssLink: String
		}]
	}]
});

RssSchema.pre('save', function(next) {

	next();
});

RssSchema.statics = {
	findByUserId: function(userId) {

	}
};

var Rss = new mongoose.model('Rss', RssSchema);
var RssDAO = function() {};
module.exports = new RssDAO();

RssDAO.prototype.save = function(rssJson, cb) {
	var newRss = new Rss(rssJson);
	Rss.findOne({
		userId: rssJson.userId
	}, function(err, rss) {
		if (err) {
			cb(err);
		} else {
			if (!rss) {
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

RssDAO.prototype.getRssByUserId = function(userId){
	Rss.findOne({
		userId: userId
	}, function(err, res) {
		if (err) {
			cb(err);
		} else {
			cb(null, res ? res.category : {});
		}
	});
};