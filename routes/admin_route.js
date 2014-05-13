//handle balloon requests
var Balloon = require('../models/balloon_model');
var moment = require('moment');

exports.balloons = function(req, res){
	Balloon.find(function(err, bs) {
		bs = bs.map(function(b){
			b.linkID = b.getHashID();
			b.d = moment(new Date(b.created)).format('YYYY-MM-DD HH:mm');
			b.d2 = moment(new Date(b.created)).fromNow();
			return b
		});
		res.render('admin_balloons', {balloons: bs, domain: req.headers.host});
	});
};

