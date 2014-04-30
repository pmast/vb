var nodemailer = require('nodemailer');
var credentials = require('./mail.config');

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
	service: "Gmail",
    auth: credentials
});

function EventWorker(){
  // console.log("init event worker");
	this.events = [];

	this.init = function(){
		console.log('initing');
	};

	this.register = function(e){
		this.events.push(e);
	};

	this.getEvents = function(){
		return this.events;
	};

	this.check = function(balloon, cb){
		// console.log(balloon);
		if (!balloon.events || balloon.events == false){
			cb();
			return;
		}
		results = [];
		this.events.forEach(function(event){
			console.log("checking event %s", event.title);
			results.push(event.check(balloon));
		});
		console.log("results for balloon %s: %s", balloon.name, results);
		this.mailEvents(balloon, results, cb);
	};

	this.mailEvents = function(b, events, cb){
		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: "Virtual Balloon <virtualballoonQgmail.com>", // sender address
		    to: b.email, // list of receivers
		    subject: "News from your balloon", // Subject line
		    generateTextFromHTML: true,
		    html: events.join("<br>") + '<br><br><a href="http://www.to-infinity-and-beyond.com/#' + b.getHashID() + '">link to your balloon</a>'
		};

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(error, response){
		    if(error){
		        console.log(error);
		        cb();
		    }else{
		        console.log("Message sent: " + response.message);
		        cb();
		    }

		});
	};

	this.close = function(){
		smtpTransport.close(); // shut down the connection pool, no more messages 
	};
};


module.exports = new EventWorker();