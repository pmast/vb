var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var BalloonSchema = new Schema({
	balloonID: Schema.Types.ObjectId,
	location: {
		longitude: Number,
		latitude: Number,
		timestamp: { type: Date, default: Date.now }
	}
});

module.exports = mongoose.model("History", BalloonSchema);
