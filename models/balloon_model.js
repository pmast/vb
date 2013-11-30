var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var BalloonSchema = new Schema({
	name: String,
	location: {
		longitude: Number,
		latitude: Number,
		timestamp: Date
	},
	history: [{
		longitude: Number,
		latitude: Number,
		timestamp: Date
	}]
});

module.exports = mongoose.model("Balloon", BalloonSchema);