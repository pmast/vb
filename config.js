var Hashids = require('hashids');
var config = {};

config.hashID = new Hashids('Virtual balloons are flying the world', 10);
config.history_size = 2;

module.exports = config;