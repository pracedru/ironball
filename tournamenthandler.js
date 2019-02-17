const genUUID = require('uuid/v1');
const gl = require('./public/js/gameLogic.js');
const ah = require('./arenahandler.js');
const ai = require('./artificialIntelligence.js');
var tournaments = {};
var MsgTypes = gl.MsgTypes;
var UpgradeTypes = gl.UpgradeTypes;
var GameTypes = gl.GameTypes;
var GameStates = gl.GameStates;

var TeamTournamentState = function(id){
	this.id = id;
	this.credits = 500;
	this.upgrades = [];
	this.score = 0;
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

function TournamentPool(){
	this.teams = [];
	this.gamesUnfinished = [];
	this.gamesFinished = [];
	this.gamesInProgress = [];
	this.createGames = (gameType) => {
		console.log("this.createGames");
		if (gameType === GameTypes.SingleMatch){
			for (var i = 0; i < 3; i++){
				var game = {
					team1: this.teams[0],
					team2: this.teams[1]
				}
				this.gamesUnfinished.push(game);
				console.log("this.createGames");
			}			
		}
		console.log(this);
	}
}

exports.Tournament = function(id, gameType) {
  this.id = id;
  this.participantSockets = {};
  this.recycled = false;
  this.arenas = [];
  this.arenaCounter = 0;
  this.poolSize = 2;
  this.gameType = gameType;
  this.pools = [new TournamentPool()];
  this.playAgainstAI = false;
  
  tournaments[this.id] = this;
  console.log("tournament created: " + id);
  this.checkRecycle = () => {
  	var playerCount = 0;
  	for (id in this.participantSockets){
  		var participant = this.participantSockets[id];
			if (participant.isAI) playerCount++;
  	}
    if (playerCount === 0){
      console.log("Tournament recycled");
      delete tournaments[this.id];
      this.arenas = [];
      this.recycled = true;      
    }
  }
  this.getSocketFromTeamId = (id) => {
  	if (id in this.participantSockets){
  		return this.participantSockets[id];
  	}
  	return null;
  }
  this.arenaCallback = (sender, msg) => {		
		if (msg.t === MsgTypes.ChangeGameState){
			if (msg.state === GameStates.Finished){
				var pool = sender.pool;
				var game = sender.game;
				var index = pool.gamesInProgress.indexOf(game);
				pool.gamesInProgress.splice(index, 1);
				pool.gamesFinished.push(game);
				sender.eventCallBack = null;
				console.log("game finished");
				//console.log(sender);
				var team1Socket = this.getSocketFromTeamId(sender.team1Id);
				var team2Socket = this.getSocketFromTeamId(sender.team2Id);

				var t1score = sender.gameLogic.score.team1;
				var t2score = sender.gameLogic.score.team2;
				
				game.score = sender.gameLogic.score;
						
				if (team1Socket != null){
					team1Socket.teamTournamentState.score += t1score;
					team1Socket.teamTournamentState.credits += 500;		
					if (t1score > t2score)
						team1Socket.teamTournamentState.credits += 500;					
					this.onTeamTournamentStateChanged(team1Socket.teamTournamentState);
				}
				if (team2Socket != null){
					team2Socket.teamTournamentState.score += t2score;
					team2Socket.teamTournamentState.credits += 500;					
					if (t1score < t2score)
						team2Socket.teamTournamentState.credits += 500;					
					this.onTeamTournamentStateChanged(team2Socket.teamTournamentState);
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
      case MsgTypes.StartTournament:
      	this.handleStartTournament(msg, ws);
      	break;
      case MsgTypes.TeamManagementDone:
      	this.handleTeamManagementDone(msg, ws);
      	break;
      case MsgTypes.PlayAgainstAI:
      	if (this.gameType === GameTypes.SingleMatch){
      		this.playAgainstAI = true;
      		var managerAI = new ai.ManagerAI(this, new TeamTournamentState(genUUID()));
	  			managerAI.onMessage = this.onParticipantMessage;
					this.participantSockets[managerAI.id] = managerAI;		  	
					var pool = this.pools[0];
	  			pool.teams.push(managerAI.teamId);	
	  			if (pool.teams.length == 2) pool.createGames(this.gameType);
					managerAI.manageTeam();		
      	}
      	break;
      default:
      	console.log(data);
    }            
  }
  
  this.handleStartTournament = (msg, ws) => {
  	
  }
  
  this.handleTeamManagementDone =  (msg, ws) => {
  	var arena = null;
  	var pool = null;
  	if (this.gameType === GameTypes.SingleMatch)
  	{
  		var arenaID = this.id.toString() + ".0";
  		arena = ah.getArena(arenaID);
			pool = this.pools[0];
  		if (arena === null){
  			arena = new ah.Arena(arenaID);  			
  			arena.pool = pool;
  			console.log(pool);
  			arena.game = pool.gamesUnfinished.pop();
  			pool.gamesInProgress.push(arena.game);
  			arena.eventCallBack = this.arenaCallback;  			
  			this.arenaCounter++;
				arena.playAgainstAI = this.playAgainstAI;
  		} 	  		
  	} else {
	  	var arenaID = this.id.toString() + "." + this.arenaCounter;
  	} 	
  	
  	if (arena.team1Id === null){
  		arena.team1Id = ws.teamId;
    	var players = arena.gameLogic.team1;
    	console.log("arena.team1Id: " + arena.team1Id);
  	} else {
  		arena.team2Id = ws.teamId;
    	var players = arena.gameLogic.team2;
    	console.log("arena.team2Id: " + arena.team2Id);
  	}
  	for (var i in players){
  		var player = players[i];
  		var upgrades = ws.teamTournamentState.upgrades[i];
  		player.setUpgrades(upgrades)
  	}      	
  	var msg = {
  		t: MsgTypes.ArenaCreated,
  		id: arenaID
  	}
  	if (players == arena.gameLogic.team2){
  		this.sendMessageToAllSockets(msg);
  	}
  }
  
  this.handlePlayerUpgrade = (msg, ws) => {
  	var teamChanged = false;
  	var price = 30;
  	var upgrade = 5;
  	if (msg.pi === gl.playerCount){
  		for (var i = 0; i < gl.playerCount; i++){
  			if (ws.teamTournamentState.credits >= price){
  				var limited = false;
  				if (msg.ut === UpgradeTypes.HealthUpgrade && ws.teamTournamentState.upgrades[i][msg.ut]>=100) limited = true; 
    			if (!limited){
    				teamChanged = true;
		  			ws.teamTournamentState.upgrades[i][msg.ut] += upgrade;
						ws.teamTournamentState.upgrades[gl.playerCount][msg.ut] += upgrade/gl.playerCount;
						ws.teamTournamentState.credits -= price;
    			}
  			}	
  		}
  	} else {
  		if (ws.teamTournamentState.credits >= price){
  			teamChanged = true;
  			ws.teamTournamentState.upgrades[msg.pi][msg.ut] += upgrade;
  			ws.teamTournamentState.upgrades[gl.playerCount][msg.ut] += upgrade/gl.playerCount;
				ws.teamTournamentState.credits -= price;
				
			}		
  	}
  	if (teamChanged) this.onTeamTournamentStateChanged(ws.teamTournamentState);
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
    webSocket.teamTournamentState = new TeamTournamentState(webSocket.teamId);
    webSocket.tournament = this;
    webSocket.isAI = false;
    this.participantSockets[webSocket.teamId] = webSocket;
   	
   	if (this.gameType === GameTypes.SingleMatch)
  	{
  		var pool = this.pools[0];
  		pool.teams.push(webSocket.teamId);  		
  		if (pool.teams.length == 2) pool.createGames(this.gameType);
  	}
   	
    webSocket.on("message", onParticipantMessage);
    webSocket.on("close", (evt) => { 
      console.log("websocket closed " + webSocket.teamId);
      delete this.participantSockets[webSocket.teamId]; 
      this.onTournamentStateChanged();
      this.checkRecycle(); 
    });
    var tournamentState = this.getTournamentState();
    tournamentState.teamTournamentState = webSocket.teamTournamentState;
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
  
  this.onTeamTournamentStateChanged = (teamTournamentState) => {
    var msg = {};
    msg.t = MsgTypes.TeamTournamentStateChanged;
    msg.teamTournamentState = teamTournamentState;
    this.sendMessageToAllSockets(msg);    
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
