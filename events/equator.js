ew = require("./event_worker.js");
ew.register(new event());


function event(){
	this.title = "Check for special grid lines";
	this.description = "Checks whether the balloon has corssed the equator";

	this.check = function(b){
		var history = b.history[b.history.length-1];

		if ((history.latitude * b.location.latitude) < 0)
			return "Your balloon just corssed the equator!"

		if ((history.longitude * b.location.longitude) < 0)
			return "Your balloon just crossed the prime meridian!"
		
		return null;
	}
}