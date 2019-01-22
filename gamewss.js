var WebSocketServer = require('ws').Server;
var ArenaHandler = require('./arenahandler.js');
var TournamentHandler = require('./tournamenthandler.js');
var gl = require('./public/js/gameLogic.js');
var wss = null;

var MsgTypes = gl.MsgTypes;

var arenaIDCounter = 1000;
var tournamentIDCounter = 1000;
//var arena = new ArenaHandler.Arena();

exports.gameWebSocketServer = function(server, app) {
  if (wss === null) {
    wss = new WebSocketServer({
      server: server
    });
    wss.on("connection", function(webSocket) {
      webSocket.on("message", onMessage);
    });
  }
  
  app.get("/createArena", function(req, res) {
    var arenaID = arenaIDCounter;
    arenaIDCounter++;
    var arena = new ArenaHandler.Arena(arenaID);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({type: "arenaCreated", arenaID}));
    return res.end();
  });
  
  app.get("/createTournament", function(req, res) {
    var tournamentID = tournamentIDCounter;
    tournamentIDCounter++;
    var tournament = new TournamentHandler.Tournament(tournamentID);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({type: "tournamentCreated", tournamentID}));
    return res.end();
  });
  
  return wss;
};

function onMessage(data) {  
  var msg = JSON.parse(data);  
  this.removeListener("message", onMessage);
  if (msg.t === MsgTypes.ArenaConnection){
    var arenaID = msg.arenaID;
    var arena = ArenaHandler.getArena(arenaID);
    if (arena === null){
      this.close();      
    } else {
      arena.setSocket(this, msg);            
    }
  } else if (msg.t === MsgTypes.TournamentConnection){
    //console.log("tournament connection!");    
    var tournamentID = msg.tournamentID;
    var tournament = TournamentHandler.getTournament(tournamentID);
    if (tournament === null){
      //console.log("tournament not found! creating new tournament");
      var tournamentID = tournamentIDCounter;
      tournamentIDCounter++;
      var tournament = new TournamentHandler.Tournament(tournamentID);
      tournament.addSocket(this, msg); 
    } else {
      tournament.addSocket(this, msg); 
    }
  }    
}
