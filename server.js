#!/usr/bin/env node

var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var server = app.listen(8888, function () {
  console.log('Ironball listening on port 8888!');
});
var wss = require("./gamewss.js").gameWebSocketServer(server, app);
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('./public'));