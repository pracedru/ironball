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
      if (msg.type === "changeGameState" && msg.state === gl.GameStates.GetReady){
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
    };
    // console.log (gameState);
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
    var team = JSON.parse(msg.team);
    this.gameLogic.teamName1 = team.name;
    var gameState = this.getGameState();
    gameState.type = "connected";
    gameState.clientType = 1;        
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
    this.gameLogic.teamName2 = msg.teamName;
    var gameState = this.getGameState();
    gameState.type = "connected";
    gameState.clientType = 2;    
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
    gameState.type = "connected";
    gameState.clientType = 0;
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
    if (msg.playerIndex === -1) return;
    switch (msg.type){
      case "userInputUpdate":
        if (this.gameLogic.state === 1){
	        //console.log(msg.downKeys);
          var player = team[msg.playerIndex];
          this.gameLogic.updatePlayerInput(player, msg.downKeys);
          msg = JSON.parse(data);
          msg.team = teamNo;
          msg.type = "playerInputUpdate"
          if (player===undefined){
            console.log(msg.playerIndex);
          }
          msg.pos = player.pos;
          msg.dir = player.dir;
          this.sendPlayerUpdate(msg);
        }
        break;
      case "playerReturn":
        var player = team[msg.playerIndex];
        msg.downKeys = {a: false, s: false, d: false, w: false, ' ': false};
        this.gameLogic.updatePlayerInput(player, msg.downKeys);
        msg.team = teamNo;
        msg.type = "playerReturn";
        msg.pos = player.pos;
        msg.dir = player.dir;
        player.returning = true;
        this.sendPlayerUpdate(msg);
        break;
      case "playerIsControlled":
        // console.log("controlled player is: " +msg.playerIndex);
        for (var i = 0; i < team.length; i++){
          var player = team[i];
          if (player.controlled && parseInt(msg.playerIndex) !== parseInt(i)){
            player.running = false;
            var newmsg = {downKeys: {a: false, s: false, d: false, w: false, ' ': false}};
            newmsg.type = "playerInputUpdate";
            newmsg.pos = player.pos;
            newmsg.dir = player.dir;
            newmsg.playerIndex = i;
            newmsg.team = teamNo;
            // console.log("player stopped running: " + i);
            this.gameLogic.updatePlayerInput(player, newmsg.downKeys);
            this.sendPlayerUpdate(newmsg);
          }
          player.controlled = (parseInt(msg.playerIndex) === parseInt(i));
          if(player.controlled){
            var newmsg = {downKeys: msg.downKeys};
            newmsg.type = "playerInputUpdate";
            newmsg.pos = player.pos;
            newmsg.dir = player.dir;
            newmsg.playerIndex = i;
            newmsg.team = teamNo;
            this.gameLogic.updatePlayerInput(player, msg.downKeys);
            // console.log("player stopped running: " + i);
            this.sendPlayerUpdate(newmsg);
          }
        }        
        break;
      case "arenaPlayAgainstAI":           
        this.gameLogic.teamName2 = "Steel Fury";        
        this.syncTeamNames();       
        this.playAgainstAI = true;
        break;
      default:
        console.log(data);
    }
  };

  this.syncTeamNames = () => {
    this.sendPlayerUpdate({ 
      type: "syncTeamNames", 
      teamName1: this.gameLogic.teamName1, 
      teamName2: this.gameLogic.teamName2
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
          this.sendPlayerUpdate({ type: "changeGameState", state: gl.GameStates.GetReady });
        }
      }
    } else if (this.gameLogic.state === gl.GameStates.GetReady){
      if (this.gameLogic.team1AI.playersReady && this.gameLogic.team2AI.playersReady){        
        this.gameLogic.setState(gl.GameStates.Playing);      
        this.sendPlayerUpdate({ type: "changeGameState", state: gl.GameStates.Playing });
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

};

exports.getArena = function(id) {
  if (id in arenas){
    return arenas[id];
  } else{
    return null;
  }
};
