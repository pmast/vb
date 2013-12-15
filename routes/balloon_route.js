//handle balloon requests

var Balloon = require('../models/balloon_model');


exports.list = function(req, res){
	Balloon.find(function(err, threads) {
		res.send(threads);
	});
};

exports.show = function(req, res){
	Balloon.find({name:req.params.name},function(err, threads) {
		res.send(threads);
	});
};

exports.add = function(req, res){
	console.log(req);
	console.log(req.body);
	res.redirect("map.html");
	var balloon = new Balloon({
		name: req.body.name,
		message: req.body.message,
		location: {
			longitude: req.body.longitude,
			latitude: req.body.latitude
		},
	});
	balloon.save(function(err){
		if (err){
			return console.log(err);
		} else {
			return console.log('created new baloon');
		}
	});
};
