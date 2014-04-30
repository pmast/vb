ew = require("./event_worker.js");
ew.register(new event());


function event(){
	this.title = "Check for grid lines";
	this.description = "Checks whether the balloon has corssed any grid line";

	this.check = function(b){
		var history = b.history[b.history.length-1];

		if (Math.floor(history.latitude) != Math.floor(b.location.latitude))
			return "Your balloon just crossed " + Math.max(Math.floor(history.latitude), Math.floor(b.location.latitude)) + " latitude.";

		if (Math.floor(history.longitude) != Math.floor(b.location.longitude))
			return "Your balloon just crossed the "+Math.max(Math.floor(history.longitude), Math.floor(b.location.longitude))+" meridian.";
		
		return null;
	}
}