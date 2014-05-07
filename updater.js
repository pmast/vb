var path = require('path');
var config = require('./config');
var sqlite3 = require("sqlite3").verbose();
var mongoose = require('mongoose');
var async = require('async');

// importing the events
var ew = require('./events/event_worker.js');
require('./events/events.js');

// preparing the mongoose connection
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

// preparing the sqlite DB and prepare the query
var db = new sqlite3.Database('data/weather_data.db');
var query = db.prepare("select case when longitude > 180 then longitude-360 else longitude end as longitude, latitude, speed, direction, time ,forecast from wind where time > datetime('now') and longitude in (?, ?) and latitude in (?, ?) order by time asc, forecast asc, longitude asc, latitude asc limit ?;");


mongoose.connect('mongodb://localhost/vb', function(err){
    if (err) {
        end();
        throw err;
    }
});
var Balloon = require('./models/balloon_model');
var BalloonHistory = require('./models/balloon_history_model');

var earth_radius = 6371*1000;
var ll = require("latlon");

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
    newPos = {'longitude': toDeg(lon2),
        'latitude': toDeg(lat2),
        timestamp: now,
        windspeed: wind.speed,
        winddirection: toDeg(brng)
    };

    var p1 = new ll(balloon.location.latitude, balloon.location.longitude, earth_radius);
    var p2 = new ll(newPos.latitude, newPos.longitude, earth_radius);
    console.log("distance 2: " + p1.rhumbDistanceTo(p2) + " m");

    l = balloon.location;
    balloon.history.push(l.toObject());
    balloon.history = balloon.history.slice(balloon.history.length - config.history_size, balloon.history.length);
    balloon.location = newPos;
    // balloon.history.push(l.toObject());

    balloon.reduceHistory();
    balloon.save(function(err, b, n){
        if (err) throw err;
        bh = new BalloonHistory();
        bh.balloonID = b._id;
        bh.location = b.location.toObject();
        bh.save(function(err, h, n){
            if (err) throw err;
            ew.check(b, cb);
        });

        return console.log(balloon.name + ' saved.');
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
        console.log('hans');
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

    lng1 = lng1%360;
    lng2 = lng2%360;
    console.log([lng1,lng2,lat1,lat2, limit]);

    // console.log(balloon.history.length);
    console.log([lng1,lng2,lat1,lat2, limit]);
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


Balloon.find(function(err, balloons) {
	async.each(balloons, getWind, end);
});

function end(err){
    if (err) throw err;
    query.finalize();
    db.close();

    //mongoose.connection.close();
    mongoose.disconnect();
    ew.close();
    console.log("end function");
}
