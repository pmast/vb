var s = require('simplify.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vb');
var Balloon = require('./models/balloon_model');
	
Balloon.find({name:"Patrick's ballon"}, function(err, bs){
	if (err) throw err;
	console.log(bs.length);
	// bs[0].poops();
	console.log(bs[0].getHashID());
	bs[0].getSimplifiedHistory(function(err, h_s){
		console.log(h_s.length);
		console.log(h_s);
		mongoose.disconnect();
	});
});