//handle balloon requests
var Balloon = require('../models/balloon_model');

var moment = require('moment');
var async = require("async");

exports.balloons = function(req, res){
	Balloon.find().sort({"created": -1}).exec(function(err, bs) {
		async.map(bs, prepareBalloon, function(err, bs){
			res.render('admin_balloons', {balloons: bs});
		});
		
	});
};

exports.balloon = function(req, res){
	Balloon.findByID(req.params.id ,function(err, b) {
		b = setDisplayFields(b);
		b.getFullHistory(function(err, items){
			res.render('admin_balloon', {b: b, history: items});
		});
		console.log(b);

	});
}

function prepareBalloon(b, cb){
	b.getFullHistory(function(err, items){
		if (err) cb(err, null);

		var oldLoc = null;
		var dis = 0;

		items.map(function(loc){
			if (oldLoc == null){
				oldLoc = loc;
			} else {
				dis = dis + distance(oldLoc, loc);
				oldLoc = loc;
			}
		});
		dis = dis + distance(oldLoc, b.location);

		b.distance = Math.round(dis*100)/100;
		b.historyLength = items.length;
		b = setDisplayFields(b);
		cb(null, b);
	})
}

function setDisplayFields(b){
	b.linkID = b.getHashID();
	b.d = moment(new Date(b.created)).format('YYYY-MM-DD HH:mm');
	b.d2 = moment(new Date(b.created)).fromNow();

	b.lastUpdate = moment(new Date(b.location.timestamp)).format('YYYY-MM-DD HH:mm');
	b.lastUpdateFromNow = moment(new Date(b.location.timestamp)).fromNow();
	return b;
}


var earthRadius = 6371;

function distance(p1, p2){
	p1 = pRadians(p1);
	p2 = pRadians(p2);

	var d_latitude = p1.latitude - p2.latitude;
	var d_longitude = p1.longitude - p2.longitude;

	var a = Math.pow(Math.sin(d_latitude / 2), 2) + Math.cos(p1.latitude)*Math.pow(Math.sin(d_longitude/2),2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	return c * earthRadius;
}

function radians(alpha){
	return alpha * Math.PI / 180;
}

function pRadians(p){
	return {latitude:radians(p.latitude), longitude:radians(p.longitude)};
}