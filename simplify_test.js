var s = require('simplify.js');

var mongoose = require('mongoose');
var BalloonHistory = require('./models/balloon_history_model');

history = BalloonHistory.find({balloonID: "52ad7db2c2132bc239000002"},function(err, items){
	if (err) throw err;
	console.log(items);
	console.log("peter");
});
console.log('haus');
//h2 = history.map(function(el){
//	return el.location;
//});
//console.log(h2.length)
//h2_simplified = s(l);
//console.log(h2_simplified.length);
