var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var balloon = require('./routes/balloon_route');
var admin = require('./routes/admin_route');
var http = require('http');
var path = require('path');
// var swig = require('swig');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vb');

var app = express();

// app.engine('html', swig.renderFile);

// all environments
app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.compress());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/users', user.list);
app.get('/balloons', balloon.list);
app.get('/balloon/:id/history', balloon.history);
app.get('/balloon/:id/full_history', balloon.full_history);
app.get('/balloon/:id', balloon.show);
app.post('/balloon/add', balloon.add);
app.post('/balloon/delete', balloon.add);
app.get('/admin/balloons', admin.balloons);
app.get('/admin/balloon/:id', admin.balloon);
app.get('/test', function(req, res){
	res.render('index', { title: 'Express' });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
