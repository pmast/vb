ew = require("./event_worker.js");
ew.register(new event());


function event(){
	this.title = "Event tester";
	this.description = "Firing on every call.";

	this.check = function(b){
		history = b.history[b.history.length-1];
		distance = Math.sqrt(
			Math.pow(b.location.longitude - history.longitude, 2) +
			Math.pow(b.location.latitude - history.latitude, 2)
		);
		return "distance traveled since last update: " + distance;
	}
}