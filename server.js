#!/usr/bin/env node

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var useTLSEncryption = true;
var port = 8888;
var app = express();
/*var server = app.listen(8888, function () {
  console.log('Ironball listening on port 8888!');
});*/
if (useTLSEncryption){
	var https = require('https');
	var fs = require('fs');
	var key = fs.readFileSync('tls/privkey.pem');
	var cert = fs.readFileSync( 'tls/cert.pem' );
	var options = {
		key: key,
		cert: cert
	};

	var server = https.createServer(options, app).listen(port, function () {
		console.log('Ironball listening on port ' + port);
	});
} else {
	var server = app.listen(port, function () {
		console.log('Ironball listening on port ' + port);
	});  
}
var wss = require("./gamewss.js").gameWebSocketServer(server, app);
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('./public'));
