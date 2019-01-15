/* global ctx, canvas, scale, currentRenderer, isClient, menuRenderer, GameStates, Btn, Rounds, MenuStates */

window.oncontextmenu = function(event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
};
var Animator = function(framePaths){
  this.frames = [];
  this.frameIndex = 0;
  this.frameRate = 30;
  this.lastFrameTimeStamp = 0;
  this.loop = false;
  this.fadeIn = false;
  this.fadeOut = false;
  this.alpha = 1;
  this.pos = {x: 0, y: 0};
  this.size = {x: 100, y: 100};
  this.finished = false;
  for (var i = 0; i < framePaths.length; i++){
    var frame = new Image();
    frame.src = framePaths[i];
    this.frames.push(frame);
  }
  this.start = () =>{
    this.frameIndex = 0;
    this.lastFrameTimeStamp = gameRenderer.currentTimeStamp;
    this.alpha = 1;
    this.finished = false;
  };
  this.update = () => {
    var deltaTime = gameRenderer.currentTimeStamp-this.lastFrameTimeStamp;
    var timeLim = 1000/this.frameRate;
    if (deltaTime > timeLim){
      this.lastFrameTimeStamp = gameRenderer.currentTimeStamp;
      this.frameIndex++;
    }
    if (!this.loop){
      if (this.frameIndex>=this.frames.length){
        if (this.fadeOut){
          this.alpha -=  0.01;
          if (this.alpha<=0){
            this.alpha = 0;
            return true;
          }
        } else{
          return true;
        }
      }
    }
    return false;
  };
  this.render = () =>{
    if (!this.finished){
      this.finished = this.update();
      ctx.globalAlpha = this.alpha;
      var index = this.frameIndex;
      if (this.loop){
        index = index % this.frames.length;
      } else {
        index = Math.min(index, this.frames.length-1);
      }
      ctx.drawImage(this.frames[index], this.pos.x, this.pos.y, this.size.x, this.size.y);
      ctx.globalAlpha = 1;
    }
  };
};
var ClientType = {
  Team1: 1,
  Team2: 2,
  Spectator: 0
};
var animations = {};
animations['player1Run'] = new Animator([
  "img/player1/run1.png",
  "img/player1/run2.png",
  "img/player1/run3.png",
  "img/player1/run4.png",
  "img/player1/run5.png",
  "img/player1/run6.png",
  "img/player1/run7.png",
  "img/player1/run8.png"]
);

animations['player1Throw'] = new Animator([
  "img/player1/throw1.png",
  "img/player1/throw2.png",
  "img/player1/throw3.png",
  "img/player1/throw4.png",
  "img/player1/throw5.png",
  "img/player1/throw6.png"]
);

animations['player1Fall'] = new Animator([
  "img/player1/idle.png",
  "img/player1/fall1.png",
  "img/player1/fall2.png",
  "img/player1/fall3.png",
  "img/player1/fall4.png"]
);
animations['player1Kick'] = new Animator([
  "img/player1/idle.png",
  "img/player1/run1.png",
  "img/player1/run2.png",
  "img/player1/run3.png"]
);

animations['player2Run'] = new Animator([
  "img/player2/run1.png",
  "img/player2/run2.png",
  "img/player2/run3.png",
  "img/player2/run4.png",
  "img/player2/run5.png",
  "img/player2/run6.png",
  "img/player2/run7.png",
  "img/player2/run8.png"]
);
animations['player2Throw'] = new Animator([
  "img/player2/throw1.png",
  "img/player2/throw2.png",
  "img/player2/throw3.png",
  "img/player2/throw4.png",
  "img/player2/throw5.png",
  "img/player2/throw6.png"]
);
animations['player2Fall'] = new Animator([
  "img/player2/idle.png",
  "img/player2/fall1.png",
  "img/player2/fall2.png",
  "img/player2/fall3.png",
  "img/player2/fall4.png"]
);
animations['player2Kick'] = new Animator([
  "img/player2/idle.png",
  "img/player2/run1.png",
  "img/player2/run2.png",
  "img/player2/run3.png"]
);

animations['getReady'] = new Animator([
  "img/getready/0000.png",
  "img/getready/0001.png",
  "img/getready/0002.png",
  "img/getready/0003.png",
  "img/getready/0004.png",
  "img/getready/0005.png",
  "img/getready/0006.png",
  "img/getready/0007.png",
  "img/getready/0008.png",
  "img/getready/0009.png",
  "img/getready/0010.png",
  "img/getready/0011.png",
  "img/getready/0012.png",
  "img/getready/0013.png"]
);
animations['getReady'].fadeOut = true;


var gameRenderer = new GameLogics();

gameRenderer.init = () => {
  gameRenderer.initLogic();
  gameRenderer.initAV();

};

gameRenderer.initAV = () => {
  gameRenderer.clientType = ClientType.Spectator;
  gameRenderer.playerIndex = -1;
  gameRenderer.camera = {pos: {x:0, y:0}, residualPos: {x: 0, y: 0}};
  gameRenderer.downKeys = {};
  gameRenderer.downKeys['w'] = false;
  gameRenderer.downKeys['a'] = false;
  gameRenderer.downKeys['s'] = false;
  gameRenderer.downKeys['d'] = false;
  gameRenderer.downKeys[' '] = false;
  gameRenderer.lastInput = null;
  gameRenderer.connected = false;
  gameRenderer.arena = new Image();
  gameRenderer.arena.src = 'img/ArenaFull.jpg';
  gameRenderer.dir = new Image();
  gameRenderer.dir.src = 'img/dir.png';
  gameRenderer.btn = new Image();
  gameRenderer.btn.src = 'img/btn.png';
  gameRenderer.plr1 = new Image();
  gameRenderer.plr1.src = 'img/player1/idle.png';
  gameRenderer.plr2 = new Image();
  gameRenderer.plr2.src = 'img/player2/idle.png';
  gameRenderer.ballHandlerRing = new Image();
  gameRenderer.ballHandlerRing.src = 'img/ballHandler.png';
  gameRenderer.plrshadow = new Image();
  gameRenderer.plrshadow.src = 'img/player/shadow.png';
  gameRenderer.ball = new Image();
  gameRenderer.ball.src = 'img/ironball.png';
  gameRenderer.crowdCheerAudio = new GameAudio("snd/crowdCheer.wav", false);
  gameRenderer.ballAudio = new GameAudio("snd/ball.wav", false);
  gameRenderer.pickupAudio = new GameAudio("snd/pickup.wav", false);
  gameRenderer.whoshAudio = new GameAudio("snd/whosh.wav", false);
  gameRenderer.crowdAudio = new GameAudio("snd/crowd.wav", true);
  gameRenderer.beepAudio = new GameAudio("snd/beep.wav", false);
  gameRenderer.getReadyAudio = new GameAudio("snd/getReady.wav", false);
  gameRenderer.goAudio = new GameAudio("snd/go.wav", false);
  animations['getReady'].size.x = canvas.width;
  animations['getReady'].size.y = canvas.width;
  gameRenderer.arenaID = 0;
};

gameRenderer.isNavigating = () => {
  var isNavigating = false;
  if (gameRenderer.downKeys['a']) isNavigating = true;
  if (gameRenderer.downKeys['s']) isNavigating = true;
  if (gameRenderer.downKeys['d']) isNavigating = true;
  if (gameRenderer.downKeys['w']) isNavigating = true;
  return isNavigating;
};

gameRenderer.getTeam = () => {
  if (gameRenderer.clientType === ClientType.Team1){
    return gameRenderer.team1;
  } else if(gameRenderer.clientType === ClientType.Team2){
    return gameRenderer.team2;
  }
  return null;
};

gameRenderer.render = () => {
  var team = gameRenderer.getTeam();
  
  if (team !== null && !gameRenderer.isNavigating() && gameRenderer.state === GameStates.Playing){
    if (team.indexOf(gameRenderer.ballHandler) === -1){      
      var currentDist = 10e10;
      if (gameRenderer.playerIndex !== -1){
        var player  = team[gameRenderer.playerIndex];
        if (!player.falling){
          currentDist = player.dist(gameRenderer.ballpos);
        }        
      }      
      smallestDist = 10e6;
      closestPlayerIndex = -1;
      for (var i = 0; i < 8; i++){
        var plr = team[i];
        var dist = plr.dist(gameRenderer.ballpos);

        if (dist<smallestDist && !plr.falling){
          smallestDist = dist;
          closestPlayerIndex=i;
        }
      }
      if (gameRenderer.playerIndex !== closestPlayerIndex && currentDist > smallestDist + 150){
        gameRenderer.playerIndex = closestPlayerIndex;
        var msg = { 
          type: "playerIsControlled", 
          playerIndex: gameRenderer.playerIndex, 
          downKeys: gameRenderer.downKeys
        };
        gameRenderer.ws.send(JSON.stringify(msg));
      }
    }
  }

  gameRenderer.updateUserInput();
  if (gameRenderer.crowdAudio.gain.gain.value < 0.5){
    gameRenderer.crowdAudio.gain.gain.value += 0.01;
  }
  ctx.fillStyle="grey";
  ctx.fillRect ( 0 , 0 , canvas.width , canvas.height );

  if (gameRenderer.arena !== null)
  	var viewTargetPos = null;
    if (gameRenderer.playerIndex !== -1){
    	var player = gameRenderer.getTeam()[gameRenderer.playerIndex];
      
      if (player === undefined) return;
      else viewTargetPos = player.pos;
    } else {
      viewTargetPos = gameRenderer.ballpos;      
    }
    
    camposdx = gameRenderer.camera.residualPos.x*gameRenderer.deltaTime/300;
    camposdy = gameRenderer.camera.residualPos.y*gameRenderer.deltaTime/300;
    gameRenderer.camera.residualPos.x -= camposdx;
    gameRenderer.camera.residualPos.y -= camposdy;
    gameRenderer.camera.pos.x += camposdx;
    gameRenderer.camera.pos.y += camposdy;
    var s = 2.5;
    var w = canvas.width*s;
    var h = w*1.8;
    var xlim = canvas.width*((s-1)/2);
    var ylim = h/2 - canvas.height/2;
    var cyoffset = canvas.height/6;
    //var desiredCamPosX = Math.max(Math.min((gameRenderer.ballpos.x + viewTargetPos.x)/2, xlim), -xlim);
    //var desiredCamPosY = Math.max(Math.min((gameRenderer.ballpos.y + viewTargetPos.y)/2-cyoffset, ylim), -ylim -canvas.width/2);
    var desiredCamPosX = Math.max(Math.min((gameRenderer.ballpos.x), xlim), -xlim);
    var desiredCamPosY = Math.max(Math.min((gameRenderer.ballpos.y)-cyoffset, ylim), -ylim -canvas.width/2);
    gameRenderer.camera.residualPos.x = desiredCamPosX - gameRenderer.camera.pos.x;
    gameRenderer.camera.residualPos.y = desiredCamPosY - gameRenderer.camera.pos.y;
    var x = -w/2+canvas.width/2-gameRenderer.camera.pos.x;
    var y = -h/2+canvas.height/2+gameRenderer.camera.pos.y;

    var sc = gameRenderer.arena.width/canvas.width;
    ctx.drawImage(gameRenderer.arena, -x*sc/s, -y*sc/s, canvas.width*sc/s, canvas.height*sc/s, 0, 0, canvas.width, canvas.height);

    gameRenderer.animPlayers(gameRenderer.camera.pos.x, gameRenderer.camera.pos.y);
    gameRenderer.renderBall(gameRenderer.camera.pos.x, gameRenderer.camera.pos.y);

    btnSize = Math.min(canvas.width, canvas.height)/2;
    if (gameRenderer.clientType !== ClientType.Spectator){
      ctx.drawImage(gameRenderer.dir, 0, canvas.height-btnSize, btnSize, btnSize);
      ctx.drawImage(gameRenderer.btn, canvas.width -btnSize, canvas.height-btnSize, btnSize, btnSize);
    }    
    gameRenderer.renderTexts();
    if (gameRenderer.state === GameStates.Playing && gameRenderer.playerIndex !== -1){
      gameRenderer.renderPointer(gameRenderer.camera.pos.x, gameRenderer.camera.pos.y, cyoffset);
    }
    animations["getReady"].render();
    if (gameRenderer.state === GameStates.PreGame && !gameRenderer.playAgainstAI){
      gameRenderer.arenaIDTextBox.render();
      gameRenderer.arenaPlayAgainstAIBtn.render();
    }

};
gameRenderer.renderPointer = (camposx, camposy, cyoffset) => {
  var team = gameRenderer.getTeam();
  if(team !== null){
    var player = team[gameRenderer.playerIndex];
    var dist = player.dist({x: camposx, y: camposy+cyoffset});
    if (dist/scale > 220){
      var dx = camposx - player.pos.x;
      var dy = (camposy+cyoffset) - player.pos.y;
      var angle = Math.atan2(dy, dx);
      ctx.fillStyle = "rgba(200,200,200,0.5)";
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/3);
      ctx.rotate(-angle+Math.PI);

      ctx.beginPath();
      ctx.moveTo(150, 0);
      ctx.lineTo(100, 50);
      ctx.lineTo(100, -50);
      //c2.lineTo(0, 90);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

};
gameRenderer.renderTexts = () => {
  var xloc = 100*scale;
  var yloc = 30*scale;
  var fontsize = 25*scale;
  var teamColor = "#bb5";
  gameRenderer.renderText(gameRenderer.teamName1, {x: xloc, y: yloc}, fontsize, teamColor, "#333");
  gameRenderer.renderText(gameRenderer.score.team1, {x: xloc, y: yloc+fontsize}, fontsize, teamColor, "#333");
  xloc = canvas.width - xloc;
  teamColor = "#59c";
  gameRenderer.renderText(gameRenderer.teamName2, {x: xloc, y: yloc}, fontsize, teamColor, "#333");
  gameRenderer.renderText(gameRenderer.score.team2, {x: xloc, y: yloc+fontsize}, fontsize, teamColor, "#333");
  xloc = canvas.width/2;
  var time = 90 - (gameRenderer.currentTimeStamp - gameRenderer.roundStartTime)/1000;
  gameRenderer.renderText(time.toFixed(0), {x: xloc, y: yloc+fontsize}, fontsize, "#bbb", "#333");
};
gameRenderer.renderText = (txt, loc, size = 30, fill = "#000", stroke = null, strokeWidth = scale) => {

  ctx.textAlign = "center";
  ctx.font = size + "px Arial";
  ctx.fillStyle = fill;
  ctx.fillText(txt,loc.x,loc.y);
  if (stroke !== null){
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = stroke;
    ctx.strokeText(txt,loc.x,loc.y);
  }
};
gameRenderer.touchStart = (e)=>{
  e.preventDefault();
  var touch = null;
  if(e.touches == undefined){
    for (var i = 0; i< menuRenderer.ctrls().length; i++){
      touch = e;
      e.touches = [];
    }     
  } else {
	  touch = e.touches[e.which];  	  
	}
  
  //console.log("touchStart");
  gameRenderer.lastTouch.x = touch.clientX;
  gameRenderer.lastTouch.y = touch.clientY;
  for (var i = 0; i < e.touches.length; i++){
    gameRenderer.updateMoveTouch(e.touches[i], false);
  }
  
  var ctrl = gameRenderer.arenaPlayAgainstAIBtn;  
  if (ctrl.inside({x: touch.clientX, y: touch.clientY})){
    if (ctrl.pressed === false){
      ctrl.pressed = true;
      ctrl.pressAudio.play();
      if (navigator.vibrate){            
        navigator.vibrate(25);            
      }
    }
  } else {
    if (ctrl.pressed === true){
      ctrl.pressed = false;
      ctrl.releaseAudio.play();
    }
  }
  //gameRenderer.updateMoveTouch(touch, false);
  //console.log(e);
};
gameRenderer.touchMove = (e)=>{
  e.preventDefault();
  var touch = null;
  if(e.touches == undefined){
    for (var i = 0; i< menuRenderer.ctrls().length; i++){
      touch = e;
      e.touches = [];
    }     
  } else {
	  touch = e.touches[e.which];  	  
	}
  
  var dx = touch.clientX-gameRenderer.lastTouch.x;
  var dy = touch.clientY-gameRenderer.lastTouch.y;
  gameRenderer.lastTouch.x = touch.clientX;
  gameRenderer.lastTouch.y = touch.clientY;  

  gameRenderer.updateMoveTouch(touch, false, true);
  //console.log("touchMove px: " + gameRenderer.pos.x + " py: " + gameRenderer.pos.y);
  //console.log(touch);
};
gameRenderer.touchEnd = (e)=>{
  e.preventDefault();
  var touch = null;
  if(e.touches == undefined){
    for (var i = 0; i< menuRenderer.ctrls().length; i++){
      touch = e;
      e.touches = [];
    }     
  } else {
	  touch = e.changedTouches[e.which];  	  
	}

  gameRenderer.updateMoveTouch(touch, true);
      
  var ctrl = gameRenderer.arenaPlayAgainstAIBtn;
  if (ctrl.pressed === true){
    ctrl.pressed = false;
    ctrl.releaseAudio.play();
    ctrl.clicked();
  }
  
};
gameRenderer.keyDown = (e)=>{
  e.preventDefault();
  //console.log("'" + e.key + "'");
  gameRenderer.downKeys[e.key] = true;
  //console.log(gameRenderer.downKeys);
};
gameRenderer.keyUp = (e)=>{
  gameRenderer.downKeys[e.key] = false;
};

gameRenderer.setRenderer = () => {
  history.pushState({state: "gameRenderer"}, "game", "index.html");
  gameRenderer.playAgainstAI = false;
  if (currentRenderer !== undefined){
    currentRenderer.unsetRenderer();
  }
  gameRenderer.pickupAudio.play();
  gameRenderer.ballAudio.play();
  canvas.addEventListener("touchstart", gameRenderer.touchStart, {passive: false});
  canvas.addEventListener("touchmove", gameRenderer.touchMove, {passive: false});
  canvas.addEventListener("touchend", gameRenderer.touchEnd, {passive: false});
  window.addEventListener("keydown", gameRenderer.keyDown, {passive: false});
  window.addEventListener("keyup", gameRenderer.keyUp, {passive: false});
  
  canvas.addEventListener("mousedown", gameRenderer.touchStart, false); 
  canvas.addEventListener("mouseup", gameRenderer.touchEnd, false);   
  canvas.addEventListener("mousemove", gameRenderer.touchMove, false);  
  
  gameRenderer.crowdAudio.volume = 0;
  gameRenderer.crowdAudio.play(0);
  gameRenderer.beepAudio.play(0);  
  currentRenderer = gameRenderer;
  //console.log("rendererSet");
  gameRenderer.ws = new WebSocket("ws://" + location.host);
  gameRenderer.arenaIDTextBox = new TextBox('img/txtbx.png', {x: 0.125, y: 0.18}, Control.Sizes["Wide"], "Invite friend to arena ID:", gameRenderer.arenaID.toString(), 32);
  gameRenderer.arenaPlayAgainstAIBtn = new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.35}, Control.Sizes["Wide"], "Play against AI", 32);
  gameRenderer.arenaPlayAgainstAIBtn.clicked = () => {
    gameRenderer.playAgainstAI = true;
    gameRenderer.ws.send(JSON.stringify({type: "arenaPlayAgainstAI"}));
  };
  gameRenderer.ws.onopen = function()
  {
    var msg = {
      type: "arenaConnection", 
      team: JSON.stringify(team),
      arenaID: gameRenderer.arenaID
    };
    gameRenderer.ws.send(JSON.stringify(msg));
    console.log("Connection request is sent...");
    gameRenderer.connected = true;
  };
  
  /**
   * onmessage recieves messages from the server to interpret.
   * @param {object} evt the event from the server contains a type and metadata about the event.
   * @returns {none}
   */  
  gameRenderer.ws.onmessage = function (evt)
  {
    //var received_msg = evt.data;
    //console.log("Message is received..." + received_msg);
    var msg = JSON.parse(evt.data);
    switch (msg.type){
      case "playerReturn":
        var player = null;
        if (msg.team === 1){
          player = gameRenderer.team1[msg.playerIndex];
        } else {
          player = gameRenderer.team2[msg.playerIndex];
        }
        player.returning = true;
        player.posResidual.x = msg.pos.x*scale - player.pos.x;
        player.posResidual.y = msg.pos.y*scale - player.pos.y;
        player.dir = msg.dir;
        gameRenderer.updatePlayerInput(player, msg.downKeys);
        break;
      case "playerMelee":
        var player = null;
        if (msg.team === 1){
          player = gameRenderer.team1[msg.playerIndex];
        } else {
          player = gameRenderer.team2[msg.playerIndex];
        }
        var otherPlayer = null;
        if (msg.otherPlayer.team === 1){
          otherPlayer = gameRenderer.team1[msg.otherPlayer.playerIndex];
        } else {
          otherPlayer = gameRenderer.team2[msg.otherPlayer.playerIndex];
        }
        player.kicking = false;
        otherPlayer.falling = true;
        otherPlayer.animFrameIndex = 0;
        otherPlayer.animFrameTime = gameRenderer.currentTimeStamp;
        otherPlayer.posResidual.x = msg.otherPlayer.pos.x*scale - otherPlayer.pos.x;
        otherPlayer.posResidual.y = msg.otherPlayer.pos.y*scale - otherPlayer.pos.y;

        if (isClient){
          player.kickImpactAudio.play();
          player.fallAudio.play();
        }
        break;
      case "playerInputUpdate":
        var player = null;
        if (msg.team === 1){
          player = gameRenderer.team1[msg.playerIndex];
        } else {
          player = gameRenderer.team2[msg.playerIndex];
        }
        player.posResidual.x = (msg.pos.x*scale - player.pos.x);
        player.posResidual.y = (msg.pos.y*scale - player.pos.y);
        player.dir = msg.dir;
        if (msg.targetDir){
          player.targetDir = msg.targetDir;
          player.speed = 0;          
        }
        gameRenderer.updatePlayerInput(player, msg.downKeys);        
        break;
      case "playerPositionSync":
        var player = null;
        if (msg.team === 1){
          player = gameRenderer.team1[msg.playerIndex];
        } else {
          player = gameRenderer.team2[msg.playerIndex];
        }
        player.posResidual.x = msg.pos.x*scale - player.pos.x;
        player.posResidual.y = msg.pos.y*scale - player.pos.y;
        break;
      case "playerHealthChange":
        var player = null;
        if (msg.team === 1){
          player = gameRenderer.team1[msg.playerIndex];
        } else {
          player = gameRenderer.team2[msg.playerIndex];
        }
        player.health = msg.value;
        break;
      case "ballHandlerChanged":
        var player = null;
        if (msg.team === 1){
          player = gameRenderer.team1[msg.playerIndex];
        } else {
          player = gameRenderer.team2[msg.playerIndex];
        }
        player.posResidual.x = msg.pos.x*scale - player.pos.x;
        player.posResidual.y = msg.pos.y*scale - player.pos.y;
        gameRenderer.ballHandler = player;
        gameRenderer.pickupAudio.play();
        //player.kicking = false;
        if (msg.team === gameRenderer.clientType && gameRenderer.playerIndex !== msg.playerIndex){
          if (gameRenderer.playerIndex !== -1){
            var oldPlayer = gameRenderer.getTeam()[gameRenderer.playerIndex];
            oldPlayer.running = false;  
          }         
          gameRenderer.playerIndex = msg.playerIndex;
          var msg = { 
            type: "playerIsControlled", 
            playerIndex: gameRenderer.playerIndex, 
            downKeys: gameRenderer.downKeys
          };
          gameRenderer.ws.send(JSON.stringify(msg));
        }
        break;
      case "ballSync":
        gameRenderer.ballposResidual.x = msg.pos.x*scale - gameRenderer.ballpos.x;
        gameRenderer.ballposResidual.y = msg.pos.y*scale - gameRenderer.ballpos.y;
        gameRenderer.ballSpeed = msg.speed;
        break;
      case "scoreUpdate":
        //console.log(msg);
        gameRenderer.score = msg.score;
        gameRenderer.crowdCheerAudio.play();
        gameRenderer.beepAudio.play();
        if (msg.restart){                              
          gameRenderer.restartGame();
        }
        break;
      case "roundEnded":
        gameRenderer.roundStartTime = gameRenderer.currentTimeStamp;
        gameRenderer.switchSide();
        gameRenderer.restartGame();
        gameRenderer.getReadyAudio.play();
        this.roundStartTime = this.currentTimeStamp;
        gameRenderer.round += 1;
        if (gameRenderer.round === Rounds.Third){
          menuRenderer.state = MenuStates.GameOverMenu;
          localStorage.winner = gameRenderer.score.team1 > gameRenderer.score.team2 ? gameRenderer.teamName1 : gameRenderer.teamName2;
          history.back();
        }
        break;
      case "changeGameState":
        gameRenderer.setState(msg.state);
        break;
      case "ballThrown":        
        gameRenderer.ballHandler = null;
        gameRenderer.ballSpeed = msg.ballSpeed;
        gameRenderer.ballpos.x = msg.ballpos.x*scale;  
        gameRenderer.ballpos.y = msg.ballpos.y*scale;      
        gameRenderer.ballposResidual = {x: 0.0, y: 0.0, z: 0};
        break;
      case "syncTeamNames":
        gameRenderer.teamName1 = msg.teamName1;
        gameRenderer.teamName2 = msg.teamName2;        
        break;
      case "connected":
        gameRenderer.clientType = msg.clientType;
        gameRenderer.ballpos = msg.ballpos;
        gameRenderer.currentTimeStamp = Date.now();
        gameRenderer.lastTimeStamp = gameRenderer.currentTimeStamp;         
        gameRenderer.deltaTime = 0;
        gameRenderer.roundStartTime = gameRenderer.lastTimeStamp + msg.roundStartTime;
        gameRenderer.teamName1 = msg.teamName1;
        gameRenderer.teamName2 = msg.teamName2;
        gameRenderer.round = msg.round;
        gameRenderer.score = msg.score;
        gameRenderer.state = msg.state;
        for (var i = 0; i < msg.team1.length; i++){
          gameRenderer.team1[i].sync(msg.team1[i]);
          gameRenderer.team2[i].sync(msg.team2[i]);
        }
        break;
      
      default:
        console.log(evt.data);
    }
  };

  gameRenderer.ws.onclose = function()
  {
    console.log("Connection is closed...");
    gameRenderer.crowdAudio.stop();
    menuRenderer.setRenderer();
  };

  window.onbeforeunload = function(event) {
    gameRenderer.ws.close();
  };
};


gameRenderer.unsetRenderer = () => {
  canvas.removeEventListener("touchstart", gameRenderer.touchStart);
  canvas.removeEventListener("touchmove", gameRenderer.touchMove);
  canvas.removeEventListener("touchend", gameRenderer.touchEnd);
  window.removeEventListener("keydown", gameRenderer.keyDown);
  window.removeEventListener("keyup", gameRenderer.keyUp);
  
  canvas.removeEventListener("mousedown", gameRenderer.touchStart); 
  canvas.removeEventListener("mouseup", gameRenderer.touchEnd);   
  canvas.removeEventListener("mousemove", gameRenderer.touchMove);  
  
  currentRenderer = null;
  gameRenderer.ws.close();
  //console.log("rendererUnset");
};
gameRenderer.updateMoveTouch = (touch, release, slide = false) => {
	if (touch == undefined) {
		gameRenderer.downKeys['a'] = false;
    gameRenderer.downKeys['s'] = false;
    gameRenderer.downKeys['d'] = false;
    gameRenderer.downKeys['w'] = false;
    gameRenderer.downKeys[' '] = false;
    return;
	}
  if (touch.clientY>canvas.height-canvas.width/2){
    if(touch.clientX<canvas.width/2){
      gameRenderer.downKeys['a'] = false;
      gameRenderer.downKeys['s'] = false;
      gameRenderer.downKeys['d'] = false;
      gameRenderer.downKeys['w'] = false;

      if (release){

      } else {        
        if (touch.clientY > canvas.height-2*canvas.width/10)
          gameRenderer.downKeys['s'] = true;
        if (touch.clientY < canvas.height-3*canvas.width/10)
          gameRenderer.downKeys['w'] = true;
        if (touch.clientX > 3*canvas.width/10)
          gameRenderer.downKeys['d'] = true;
        if (touch.clientX < 2*canvas.width/10)
          gameRenderer.downKeys['a'] = true;
      }
    } else {
      gameRenderer.downKeys[' '] = false;
      if (release || slide){

      } else {
        gameRenderer.downKeys[' '] = true;
        if (navigator.vibrate){
          navigator.vibrate(25);
        }
      }
    }
  } else {
    
    
  }
};

gameRenderer.updateUserInput = () => {

  if (gameRenderer.connected){
    var newInput = JSON.stringify(gameRenderer.downKeys);
    if (newInput !== gameRenderer.lastInput){
      gameRenderer.ws.send(JSON.stringify({type: "userInputUpdate", playerIndex: gameRenderer.playerIndex,  downKeys: gameRenderer.downKeys}));
      gameRenderer.lastInput = newInput;
    }
  }

};

gameRenderer.animPlayers = (camposx, camposy) => {
  var nonFallenPlayers = [];
  for (var i = 0; i < gameRenderer.team1.length; i++){
    var player = gameRenderer.team1[i];
    if (!player.falling){
      nonFallenPlayers.push(player);
    } else {
      gameRenderer.animPlayer(camposx, camposy, player);
    }
  }
  for (var i = 0; i < gameRenderer.team2.length; i++){
    var player = gameRenderer.team2[i];
    if (!player.falling){
      nonFallenPlayers.push(player);
    } else {
      gameRenderer.animPlayer(camposx, camposy, player);
    }
  }
  for (var i = 0; i < nonFallenPlayers.length; i++){
    var player = nonFallenPlayers[i];
    gameRenderer.animPlayer(camposx, camposy, player);
  }
};
gameRenderer.animPlayer = (camposx, camposy, player) => {
  var plrw = canvas.width/5;
  var plrh = plrw;
  var pxpos = player.pos.x + canvas.width/2 - camposx;
  var pypos = -player.pos.y + canvas.height/2 + camposy;
  ctx.save();
  ctx.translate(pxpos, pypos);
  ctx.rotate(-player.dir-Math.PI/2);
  ctx.translate(-plrw/2, -plrh/2);
  if (player.falling){
    var anim = player.team === 1 ? 'player1Fall' : 'player2Fall';
    var frame = animations[anim].frames[Math.min(4, player.animFrameIndex)];
    ctx.drawImage(gameRenderer.plrshadow, 0, 0, plrw, plrh);
    ctx.drawImage(frame, 0, 0, plrw, plrh);
  } else if (player.kicking){
    var anim = player.team === 1 ? 'player1Kick' : 'player2Kick';
    var frame = animations[anim].frames[Math.min(3, player.animFrameIndex)];
    ctx.drawImage(gameRenderer.plrshadow, 0, 0, plrw, plrh);
    ctx.drawImage(frame, 0, 0, plrw, plrh);
  } else if(player.throwing) {
    var anim = player.team === 1 ? 'player1Throw' : 'player2Throw';
    var frame = animations[anim].frames[Math.min(5, player.animFrameIndex)];
    ctx.drawImage(gameRenderer.plrshadow, 0, 0, plrw, plrh);
    ctx.drawImage(frame, 0, 0, plrw, plrh);
  } else if (player.running){
    var anim = player.team === 1 ? 'player1Run' : 'player2Run';
    var frame = animations[anim].frames[player.animFrameIndex%8];
    ctx.drawImage(gameRenderer.plrshadow, 0, 0, plrw, plrh);
    ctx.drawImage(frame, 0, 0, plrw, plrh);
  } else {
    ctx.drawImage(gameRenderer.plrshadow, 0, 0, plrw, plrh);
    ctx.drawImage(player.team === 1 ? gameRenderer.plr1 : gameRenderer.plr2, 0, 0, plrw, plrh);
  }
  if (player === gameRenderer.ballHandler){
    ctx.drawImage(gameRenderer.ballHandlerRing, 0, 0, plrw, plrh);
  }
  ctx.restore();
  ctx.save();
  ctx.translate(pxpos, pypos);

  ctx.beginPath();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 4;
  ctx.moveTo(-27*scale,50*scale);
  ctx.lineTo(27*scale,50*scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#b55';
  ctx.moveTo(-25*scale,50*scale);
  ctx.lineTo((25)*scale, 50*scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = '#5b5';
  /*if (player.health<50){
    ctx.strokeStyle = '#aa5';
  }
  if (player.health<25){
    ctx.strokeStyle = '#b55';
  }*/
  ctx.lineWidth = 2;
  ctx.moveTo(-25*scale,50*scale);
  ctx.lineTo((-25+player.health/2)*scale, 50*scale);    
  ctx.stroke();
  
  
  
  ctx.restore();
};

gameRenderer.renderBall = (camposx, camposy) => {
  if (gameRenderer.ballHandler === null){
    var ballsz = canvas.width/40*(1+gameRenderer.ballpos.z*0.2);
    var pxpos = gameRenderer.ballpos.x + canvas.width/2 - camposx - ballsz;
    var pypos = -gameRenderer.ballpos.y + canvas.height/2 + camposy - ballsz;

    ctx.drawImage(gameRenderer.plrshadow, pxpos, pypos, ballsz*2, ballsz*2);

    var pxpos = gameRenderer.ballpos.x + canvas.width/2 - camposx - ballsz/2;
    var pypos = -gameRenderer.ballpos.y + canvas.height/2 + camposy - ballsz/2;
    ctx.drawImage(gameRenderer.ball, pxpos, pypos, ballsz, ballsz);
  }
};
