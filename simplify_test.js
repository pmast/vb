var s = require('simplify.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vb');
var BalloonHistory = require('./models/balloon_history_model');

history = BalloonHistory.find({balloonID: "52b7ef49218388be10000002"}, 	'location', function(err, items){
	if (err) throw err;
	h = items.map(function(el){
		return el.location;
	});
	console.log(h.length);
	h_s = s(h);
	console.log(h_s.length);
	mongoose.disconnect();
});