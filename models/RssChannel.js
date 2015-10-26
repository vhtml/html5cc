var mongoose = require('./mongodb').mongoose;
var Schema = mongoose.Schema;
var parseString = require('xml2js').parseString;
var http = require('http');

var RssChannelSchema = new Schema({
	rssLink: {
		type: String,
		required: true,
		unique: true
	},
	link: String,
	webTitle: String,
	lastBuildDate: Date,
	pubDate: Date,
	language: String,
	description: String,
	item: [{
		title: String,
		link: String,
		pubDate: Date,
		'dc:creator': String,
		description: String
	}],
	meta: {
		createAt: {
			type: Date,
			default: Date.now
		},
		updateAt: {
			type: Date,
			default: Date.now
		}
	}
},{
	versionKey: false
});

RssChannelSchema.statics = {

};

var RssChannel = mongoose.model('RssChannel', RssChannelSchema);
var RssChannelDAO = function() {};
module.exports = new RssChannelDAO();

RssChannelDAO.prototype.save = function(channelJson) {
	RssChannel.findOne({
		link: channelJson.link
	}, function(err, rssChannel) {
		if (err) {
			console.log('query rssChannel error');
		} else {
			if (!rssChannel) {
				var newRssChannel = new RssChannel(channelJson);
				newRssChannel.save(function(err) {
					if (err) {
						console.log('save rss:' + err);
					}
				});
			} else {
				console.log('rss is existed, and need update'); //改为更新操作
				var _id = rssChannel._id;
				channelJson.meta = rssChannel.meta;
				channelJson.meta.updateAt = Date.now();
				RssChannel.update({
					_id: rssChannel._id
				}, channelJson, function(err) {
					if (err) {
						console.log(err);
						return;
					}
					console.log('update success');
				});
			}
		}
	});
};


RssChannelDAO.prototype.makeRssContent = function(rssLink, cb) {
	var xml = '',
		self = this;
	http.get(rssLink, function(sres) {
		sres.setEncoding('utf8');
		sres.on('data', function(chunk) {
			xml += chunk;
		}).on('end', function() {
			parseString(xml, {
				explicitArray: false,
				ignoreAttrs: true
			}, function(err, rssJson) {
				if (err) {
					console.log('xml parse error come from ' + rssLink);
					cb(err);
				} else {
					try {
						var channel = rssJson.rss.channel;
						channel.rssLink = rssLink;
						self.save(channel);
						cb(null, channel);
					} catch (e) {
						cb(e);
					}
				}
			});
		});
	}).on('error', function(e) {
		console.log('rss get rssLink channel error:' + e.message);
	});
};

RssChannelDAO.prototype.getRssChannel = function(rssLink, cb) {
	RssChannel.findOne({
		rssLink: rssLink
	}, function(err, rss) {
		if (err) {
			cb(err);
		} else {
			cb(null, rss);
		}
	});
};