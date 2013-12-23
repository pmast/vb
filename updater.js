var path = require('path');
var sqlite3 = require("sqlite3").verbose();
// var db = new sqlite3.Database(path.join(__dirname, 'weather_data.db'));
var db = new sqlite3.Database('data/weather_data.db');
var async = require('async');
// var query = db.prepare("select * from wind where time > datetime('now') and longitude between ? and ? and latitude between ? and ? order by time asc, forecast asc, longitude asc, latitude asc limit ?;");
var query = db.prepare("select case when longitude > 180 then longitude-360 else longitude end as longitude, latitude, speed, direction, time ,forecast from wind where time > datetime('now') and longitude between ? and ? and latitude between ? and ? order by time asc, forecast asc, longitude asc, latitude asc limit ?;");
// time > datetime('now') and 
// var query = db.prepare("select * from wind where time > '2013-11-08' and longitude between ? and ? and latitude between ? and ? order by time asc, forecast asc, longitude asc, latitude asc limit ?;");
var earth_radius = 6371*1000;

var ll = require("latlon");

var mongoose = require('mongoose');
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});
mongoose.connection.on("error", function(errorObject){
  console.log(errorObject);
});

mongoose.connect('mongodb://localhost/vb');
var Balloon = require('./models/balloon_model');
var BalloonHistory = require('./models/balloon_history_model');

function lerp(a, b, t){
    return a + t * (b-a);
}

function toRad(alpha){
    return alpha * Math.PI / 180;
}

function toDeg(x){
    return x * 180 / Math.PI;
}

function rhumb(balloon, wind, cb){
    var lat1 = toRad(balloon.location.latitude);
    var lon1 = toRad(balloon.location.longitude);
    
    var now = new Date();
    var td = now - balloon.location.timestamp;
    td = td / 1000;
    // correct direction, wind direction is given as the direction from which the wind blows
    // we need where the wind blows to
    brng = toRad((wind.direction + 180) % 360);
    d = wind.speed * td / earth_radius;
    console.log("td: " + td + " seconds");
    console.log("wind: " + wind.speed + " m/s " + wind.direction + " degree");
    console.log("distance 1: " + wind.speed * td + " m");
    var dLat = d * Math.cos(brng);
    var lat2 = lat1 + dLat;
    var dPhi = Math.log(Math.tan(lat2/2+Math.PI/4)/Math.tan(lat1/2+Math.PI/4));
    var q = (isFinite(dLat/dPhi)) ? dLat/dPhi : Math.cos(lat1);  // E-W line gives dPhi=0
    var dLon = d*Math.sin(brng)/q;

    // check for some daft bugger going past the pole, normalise latitude if so
    if (Math.abs(lat2) > Math.PI/2) lat2 = lat2>0 ? Math.PI-lat2 : -Math.PI-lat2;
    lon2 = (lon1+dLon+Math.PI)%(2*Math.PI) - Math.PI;
    newPos = {'longitude': toDeg(lon2), 'latitude': toDeg(lat2), timestamp: now};

    var p1 = new ll(balloon.location.latitude, balloon.location.longitude, earth_radius);
    var p2 = new ll(newPos.latitude, newPos.longitude, earth_radius);
    console.log("distance 2: " + p1.rhumbDistanceTo(p2) + " m");

    l = balloon.location;
    balloon.history.push(l.toObject());
    balloon.location = newPos;

    reduceHistory(balloon, 10, function(balloon){
        balloon.save(function(err, b, n){
            cb();
            if (err){
             return console.log(err);
         } else {
             return console.log(balloon.name + ' saved.');
         }
    })
 });
}

function interpolate(point, row){
    console.log(point);
    console.log(row);
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
        console.log(sp1);
        sp2 = lerp(values[2].speed, values[3].speed, (point.latitude-values[2].latitude)/(values[3].latitude - values[2].latitude));
        console.log(sp2);
        
        dir1 = lerp(values[0].direction, values[1].direction, (point.latitude-values[0].latitude)/(values[1].latitude - values[0].latitude));
        dir2 = lerp(values[2].direction, values[3].direction, (point.latitude-values[2].latitude)/(values[3].latitude - values[2].latitude));
        
        sp = lerp(sp1, sp2, (point.longitude-values[0].longitude)/(values[2].longitude - values[0].longitude));
        console.log(sp);
        dir = lerp(dir1, dir2, (point.longitude-values[0].longitude)/(values[2].longitude - values[0].longitude));
    }
    // console.log({direction: dir, speed: sp});
    return {direction: dir, speed: sp};
}

function test(b, row){
	console.log(b.name);
	console.log(row);
}

function getWind(balloon, cb){
    console.log("processing " + balloon.name);
    location = balloon.location;
    lat1 = Math.floor(location.latitude/0.5)*0.5;
    lat2 = Math.ceil(location.latitude/0.5)*0.5;
    var longitude = (location.longitude < 0 ? location.longitude + 360 : location.longitude);
    lng1 = Math.floor(longitude/0.5)*0.5;
    lng2 = Math.ceil(longitude/0.5)*0.5;
    limit = ((lat1==lat2)?0:1) + ((lng1==lng2)?0:1);
    limit = Math.pow(2, limit);
    console.log([lng1,lng2,lat1,lat2, limit]);

    console.log(balloon.history.length);

    query.all([lng1,lng2,lat1,lat2, limit], function(err, row){
        if (err) throw err;
        console.log(row);
        console.log('hans');
        if (row.length==0){
            console.log('empty wind result');
            cb();
            return;
        }
        rhumb(balloon, interpolate(balloon.location, row), cb);
    });
}

function reduceHistory(balloon, hlength, cb){
    // reduce history by 1
    // call recursively until length of history = n
    // then call call back
    if (balloon.history.length<=hlength){
        cb(balloon);
    } else {
        history_item = balloon.history.shift();
        bh = new BalloonHistory();
        bh.balloonID = balloon._id;
        bh.location = history_item.toObject();
        bh.save(function(err, b, n){
            if (err) throw err;
            reduceHistory(balloon,hlength,cb);
        });
    }
}

// mongoose.disconnect();
// row = [
// {longitude:0, latitude:0, speed: 1, direction: 10},
// {longitude:0, latitude:1, speed: 3, direction: 30},
// {longitude:1, latitude:0, speed: 2, direction: 20},
// {longitude:1, latitude:1, speed: 6, direction: 60}
// ];
// point = {longitude:0.5, latitude:0.5};


// console.log(interpolate(point, row));

Balloon.find(function(err, balloons) {
	async.each(balloons, getWind, function(err){
		if (err) throw err;
		mongoose.disconnect();
	});
});
