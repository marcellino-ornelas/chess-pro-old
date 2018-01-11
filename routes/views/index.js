const path = require('path');
module.exports = function(req,res){

	const locals = res.locals;

	// res.render('index');
	var filePath = path.resolve('./public/html/main.html');
	
	res.sendFile(filePath);

}