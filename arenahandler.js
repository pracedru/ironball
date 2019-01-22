var gl = require('./public/js/gameLogic.js');
var ai = require("./artificialIntelligence.js");
var arenas = {};

exports.Arena = function(id) {
  this.id = id;
  this.team1Socket = null;
  this.team2Socket = null;
  this.playAgainstAI = false;
  this.spectatorSockets = [];
  arenas[this.id] = this;
  this.recycled = false;
  this.gameLogic = new gl.GameLogics();
  this.gameLogic.initLogic();
  this.gameLogic.arena = this;
  this.gameLogic.team1AI = new ai.TeamAI(this.gameLogic, this.gameLogic.team1, this);
  this.gameLogic.team2AI = new ai.TeamAI(this.gameLogic, this.gameLogic.team2, this);
  this.gameLogic.eventCallBack = function (msg) {
    // var data = JSON.stringify(msg);
    // console.log(data);
    try{
      this.arena.sendPlayerUpdate(msg);
      if (msg.t === "changeGameState" && msg.state === gl.GameStates.GetReady){
        this.team1AI.playersReady = false;
        this.team2AI.playersReady = false;        
      }
    } catch(e) {
      console.log(e);
    }
  };
  this.checkRecycle = () => {
    if (this.team1Socket === null && this.team2Socket === null && this.spectatorSockets.length ===0){
      console.log("Arena recycled");
      arenas[this.id] = null;
      this.recycled = true;
    }
  };
  this.setSocket = (webSocket, msg) => {
  	//console.log(msg);
    if(this.team1Socket===null){
      this.setTeam1Socket(webSocket, msg);
    } else if(this.team2Socket===null){
      this.setTeam2Socket(webSocket, msg);
    } else {
      this.setSpectatorSocket(webSocket, msg);
    }
  };
  this.getGameState = () => {
    for (var i = 0; i < this.gameLogic.team1.length; i++){
      this.gameLogic.team1[i].collisions = [];
      this.gameLogic.team1[i].proximity = [];
      this.gameLogic.team2[i].collisions = [];
      this.gameLogic.team2[i].proximity = [];
    }
    var gameState = {
      ballpos: this.gameLogic.ballpos,
      state: this.gameLogic.state,
      stateTime: this.gameLogic.stateTime,
      round: this.gameLogic.round,
      roundStartTime: this.gameLogic.roundStartTime - Date.now(),
      teamName1: this.gameLogic.teamName1,
      teamName2: this.gameLogic.teamName2,      
      team1: this.gameLogic.team1,
      team2: this.gameLogic.team2,
      score: this.gameLogic.score
    }
    return gameState;
  };
  this.setTeam1Socket = function(webSocket, msg){
    webSocket.arena = this;
    this.team1Socket = webSocket;
    webSocket.on("message", this.onTeam1Message); 
    webSocket.on("close", ()=>{ 
      this.team1Socket = null; 
      this.checkRecycle();
      this.gameLogic.teamName1 = "Team 1";
	    this.gameLogic.team1AI.aiOnly = true;
      this.syncTeamNames();
    });
    var team = JSON.parse(msg.tm);
    this.gameLogic.teamName1 = team.name;
    var gameState = this.getGameState();
    gameState.t = "connected";
    gameState.ct = 1;        
    webSocket.send(JSON.stringify(gameState));    
    this.gameLogic.team1AI.aiOnly = false;
    this.syncTeamNames();
  };
  this.setTeam2Socket = function(webSocket, msg){
    webSocket.arena = this;
    this.team2Socket = webSocket;
    webSocket.on("message", this.onTeam2Message);
    webSocket.on("close", ()=>{ 
      this.team2Socket = null; 
      this.checkRecycle();
      this.gameLogic.teamName2 = "Team 2";
	    this.gameLogic.team2AI.aiOnly = true;
      this.syncTeamNames();
    });
    var team = JSON.parse(msg.tm);
    this.gameLogic.teamName2 = team.name;
    var gameState = this.getGameState();
    gameState.t = "connected";
    gameState.ct = 2;    
    webSocket.send(JSON.stringify(gameState));
    this.gameLogic.team2AI.aiOnly = false;
    this.syncTeamNames();
  }; 
  this.setSpectatorSocket = function(webSocket, msg){
    webSocket.arena = this;
    this.spectatorSockets.push(webSocket);
    webSocket.on("message", this.onSpectatorMessage);
    webSocket.on("close", ()=>{ 
      this.spectatorSockets.splice(this.spectatorSockets.indexOf(this), 1); 
      this.checkRecycle(); 
    });
    var gameState = this.getGameState();
    gameState.t = "connected";
    gameState.ct = 0;
    webSocket.send(JSON.stringify(gameState));
  };

  this.onTeam1Message = function(data){
    var team = this.arena.gameLogic.team1;
    var teamNo = 1;
    this.arena.onTeamMessage(teamNo, team, data);
  };
  this.onTeam2Message = function(data){
    var team = this.arena.gameLogic.team2;
    var teamNo = 2;
    this.arena.onTeamMessage(teamNo, team, data);
  };

  this.onTeamMessage = function(teamNo, team, data){

    var msg = JSON.parse(data);
    //console.log(msg); 
    if (msg.pi === -1) return;    
    switch (msg.t){
      case "userInputUpdate":      	
        if (this.gameLogic.state === 1){	        
          var player = team[msg.pi];
          this.gameLogic.updatePlayerInput(player, msg.bk);

          msg = JSON.parse(data);
          msg.tm = teamNo;
          msg.t = "playerInputUpdate"
          if (player===undefined){
            console.log(msg.pi);
          }
          msg.pos = player.pos;
          msg.dir = player.dir;
          this.sendPlayerUpdate(msg);
        } 
        break;
      case "playerReturn":
        var player = team[msg.pi];
        msg.bk = 0; // {a: false, s: false, d: false, w: false, ' ': false};
        this.gameLogic.updatePlayerInput(player, msg.bk);
        msg.tm = teamNo;
        msg.t = "playerReturn";
        msg.pos = player.pos;
        msg.dir = player.dir;
        player.returning = true;
        this.sendPlayerUpdate(msg);
        break;
      case "playerIsControlled":
        for (var i = 0; i < team.length; i++){
          var player = team[i];
          if (player.controlled && parseInt(msg.pi) != i){
            player.running = false;
            var newmsg = {
            	bk: 0,
            	t: "playerInputUpdate",
            	pos:  player.pos,
            	dir: player.dir,
            	pi: i,
            	tm: teamNo
            }
            this.gameLogic.updatePlayerInput(player, newmsg.bk);
            this.sendPlayerUpdate(newmsg);
          }
          player.controlled = (parseInt(msg.pi) == i);
          if(player.controlled){
            var newmsg = {
            	bk: msg.bk,
            	t: "playerInputUpdate",
            	pos: player.pos,
            	dir: player.dir,
            	pi: i,
            	tm: teamNo
            }            
            this.gameLogic.updatePlayerInput(player, msg.bk);            
            this.sendPlayerUpdate(newmsg);
          }
        }        
        break;
      case "arenaPlayAgainstAI":           
        this.gameLogic.teamName2 = "Steel Fury";        
        this.syncTeamNames();       
        this.playAgainstAI = true;
        break;
      case "changeFormation":
      	console.log("teamno: " + teamNo);
      	var direction = (this.gameLogic.round%2) === 1 ?  1 : -1;
      	if (teamNo == 2) direction *= -1;
      	for (var i = 0; i < team.length; i++){
          var player = team[i];
          var place = gl.places[msg.frm[i]];
          if (player != null && place != null){
          	var pos = {
				    	x: gl.places[msg.frm[i]].x,
				    	y: direction*gl.places[msg.frm[i]].y
						};
		        player.defaultPosition = pos;
          }          
        }
        var ai = null;
        if (this.gameLogic.team1AI.team == team){
        	ai = this.gameLogic.team1AI
        } else {
	        ai = this.gameLogic.team2AI
        }
        ai.playersReady = true;
      default:
        console.log(data);
    }
  };

  this.syncTeamNames = () => {
    this.sendPlayerUpdate({ 
      t: "syncTeamNames", 
      tn1: this.gameLogic.teamName1, 
      tn2: this.gameLogic.teamName2
    });
  };

  this.sendPlayerUpdate = (playerUpdateData) => {
    if(this.team1Socket !== null){
      try {
        this.team1Socket.send(JSON.stringify(playerUpdateData));
      } catch (e) {}      
    }
    if(this.team2Socket !== null){
      try {
        this.team2Socket.send(JSON.stringify(playerUpdateData));
      } catch (e) {}      
    }
    for (var i = 0; i < this.spectatorSockets.length; i++){
      try {
        this.spectatorSockets[i].send(JSON.stringify(playerUpdateData));
      } catch (e) {}      
    }
  };

  this.onSpectatorMessage = function(msg){
    //console.log("on spec msg " + msg);
  };
  this.update = () => {
    if (this.gameLogic.state === gl.GameStates.PreGame){
      if (this.gameLogic.team1AI.preGameReady && this.gameLogic.team2AI.preGameReady){
        if (this.team1Socket !== null && this.team2Socket !== null || this.playAgainstAI){
          this.gameLogic.setState(gl.GameStates.GetReady);      
          this.sendPlayerUpdate({ t: "changeGameState", state: gl.GameStates.GetReady });
        }
      }
    } else if (this.gameLogic.state === gl.GameStates.GetReady){
      if (this.gameLogic.team1AI.playersReady && this.gameLogic.team2AI.playersReady){        
        this.gameLogic.setState(gl.GameStates.Playing);      
        this.sendPlayerUpdate({ t: "changeGameState", state: gl.GameStates.Playing });
      }
    }
    
    this.gameLogic.team1AI.update();
    this.gameLogic.team2AI.update();
    this.gameLogic.update();

    if (!this.recycled){
      setTimeout(this.update, 50, 'update');
    }
  };
  setTimeout(this.update, 50, 'update');
	console.log("Arena created " + this.id); 
};

exports.getArena = function(id) {
  if (id in arenas){
    return arenas[id];
  } else{
    return null;
  }
};
