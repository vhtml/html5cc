var mongoose = require('./mongodb').mongoose;
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var Rss = require('./Rss');


var UserSchema = new Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		lowercase: true
	},
	password: {
		type: String,
		required: true
	},
	isShow: {
		type: Boolean,
		default: true
	},
	nickname: {
		type: String,
		unique: true,
		required: true
	}, //昵称
	role: {
		type: Number,
		default: 9 //0为最高级别，9为普通级别
	}, //用户角色，权限级别
	gender: { //性别
		type: String,
		enum: ['0', '1', '2'], //0，未知；1，男；2，女
		default: '0'
	},
	birth: Date,
	signature: String, //个性签名
	meta: {
		regIp: String, //注册IP
		regTime: {
			type: Date,
			default: Date.now
		}, //注册时间
		lastIp: String, //最近登录IP
		lastTime: { //最近登录时间
			type: Date,
			default: Date.now
		},
		contribution: Number, //贡献值
		onlineTime: Number, //在线时长 
	}
});

function encrypt(val) {
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(val, salt);
	return hash;
}

//进行存储前验证
UserSchema.pre('save', function(next) {
	//处理邮箱
	if (!/^[a-zA-Z0-9]([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9]{2,3}){1,2})$/.test(this.email)) {
		return next(new Error('邮箱格式错误'));
	}
	//处理密码
	if (!/^[^\s]{6,16}$/.test(this.password)) {
		return next(new Error('密码格式错误'));
	}
	//处理昵称
	if (!/^[\u4e00-\u9fa5\w]{2,18}$/.test(this.nickname)) {
		return next(new Error('昵称格式错误'));
	}
	this.password = encrypt(this.password);
	next();
});

UserSchema.methods = {
	comparePassword: function(password, cb) {
		bcrypt.compare(password, this.password, function(err, isMatch) {
			if (err) {
				cb(err);
			}
			cb(null, isMatch);
		});
	}
};

var User = mongoose.model('User', UserSchema);
var UserDAO = function() {};
module.exports = new UserDAO();

UserDAO.prototype.save = function(userJson, cb) {
	var newUser = new User(userJson);
	User.findOne({
		email: userJson.email
	}, function(err, user) {
		if (err) {
			cb(err);
		} else {
			if (!user) {
				newUser.save(function(err) {
					if (err) {
						console.log('save user:' + err);
						cb(err);
					} else {
						cb(null, false, newUser.get('id'));
					}
				});
			} else {
				cb(null, true);
			}
		}
	});
};

UserDAO.prototype.verifyUser = function(userJson, cb) {
	User.findOne({
		email: userJson.email.toLowerCase()
	}, function(err, user) {
		if (err) {
			cb(err);
			return;
		}
		if (!user) {
			cb(null, null);
			return;
		}
		user.comparePassword(userJson.password, function(err, isMatch) {
			if (err) {
				cb(err);
			} else {
				cb(null, isMatch, user);
			}
		});
	});
};

UserDAO.prototype.getAllUser = function(cb) {
	User.find({}, '-password', function(err, users) {
		if (err) {
			cb(err);
			return;
		}
		cb(null, users);
	});
};

UserDAO.prototype.getAllValidUser = function(cb) {
	User.find({
		isShow: true
	}, '-password', function(err, users) {
		if (err) {
			cb(err);
			return;
		}
		cb(null, users);
	});
};


UserDAO.prototype.getUserById = function(userId, cb) {
	User.findById(userId, '-password', function(err, user) {
		if (err) {
			cb(err);
			return;
		}
		cb(null, user);
	});
};

//删除用户，还要清清除其相关的表结构，并且清除session，用于彻底的删除用户
UserDAO.prototype.removeUser = function(userId, cb) {
	User.remove({
		_id: userId
	}, function(err, result) {
		if (err) {
			cb(err);
			return;
		}
		Rss.removeByUserId(userId, function(err) {
			cb(err);
		});
	});
};
//隐藏用户，用于一般的删除用户
UserDAO.prototype.delUser = function(userId, cb) {
	User.update({
		_id: userId
	}, {
		$set: {
			isShow: false
		}
	}, function(err, raw) {
		if (err) {
			cb(err);
			return;
		}
		cb(null, raw);
	});
};