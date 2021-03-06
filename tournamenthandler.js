const genUUID = require('uuid/v1');
const gl = require('./public/js/gameLogic.js');
const ah = require('./arenahandler.js');
const ai = require('./artificialIntelligence.js');
const MsgTypes = gl.MsgTypes;
const UpgradeTypes = gl.UpgradeTypes;
const GameTypes = gl.GameTypes;
const GameStates = gl.GameStates;
const tournaments = {};

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

function TournamentPool(id){
	this.id = id;
	this.teams = [];
	this.gamesUnfinished = [];
	this.gamesFinished = [];
	this.gamesInProgress = [];
	this.prevPools = [];
	this.nextPool = null;
	this.createGames = (gameType) => {
		if (gameType === GameTypes.SingleMatch){
			for (var i = 0; i < 3; i++){
				var game = {
					team1: this.teams[0],
					team2: this.teams[1],
					id: this.id.toString() + "." + i
				}
				this.gamesUnfinished.push(game);
			}			
		}
	}
	this.serialize = () => {
		var serialized = {
			teams: this.teams,
			gamesUnfinished: this.gamesUnfinished,
			gamesFinished: this.gamesFinished,
			gamesInProgress: this.gamesInProgress,
			prevPools: []
		}
		for (i in this.prevPools){
			var prevPool = this.prevPools[i];
			serialized.prevPools.push(prevPool.serialize());
		}
		
		return serialized;
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
  this.tree = new TournamentPool(0);
  this.playAgainstAI = false;
  this.handsOff = false;
  
  tournaments[this.id] = this;
  console.log("tournament created: " + id);
  this.checkRecycle = () => {
  	var playerCount = 0;
  	for (id in this.participantSockets){
  		var participant = this.participantSockets[id];
			if (!participant.isAI) playerCount++;
  	}
    if (playerCount === 0){
    	this.recycled = true; 
      console.log("Tournament recycled");
      delete tournaments[this.id];
      for (i in this.arenas){
      	var arena = this.arenas[i];
      	arena.checkRecycle();
      }
      this.arenas = [];
           
    }
  }
  this.getParticipantFromTeamId = (id) => {
  	if (id in this.participantSockets){
  		return this.participantSockets[id];
  	}  	
  	return null;
  }
  this.arenaCallback = (sender, msg) => {		
  	if (this.recycled) return;
		if (msg.t === MsgTypes.ChangeGameState){
			if (msg.state === GameStates.Finished){
				console.log("game finished");
				var pool = sender.pool;
				var game = sender.game;
				var index = pool.gamesInProgress.indexOf(game);
				pool.gamesInProgress.splice(index, 1);
				pool.gamesFinished.push(game);
				sender.eventCallBack = null;
				//console.log(sender);
				var participant1 = this.getParticipantFromTeamId(sender.team1Id);
				var participant2 = this.getParticipantFromTeamId(sender.team2Id);

				var t1score = sender.gameLogic.score.team1;
				var t2score = sender.gameLogic.score.team2;
				
				game.score = sender.gameLogic.score;
						
				if (participant1 != null){
					participant1.teamTournamentState.score += t1score;
					participant1.teamTournamentState.credits += 500;		
					if (t1score > t2score)
						participant1.teamTournamentState.credits += 500;					
					this.onTeamTournamentStateChanged(participant1.teamTournamentState);
					if (participant1.isAI && !this.recycled) participant1.manageTeam();
				}
				if (participant2 != null){
					participant2.teamTournamentState.score += t2score;
					participant2.teamTournamentState.credits += 500;					
					if (t1score < t2score)
						participant2.teamTournamentState.credits += 500;					
					this.onTeamTournamentStateChanged(participant2.teamTournamentState);
					if (participant2.isAI && !this.recycled) participant2.manageTeam();
				}		
				this.onTournamentStateChanged();
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
					this.participantSockets[managerAI.teamId] = managerAI;		  	
					var pool = this.tree;
	  			pool.teams.push(managerAI.teamId);	
	  			if (pool.teams.length == 2) pool.createGames(this.gameType);
					managerAI.manageTeam();		
					managerAI.pool = pool;
      	}
      	break;
      case MsgTypes.PlayHandsOff:
      	this.handsOff = msg.val;
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
	  	pool = this.tree;
			var game = pool.gamesInProgress.length == 0 ? pool.gamesUnfinished.pop() : pool.gamesInProgress[0];
			if (game != null){
				var arenaID = this.id.toString() + "." + game.id;
				//console.log(arenaID);
				arena = ah.getArena(arenaID);				
				if (arena === null){
					arena = new ah.Arena(arenaID);  	
					this.arenas.push(arena);		
					arena.pool = pool;
					arena.game = game;
					arena.handsOff = this.handsOff;
					pool.gamesInProgress.push(arena.game);
					arena.eventCallBack = this.arenaCallback;  			
					this.arenaCounter++;
					arena.playAgainstAI = this.playAgainstAI;
					this.onTournamentStateChanged();
				} 	
			} else {
				console.log("tournament finished");
				return;
			}  		  		
  	} else {
	  	var arenaID = this.id.toString() + "." + this.arenaCounter;
  	} 	
  	
  	if (arena.team1Id === null){
  		arena.team1Id = ws.teamId;
    	var players = arena.gameLogic.team1;
    	if (ws.isAI){
    		arena.gameLogic.teamName1 = ws.name;    		
    		arena.gameLogic.team1AI.aiOnly = true;
    	} else {
    		arena.gameLogic.team1AI.aiOnly = false;
    	}
  	} else {
  		arena.team2Id = ws.teamId;
    	var players = arena.gameLogic.team2;
    	if (ws.isAI){
    		arena.gameLogic.teamName2 = ws.name;
    		arena.gameLogic.team2AI.aiOnly = true;
    	} else {
    		arena.gameLogic.team2AI.aiOnly = false;
    	}
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
  	var participants = [];
  	for (var id in this.participantSockets){
  		var participant = this.participantSockets[id];
  		participants.push({id: id, name: participant.name});
  	} 
    return {
      id: this.id,
      playerCount: Object.keys(this.participantSockets).length,
      poolSize: this.poolSize,
      gt: this.gameType,
      tt: this.tree.serialize(),
      p: participants
    }
  }
  
  this.getTournamentTree = () => {
  	var tree = {};
  	return tree;
  }
  
  
  this.handleNewTeam = (id) => {
  	var msg = {
  		t: MsgTypes.NewTeamAdded,
  		id: id,
  		tm: this.participantSockets[id].team
  	}
  	var newTeamData = JSON.stringify(msg);
  	for (teamId in this.participantSockets){
  		if (teamId != id){
				participantSocket = this.participantSockets[teamId];
				msg.id = teamId;
				msg.tm = participantSocket.team;
				var oldTeamData = JSON.stringify(msg);
				this.participantSockets[id].send(oldTeamData);
				participantSocket.send(newTeamData);
  		}
  	}
  }
  
  this.addSocket = (webSocket, msg) => {    
    webSocket.tournament = this;
    webSocket.teamId = genUUID();
    webSocket.team = msg.tm;
    webSocket.name = msg.tm.name;
    webSocket.teamTournamentState = new TeamTournamentState(webSocket.teamId);
    webSocket.tournament = this;
    webSocket.isAI = false;
    
   	if (this.gameType === GameTypes.SingleMatch)
  	{
			console.log("this.participantSockets.length " + Object.keys(this.participantSockets).length );  	
  		if (Object.keys(this.participantSockets).length >= 2){
  			console.log("tournament full");
  			webSocket.close();
  			return;
  		}
  		var pool = this.tree;
  		pool.teams.push(webSocket.teamId);  		
  		if (pool.teams.length == 2) pool.createGames(this.gameType);
  		webSocket.pool = pool;
  	}
  	
   	this.participantSockets[webSocket.teamId] = webSocket;
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
    this.handleNewTeam(webSocket.teamId);
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
