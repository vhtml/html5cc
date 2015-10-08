var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var bcrypt = require('bcrypt');


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
	nickname: {
		type: String,
		unique: true,
		required: true
	}, //昵称
	role: {
		type: Number,
		default: 0
	}, //用户角色，权限级别
	gender: String, //性别
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
}, {
	versionKey: false
});

function encrypt(val) {
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(val, salt);
	return hash;
}

//进行存储前验证
UserSchema.pre('save', function(next) {
	console.log(this);
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

var User = mongodb.mongoose.model('User', UserSchema);
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
					console.log('save user:' + err);
					cb(err);
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
		} else {
			if (!user) {
				cb(null, null);
			} else {
				user.comparePassword(userJson.password, function(err, isMatch) {
					if (err) {
						cb(err);
					} else {
						cb(null, isMatch, user);
					}
				});
			}
		}
	});
};