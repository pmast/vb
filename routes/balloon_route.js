//handle balloon requests
var Balloon = require('../models/balloon_model');
var BalloonHistory = require('../models/balloon_history_model');


exports.list = function(req, res){
	Balloon.find(function(err, balloons) {
		result = balloons.map(function(el){
			id = el.getHashID();
			el = el.toObject();
			el.id = id;
			delete el._id;
			delete el.history;
			delete el.email;
			return el;
		});
		res.send(result);
	});
};

exports.show = function(req, res){
	Balloon.findByID(req.params.id, function(err, balloons){
		if (err) throw err;
		res.send(balloons);
	});
};

exports.history = function(req, res){
	Balloon.findByID(req.params.id, function(err, balloon){
		if (err) throw err;
		balloon.getSimplifiedHistory(function(err, result){
			if (err) throw err;
			res.send(result);
		});
	});
};

exports.full_history = function(req, res){
	Balloon.findByID(req.params.id, function(err, balloon){
		if (err) throw err;
		balloon.getFullHistory(function(err, result){
			if (err) throw err;
			res.send(result);
		});
	});
};


exports.add = function(req, res){
	console.log(req);
	console.log(req.body);
	var balloon = new Balloon({
		name: req.body.name,
		message: req.body.message,
		color: req.body.color,
		email: req.body.email,
		location: {
			longitude: req.body.longitude,
			latitude: req.body.latitude
		},
	});
	balloon.save(function(err, b){
		if (err){
			res.redirect("index.html");
			return console.log(err);
		} else {
			res.redirect("index.html?new=true#" + b.getHashID());
			var bh = new BalloonHistory({
				balloonID: b._id,
				location: b.location.toObject()
			});
			bh.save(function(err){
				if (err) throw err;
				return console.log('created new baloon');
			});
			
		}
	});
};
