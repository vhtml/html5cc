var mongoose = require('./mongodb').mongoose;
var Schema = mongoose.Schema;


var RssSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		unique: true,
		required: true
	},
	category: [Schema.Types.Mixed]
});

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