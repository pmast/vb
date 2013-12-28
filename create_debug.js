var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vb');
console.log("peter");

var Balloon = require('./models/balloon_model');

b = new Balloon({
	name: "Patrick's ballon",
	location: {
		longitude: -0.3,
		latitude: 53.23,
		timestamp: new Date()
	}
});
b.save(function(err){
	if (err) throw err;
	console.log("balloon succesfully created");
	mongoose.connection.close();
});