var Hashids = require('hashids');
var config = {};

config.hashID = new Hashids('Virtual balloons are flying the world', 10);

module.exports = config;