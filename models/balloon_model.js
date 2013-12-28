var mongoose = require('mongoose');
var	Schema = mongoose.Schema;
var Simplify = require('simplify.js');
var BalloonHistory = require('./balloon_history_model');
var config = require('../config');

var BalloonSchema = new Schema({
	name: String,
	message: String,
	email: String,
	created: { type: Date, default: Date.now },
	location: {
		longitude: Number,
		latitude: Number,
		timestamp: { type: Date, default: Date.now }
	}
});

function sortHistory(a, b){
	if (a.timestamp < b.timestamp) return -1;
	if (a.timestamp > b.timestamp) return 1;
	return 0;
}

BalloonSchema.methods.getSimplifiedHistory = function (cb) {
	return BalloonHistory.find({balloonID: this._id}, 'location', {sort: {'location.timestamp': 1}}, function(err, items){
		console.log(items.length + " history items");
		h = items.map(function(el){
			return el.location;
		});
		h_s = Simplify(h);
		cb(err, h_s);
	});
}

BalloonSchema.methods.getFullHistory = function (cb) {
	return BalloonHistory.find({balloonID: this._id}, 'location', {sort: {'location.timestamp': 1}}, function(err, items){
		console.log(items.length + " history items");
		items = items.map(function(el){
			return el.location;
		});
		cb(err, items);
	});
}

BalloonSchema.methods.getHashID = function(){
	return config.hashID.encryptHex(this._id.toString());
}

BalloonSchema.statics.findByID = function(id, cb) {
	this.find({ _id: config.hashID.decryptHex(id)}, cb);
}

module.exports = mongoose.model("Balloon", BalloonSchema);
