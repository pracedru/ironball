const WebSocketServer = require('ws').Server;
const ArenaHandler = require('./arenahandler.js');
const TournamentHandler = require('./tournamenthandler.js');
const gl = require('./public/js/gameLogic.js');
const MsgTypes = gl.MsgTypes;

var wss = null;
var tournamentIDCounter = 1000;

exports.gameWebSocketServer = function(server, app) {
  if (wss === null) {
    wss = new WebSocketServer({
      server: server
    });
    wss.on("connection", function(webSocket) {
      webSocket.on("message", onMessage);
    });
  }  
  return wss;
}

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
    var tournamentID = msg.tournamentID;
    var tournament = TournamentHandler.getTournament(tournamentID);
    if (tournament === null){
      var tournamentID = tournamentIDCounter;
      tournamentIDCounter++;
      var tournament = new TournamentHandler.Tournament(tournamentID, msg.gameType);
      tournament.addSocket(this, msg); 
    } else {
      tournament.addSocket(this, msg); 
    }
  }    
}
