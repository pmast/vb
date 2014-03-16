var mongoose = require('mongoose');
var	Schema = mongoose.Schema;
var Location = require('./location_model');


var BalloonSchema = new Schema({
	balloonID: { type: Schema.Types.ObjectId, index: true },
	location: Location
});



module.exports = mongoose.model("History", BalloonSchema);
