const genUUID = require('uuid/v1');
const gl = require('./public/js/gameLogic.js');
const ah = require('./arenahandler.js');
var tournaments = {};
var MsgTypes = gl.MsgTypes;
var UpgradeTypes = gl.UpgradeTypes;
var GameTypes = gl.GameTypes;
var GameStates = gl.GameStates;

var TeamUpgrades = function(id){
	this.id = id;
	this.credits = 500;
	this.upgrades = [];
	for (var i = 0; i < gl.playerCount+1; i++){
		var upgrade = {};
		upgrade[UpgradeTypes.SpeedUpgrade] = 100;
		upgrade[UpgradeTypes.ThrowUpgrade] = 100;
		upgrade[UpgradeTypes.StaminaUpgrade] = 100;
		upgrade[UpgradeTypes.AccelerationUpgrade] = 100;
		upgrade[UpgradeTypes.KickUpgrade] = 100;
		upgrade[UpgradeTypes.IntelligenceUpgrade] = 100;
		upgrade[UpgradeTypes.EnduranceUpgrade] = 100;
		upgrade[UpgradeTypes.HealthUpgrade] = 100;		
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
  this.arenaCounter = 0;
  this.poolSize = 2;
  this.gameType = -1;
  this.playAgainstAI = false;
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
  
  this.arenaCallback = (sender, msg) =>  (sender, msg) => {
		if (msg.t === MsgTypes.ChangeGameState){
			if (msg.state === GameStates.Finished){
				if (this.gameType === GameTypes.SingleMatch){
					
				}
			}
		}
	}
  
  
  this.onParticipantMessage = (data, ws) => { 
    var msg = JSON.parse(data); 
    switch (msg.t){
      case MsgTypes.PoolSizeChanged:
        var poolSize = Math.min(4, Math.max(2, parseInt(msg.poolSize)));        
        if (poolSize){
          this.poolSize = poolSize;
          this.onTournamentStateChanged();
        }        
        break;
			case MsgTypes.PlayerUpgrade:
      	this.handlePlayerUpgrade(msg, ws);
      	break; 	
      case MsgTypes.TeamManagementDone:
      	//var arenaID = this.id.toString() + "." + this.arenaCounter;
      	var arena = null;
      	if (this.gameType === GameTypes.SingleMatch)
      	{
      		var arenaID = this.id.toString() + ".0";
      		arena = ah.getArena(arenaID);
      		if (arena === null){
      			arena = new ah.Arena(arenaID);
      			arena.eventCallBack = this.arenaCallback;
      			this.arenaCounter++;
      		}
      	}      	
      	var msg = {
      		t: MsgTypes.ArenaCreated,
      		id: arenaID
      	}
      	if (arena.team1Id === null){
      		arena.team1Id = ws.teamId;
	      	var players = arena.gameLogic.team1;
      	} else {
      		arena.team2Id = ws.teamId;
	      	var players = arena.gameLogic.team2;
      	}
      	for (var i in players){
      		var player = players[i];
      		var upgrades = ws.teamUpgrades.upgrades[i];
      		player.setUpgrades(upgrades)
      	}      	
      	if (this.playAgainstAI){
      		arena.gameLogic.teamName2 = "Steel Fury";           
		      arena.playAgainstAI = true;
		      var data = JSON.stringify(msg);
	      	ws.send(data);
      	}
      	if (players == arena.gameLogic.team2){
      		this.sendMessageToAllSockets(msg);
      	}
      	break;
      case MsgTypes.PlayAgainstAI:
      	if (this.gameType === GameTypes.SingleMatch){
      		this.playAgainstAI = true;
      	}
      	break;
      default:
      	console.log(data);
    }            
  }
  
  this.handlePlayerUpgrade = (msg, ws) => {
  	var teamChanged = false;
  	var price = 5;
  	var upgrade = 5;
  	if (msg.pi === gl.playerCount){
  		for (var i = 0; i < gl.playerCount; i++){
  			if (ws.teamUpgrades.credits >= price){
  				var limited = false;
  				if (msg.ut === UpgradeTypes.HealthUpgrade && ws.teamUpgrades.upgrades[i][msg.ut]>=100) limited = true; 
    			if (!limited){
    				teamChanged = true;
		  			ws.teamUpgrades.upgrades[i][msg.ut] += upgrade;
						ws.teamUpgrades.upgrades[gl.playerCount][msg.ut] += upgrade/gl.playerCount;
						ws.teamUpgrades.credits -= price;
    			}
  			}	
  		}
  	} else {
  		if (ws.teamUpgrades.credits >= price){
  			teamChanged = true;
  			ws.teamUpgrades.upgrades[msg.pi][msg.ut] += upgrade;
  			ws.teamUpgrades.upgrades[gl.playerCount][msg.ut] += upgrade/gl.playerCount;
				ws.teamUpgrades.credits -= price;
				
			}		
  	}
  	if (teamChanged) this.onTeamUpgradesChanged(ws.teamUpgrades);
  }
  
  this.getTournamentState = () => {
    return {
      id: this.id,
      playerCount: Object.keys(this.participantSockets).length,
      poolSize: this.poolSize,
      gt: this.gameType
    }
  }
  
  this.addSocket = (webSocket, msg) => {    
    webSocket.tournament = this;
    webSocket.teamId = genUUID();
    webSocket.teamUpgrades = new TeamUpgrades(webSocket.teamId);
    webSocket.tournament = this;
    this.participantSockets[webSocket.teamId] = webSocket;
   
    webSocket.on("message", onParticipantMessage);
    webSocket.on("close", (evt) => { 
      console.log("websocket closed " + webSocket.teamId);
      delete this.participantSockets[webSocket.teamId]; 
      this.onTournamentStateChanged();
      this.checkRecycle(); 
    });
    var tournamentState = this.getTournamentState();
    tournamentState.teamUpgrades = webSocket.teamUpgrades;
    tournamentState.t = MsgTypes.Connected;
    tournamentState.teamId = webSocket.teamId;
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
  
  this.onTeamUpgradesChanged = (teamUpgrades) => {
    var msg = {};
    msg.t = MsgTypes.TeamUpgradesChanged;
    msg.teamUpgrades = teamUpgrades;
    
    for (var i in this.participantSockets){
      try {
        var webSocket = this.participantSockets[i];
        webSocket.send(JSON.stringify(msg));
      } catch (e){
        
      }
    }    
  }
  
  this.sendMessageToAllSockets = (msg) => {
  	var data = JSON.stringify(msg);
  	for (var i in this.participantSockets){
      try {
        var webSocket = this.participantSockets[i];
        webSocket.send(data);
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
