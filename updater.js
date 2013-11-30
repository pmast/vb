var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database('weather_data');
var async = require('async');
// var query = db.prepare("select * from wind where time > datetime('now') and longitude between ? and ? and latitude between ? and ? order by time asc, forecast asc, longitude asc, latitude asc limit ?;");
var query = db.prepare("select * from wind where time > '2013-11-08' and longitude between ? and ? and latitude between ? and ? order by time asc, forecast asc, longitude asc, latitude asc limit ?;");
var earth_radius = 6371*1000;

var ll = require("latlon");

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vb');
var Balloon = require('./models/balloon_model');

function lerp(a, b, t){
    return a + t * (b-a);
}

function toRad(alpha){
    return alpha * Math.PI / 180;
}

function toDeg(x){
    return x * 180 / Math.PI;
}

function rhumb(balloon, wind){
    var lat1 = toRad(balloon.location.latitude);
    var lon1 = toRad(balloon.location.longitude);
    
    var now = new Date();
    var td = now - balloon.location.timestamp;
    td = td / 1000;
    brng = toRad(wind.direction);
    d = wind.speed * td / earth_radius;
    var dLat = d * Math.cos(brng);
    var lat2 = lat1 + dLat;
    var dPhi = Math.log(Math.tan(lat2/2+Math.PI/4)/Math.tan(lat1/2+Math.PI/4));
    var q = (isFinite(dLat/dPhi)) ? dLat/dPhi : Math.cos(lat1);  // E-W line gives dPhi=0
    var dLon = d*Math.sin(brng)/q;

    // check for some daft bugger going past the pole, normalise latitude if so
    if (Math.abs(lat2) > Math.PI/2) lat2 = lat2>0 ? Math.PI-lat2 : -Math.PI-lat2;
    lon2 = (lon1+dLon+Math.PI)%(2*Math.PI) - Math.PI;
    newPos = {'longitude': toDeg(lon2), 'latitude': toDeg(lat2), timestamp: now};

    // console.log('old: ' + balloon.location);
    // console.log(newPos);
    var p1 = new ll(balloon.location.latitude, balloon.location.longitude, earth_radius);
    var p2 = new ll(newPos.latitude, newPos.longitude, earth_radius);

    // console.log('wind:     ' + wind.speed);
    // console.log('distance: ' + p1.rhumbDistanceTo(p2)/1000);
    l = balloon.location;
    console.log(l);
    balloon.history.push(l);
    balloon.history.push('help');
    balloon.location = newPos;
    console.log(balloon);
    balloon.save(function(err){
		if (err){
			return console.log(err);
		} else {
			return console.log('baloon saved.');
		}
	});
	console.log("peter");
}

function interpolate(point, row){
	values = row;
    if (values.length==1){
        console.log("1 result");
        sp = values[0].speed;
        dir = values[0].direction;
    } else if (values.length==2){
        console.log("2 results");
        if (values[0].latitude == values[1].latitude){
            sp = lerp(values[0].speed, values[1].speed, (point.longitude-values[0].longitude)/(values[1].longitude - values[0].longitude));
            dir = lerp(values[0].direction, values[1].direction, (point.longitude-values[0].longitude)/(values[1].longitude - values[0].longitude));
        } else {
            sp = lerp(values[0].speed, values[1].speed, (point.latitude-values[0].latitude)/(values[1].latitude - values[0].latitude));
            dir = lerp(values[0].direction, values[1].direction, (point.longitude-values[0].longitude)/(values[1].longitude - values[0].longitude));
        }
    } else if (values.length==4){
        console.log("4 results");
        
        sp1 = lerp(values[0].speed, values[1].speed, (point.latitude-values[0].latitude)/(values[1].latitude - values[0].latitude));
        sp2 = lerp(values[2].speed, values[3].speed, (point.latitude-values[2].latitude)/(values[3].latitude - values[2].latitude));
        
        dir1 = lerp(values[0].direction, values[1].direction, (point.latitude-values[0].latitude)/(values[1].latitude - values[0].latitude));
        dir2 = lerp(values[2].direction, values[3].direction, (point.latitude-values[2].latitude)/(values[3].latitude - values[2].latitude));
        
        sp = lerp(sp1, sp2, (point.longitude-values[0].longitude)/(values[2].longitude - values[0].longitude));
        dir = lerp(dir1, dir2, (point.longitude-values[0].longitude)/(values[2].longitude - values[0].longitude));
    }
    return {direction: dir, speed: sp};
}

function test(b, row){
	console.log(b.name);
	console.log(row);
}

function getWind(balloon){
	location = balloon.location;
    lat1 = Math.floor(location.latitude/0.5)*0.5;
    lat2 = Math.ceil(location.latitude/0.5)*0.5;
    lng1 = Math.floor((location.longitude+180)/0.5)*0.5;
    lng2 = Math.ceil((location.longitude+180)/0.5)*0.5;
    limit = ((lat1==lat2)?0:1) + ((lng1==lng2)?0:1);
    limit = Math.pow(2, limit);
    query.finalize(function(){
        query.all([lng1,lng2,lat1,lat2, limit], function(err, row){
        	console.log("row:");
        	console.log(row);
        	console.log("--------------------");
        	if (err) throw err;
        	rhumb(balloon, interpolate(balloon.location, row));
        	console.log("hier");
            console.log(row);
            db.close();
        });
    });
}

Balloon.find(function(err, balloons) {
	getWind(balloons[0]);
	console.log("haus");
	// async.each(balloons, getWind, function(err){
	// 	if (err) throw err;
	// 	console.log('peter');
	// 	// mongoose.connection.close();
	// });
});