var LocationSchema = {
		longitude: Number,
		latitude: Number,
		timestamp: { type: Date, default: Date.now },
		windspeed: Number,
		winddirection: Number
};

module.exports = LocationSchema;