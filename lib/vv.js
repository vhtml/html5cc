var vv = {
	parse: function(meta, data) {
		meta = meta === 0 ? {
			code: 0,
			message: 'OK'
		} : meta;
		data = !data ? {} : data;
		return {
			meta: meta,
			data: data
		};
	},
	getUser: function(user){
		var rUser = JSON.parse(JSON.stringify(user)); 
		delete rUser._id;
		delete rUser.password;
		delete rUser.role;
		return rUser;
	},
	retServerError: function(err, res){
		return res.json(this.parse({
			code: 500,
			message: 'server err'
		}));
	}
};

module.exports = vv;