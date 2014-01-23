var mongoose = require('mongoose');
var	Schema = mongoose.Schema;
var Location = require('./location_model');


var BalloonSchema = new Schema({
	balloonID: Schema.Types.ObjectId,
	location: Location
});



module.exports = mongoose.model("History", BalloonSchema);
