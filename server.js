#!/usr/bin/env node

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const useTLSEncryption = false;
const port = 8888;
const app = express();

if (useTLSEncryption){
	var https = require('https');
	var fs = require('fs');
	var key = fs.readFileSync('tls/privkey.pem');
	var cert = fs.readFileSync( 'tls/fullchain.pem' );
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
