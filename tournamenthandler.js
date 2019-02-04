const genUUID = require('uuid/v1');
const gl = require('./public/js/gameLogic.js');

var tournaments = {};
var MsgTypes = gl.MsgTypes;
var PickupItemType = gl.PickupItemType;

var Team = function(id){
	this.id = id;
	this.upgrades = [];
	for (var i = 0; i < gl.playerCount; i++){
		var upgrade = {};
		upgrade[PickupItemType.SpeedUpgrade] = 100;
		upgrade[PickupItemType.ThrowUpgrade] = 100;
		upgrade[PickupItemType.StamminaUpgrade] = 100;
		upgrade[PickupItemType.AccelerationUpgrade] = 100;
		upgrade[PickupItemType.KickUpgrade] = 100;
		upgrade[PickupItemType.IntelligenceUpgrade] = 100;
		upgrade[PickupItemType.EnduranceUpgrade] = 100;
		upgrade[PickupItemType.HealthUpgrade] = 100;
		
		this.upgrades.push(upgrade);
	}
}

function onParticipantMessage(data){
	this.tournament.onParticipantMessage(data, this);
}

exports.Tournament = function(id) {
  this.id = id;
  this.participantSockets = {};
  this.recycled = false;
  this.arenas = [];
  this.poolSize = 2;
  tournaments[this.id] = this;
  console.log("tournament created: " + id);
  this.checkRecycle = () => {
    if (Object.keys(this.participantSockets).length === 0){
      console.log("Tournament recycled");
      delete tournaments[this.id];
      this.arenas = [];
      this.recycled = true;      
    }
  }
  
  this.onParticipantMessage = (data, ws) => { 
    var msg = JSON.parse(data); 
    console.log(data);
    switch (msg.t){
      case MsgTypes.PoolSizeChanged:
        var poolSize = Math.min(4, Math.max(2, parseInt(msg.poolSize)));        
        if (poolSize){
          this.poolSize = poolSize;
          this.onTournamentStateChanged();
        }        
        break;
			case MsgTypes.PlayerUpgrade:
      	console.log(ws.teamId);
      	ws.team.upgrades[msg.pi][msg.ut] += 5;
      	this.onTeamUpgradesChanged(ws.team);
      	break; 	
    }            
  }
  
  this.getTournamentState = () => {
    return {
      id: this.id,
      playerCount: Object.keys(this.participantSockets).length,
      poolSize: this.poolSize
    }
  }
  
  this.addSocket = (webSocket, msg) => {    
    webSocket.tournament = this;
    webSocket.teamId = genUUID();
    webSocket.team = new Team(webSocket.teamId);
    webSocket.tournament = this;
    console.log(webSocket.teamId);
    this.participantSockets[webSocket.teamId] = webSocket;
   
    webSocket.on("message", onParticipantMessage);
    webSocket.on("close", (evt)=>{ 
      console.log("websocket closed " + webSocket.teamId);
      delete this.participantSockets[webSocket.teamId]; 
      this.onTournamentStateChanged();
      this.checkRecycle(); 
    });
    var tournamentState = this.getTournamentState();
    tournamentState.team = webSocket.team;
    tournamentState.t = MsgTypes.Connected;
    webSocket.send(JSON.stringify(tournamentState));
    this.onTournamentStateChanged();
  }
  
  this.onTournamentStateChanged = () => {
    var tournamentState = this.getTournamentState();
    tournamentState.t = MsgTypes.TournamentStateChanged;
    var data = JSON.stringify(tournamentState);
    
    for (var i in this.participantSockets){
      try {
        var webSocket = this.participantSockets[i];
        webSocket.send(data);
      } catch (e){
        
      }
    }    
  }
  
  this.onTeamUpgradesChanged = (team) => {
    var msg = {};
    msg.t = MsgTypes.TeamUpgradesChanged;
    msg.team = team;
    
    for (var i in this.participantSockets){
      try {
        var webSocket = this.participantSockets[i];
        webSocket.send(JSON.stringify(msg));
      } catch (e){
        
      }
    }    
  }
  
  this.update = () => {    
    if (!this.recycled){
      setTimeout(this.update, 500, 'update');
    }
  }
  setTimeout(this.update, 500, 'update');
}

exports.getTournament = function(id) {
  if (id in tournaments){
    return tournaments[id];
  } else{
    return null;
  }
}
