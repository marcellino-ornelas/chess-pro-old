/*
 * node_modules
*/

const http = require('http');
const path = require('path');
const routes = require('./routes');
const jade = require('jade');


const express = require('express');
const app = express();

const port = process.env.PORT || 5000;
/*
 * set app variables
*/

app.engine('jade', jade.__express);
app.set('view engine', 'jade');
app.set('views', 'templates/views');
app.set('port', port);


app.use(function(req,res,next){
	/*
	 * set locals on responce object
	*/
	res.locals.title = 'chess-pro';

	next();
});

app.use(express.static('public'));
app.use(routes)

http.createServer( app ).listen( app.get('port') ,(err) => {
	if (err){
		throw err
	}
	console.log('server running on port ' + app.get('port') );
});
