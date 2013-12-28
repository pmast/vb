var async = require('async');

var mongoose = require('mongoose');
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});
mongoose.connection.on("error", function(errorObject){
  console.log(errorObject);
});

mongoose.connect('mongodb://localhost/vb');
var Balloon = require('./models/balloon_model');
var BalloonHistory = require('./models/balloon_history_model');

// find one with item for that balloon and that timestamp
// keep the item
// remove all items with tha same balloondid, longitude, latitude and timestamp but different ids
function rm(balloon, date, cb3){
	BalloonHistory.findOne({balloonID: balloon._id, 'location.timestamp': date}, function(err, keep){
			console.log('keep: ' + keep);
    		BalloonHistory.remove({
    			balloonID: balloon._id,
    			'location.timestamp': date,
			_id: {$ne: keep._id},
			'location.longitude': keep.location.longitude,
			'location.latitude': keep.location.latitude
    		}, function(err){
    			if (err) throw err;
    			console.log('removed: ' + balloon.id + ", " + date);
    			cb3();
    		});
    	});
}

// for every balloon
// get all distinct timestamps
// go and remove all dublicates for that balloon id and the timestamps
function clean(balloon, cb){
	BalloonHistory.find({balloonID: balloon._id}).distinct('location.timestamp', function(error, ids) {
    	console.log(ids[0]);
    	async.each(ids, function(el, cb2){
    		rm(balloon, el, cb2);
    	}, function(err){
    		if (err) throw err;
    		console.log('hans');
    		cb()
    	})
    	
	});
}

Balloon.find(function(err, balloons){
	if (err) throw err;
	// console.log(balloons);
	async.each(balloons, clean, function(err){
		if (err) throw err;
		mongoose.disconnect();
	});
});
