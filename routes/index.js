
/*
 * GET home page.
 */

exports.index = function(req, res){
	// res.sendfile('public/index.html');
	res.render('index', { focus: req.params.id });
};