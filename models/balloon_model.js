var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var BalloonSchema = new Schema({
	name: String,
	message: String,
	email: String,
	created: { type: Date, default: Date.now },
	location: {
		longitude: Number,
		latitude: Number,
		timestamp: { type: Date, default: Date.now }
	},
	history: [{
		longitude: Number,
		latitude: Number,
		timestamp: Date
	}]
});

module.exports = mongoose.model("Balloon", BalloonSchema);
