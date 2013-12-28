//handle balloon requests
var Balloon = require('../models/balloon_model');


exports.list = function(req, res){
	Balloon.find(function(err, balloons) {
		result = balloons.map(function(el){
			id = el.getHashID();
			el = el.toObject();
			el.id = id;
			delete el._id;
			delete el.history;
			return el;
		});
		res.send(result);
	});
};

exports.history = function(req, res){
	Balloon.findByID(req.params.id, function(err, balloons){
		if (err) throw err;
		if (balloons.length==1){
			balloons[0].getSimplifiedHistory(function(err, result){
				if (err) throw err;
				res.send(result);
			})
		} else {
			console.log('error (length: '+balloons.length+')');
			res.send({});
		}
	});
};

exports.full_history = function(req, res){
	Balloon.findByID(req.params.id, function(err, balloons){
		if (err) throw err;
		if (balloons.length==1){
			balloons[0].getFullHistory(function(err, result){
				if (err) throw err;
				res.send(result);
			})
		} else {
			console.log('error (length: '+balloons.length+')');
			res.send({});
		}
	});
};


exports.add = function(req, res){
	console.log(req);
	console.log(req.body);
	res.redirect("index.html");
	var balloon = new Balloon({
		name: req.body.name,
		message: req.body.message,
		email: req.body.email,
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
