
window.oncontextmenu = function(event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
};

var ClientType = {
  Team1: 1,
  Team2: 2,
  Spectator: 0
};
var upgradeImages = [
	GetImage("img/items/coins.png"),
	GetImage("img/items/speedupgrade.png"), 
	GetImage("img/items/throwupgrade.png"),
	GetImage("img/items/stamminaupgrade.png"),
	GetImage("img/items/accelerationupgrade.png"),
	GetImage("img/items/kickupgrade.png"),
	GetImage("img/items/intelligenceupgrade.png"),
	GetImage("img/items/enduranceupgrade.png"),
	GetImage("img/items/medkit.png")
];
var upgradeSounds = [];

var animations = {};
animations['player1Run'] = new Animator([
  "img/player1/sm_run1.png",
  "img/player1/sm_run2.png",
  "img/player1/sm_run3.png",
  "img/player1/sm_run4.png",
  "img/player1/sm_run5.png",
  "img/player1/sm_run6.png",
  "img/player1/sm_run7.png",
  "img/player1/sm_run8.png"]
);

animations['player1Throw'] = new Animator([
  "img/player1/sm_throw1.png",
  "img/player1/sm_throw2.png",
  "img/player1/sm_throw3.png",
  "img/player1/sm_throw4.png",
  "img/player1/sm_throw5.png",
  "img/player1/sm_throw6.png"]
);

animations['player1Fall'] = new Animator([
  "img/player1/sm_idle.png",
  "img/player1/sm_fall1.png",
  "img/player1/sm_fall2.png",
  "img/player1/sm_fall3.png",
  "img/player1/sm_fall4.png"]
);
animations['player1Kick'] = new Animator([
  "img/player1/sm_idle.png",
  "img/player1/sm_run1.png",
  "img/player1/sm_run2.png",
  "img/player1/sm_run3.png"]
);

animations['player2Run'] = new Animator([
  "img/player2/sm_run1.png",
  "img/player2/sm_run2.png",
  "img/player2/sm_run3.png",
  "img/player2/sm_run4.png",
  "img/player2/sm_run5.png",
  "img/player2/sm_run6.png",
  "img/player2/sm_run7.png",
  "img/player2/sm_run8.png"]
);
animations['player2Throw'] = new Animator([
  "img/player2/sm_throw1.png",
  "img/player2/sm_throw2.png",
  "img/player2/sm_throw3.png",
  "img/player2/sm_throw4.png",
  "img/player2/sm_throw5.png",
  "img/player2/sm_throw6.png"]
);
animations['player2Fall'] = new Animator([
  "img/player2/sm_idle.png",
  "img/player2/sm_fall1.png",
  "img/player2/sm_fall2.png",
  "img/player2/sm_fall3.png",
  "img/player2/sm_fall4.png"]
);
animations['player2Kick'] = new Animator([
  "img/player2/sm_idle.png",
  "img/player2/sm_run1.png",
  "img/player2/sm_run2.png",
  "img/player2/sm_run3.png"]
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


ArenaMenuStates = {
  SinglePlayerStartMenu: 0,
  InGameMenu: 1,
  TacticsMenu: 2,
  FormationsMenu: 3,
  WaitForOpponentMenu: 4
}

gameRenderer.initAV = () => {
  gameRenderer.clientType = ClientType.Spectator;
  gameRenderer.playerIndex = -1;
  gameRenderer.camera = {pos: {x: 0, y: 0}, residualPos: {x: 0, y: 0}};
  gameRenderer.arenaMenuPos = {x: 1, y: 0};
  gameRenderer.arenaMenuSpeed = {x: 0, y: 0};
  gameRenderer.arenaMenuState = 0;
  gameRenderer.handsOff = false;
  gameRenderer.lastLoc = {x:0, y:0};
  gameRenderer.downKeys = {};
  gameRenderer.downKeys['w'] = false;
  gameRenderer.downKeys['a'] = false;
  gameRenderer.downKeys['s'] = false;
  gameRenderer.downKeys['d'] = false;
  gameRenderer.downKeys[' '] = false;
  gameRenderer.lastInput = null;
  gameRenderer.connected = false;
  gameRenderer.arena = new Image();
  gameRenderer.arena.src = 'img/sm_ArenaFull.jpg';
  gameRenderer.arenaMenu = new Image();
  gameRenderer.arenaMenu.src = 'img/sm_arenaMenu.png';
  gameRenderer.dir = new Image();
  gameRenderer.dir.src = 'img/dir.png';
  gameRenderer.selected = new Image();
  gameRenderer.selected.src = 'img/selected.png';
  gameRenderer.btn = new Image();
  gameRenderer.btn.src = 'img/btn.png';
  gameRenderer.plr1 = new Image();
  gameRenderer.plr1.src = 'img/player1/sm_idle.png';
  gameRenderer.plr2 = new Image();
  gameRenderer.plr2.src = 'img/player2/sm_idle.png';
  gameRenderer.ballHandlerRing = new Image();
  gameRenderer.ballHandlerRing.src = 'img/ballHandler.png';
  gameRenderer.plrshadow = new Image();
  gameRenderer.plrshadow.src = 'img/sm_shadow.png';
  gameRenderer.ball = new Image();
  gameRenderer.ball.src = 'img/sm_ironball.png';
  gameRenderer.crowdCheerAudio = new GameAudio("snd/crowdCheer.wav", false);
  gameRenderer.ballAudio = new GameAudio("snd/ball.wav", false);
  gameRenderer.pickupAudio = new GameAudio("snd/pickup.wav", false);  
  gameRenderer.whoshAudio = new GameAudio("snd/whosh.wav", false);
  gameRenderer.crowdAudio = new GameAudio("snd/crowd.wav", true);
  gameRenderer.beepAudio = new GameAudio("snd/beep.wav", false);
  gameRenderer.scoreAudio = new GameAudio("snd/score.wav", false, 1);
  gameRenderer.getReadyAudio = new GameAudio("snd/getReady.wav", false);
  gameRenderer.goAudio = new GameAudio("snd/go.wav", false);

  animations['getReady'].size.x = canvas.width;
  animations['getReady'].size.y = canvas.width;
  gameRenderer.arenaID = 0;
  gameRenderer.arenaMenus = {};
  
  if (upgradeSounds.length == 0){
  	upgradeSounds = [
			new GameAudio("snd/coinsPickup.wav", false),
			new GameAudio("snd/pickupUpgrade.wav", false, 0.5), 
			new GameAudio("snd/pickupUpgrade.wav", false, 0.5),
			new GameAudio("snd/pickupUpgrade.wav", false, 0.5),
			new GameAudio("snd/pickupUpgrade.wav", false, 0.5),
			new GameAudio("snd/pickupUpgrade.wav", false, 0.5),
			new GameAudio("snd/pickupUpgrade.wav", false, 0.5),
			new GameAudio("snd/pickupUpgrade.wav", false, 0.5),
			new GameAudio("snd/medkitPickup.wav", false, 0.5)
		];
  }
  
  var ctrls = [];
  gameRenderer.arenaMenus[ArenaMenuStates.SinglePlayerStartMenu] = ctrls;
  ctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.18}, Control.Sizes["Wide"], "Invite friend to arena ID:", gameRenderer.arenaID.toString(), 32));
  ctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.35}, Control.Sizes["Wide"], "Play against AI", 30, "dark"));
  ctrls[0].editable = false;
  ctrls[1].clicked = () => {
    gameRenderer.playAgainstAI = true;
    gameRenderer.ws.send(JSON.stringify({t: MsgTypes.ArenaPlayAgainstAI}));    
    gameRenderer.arenaMenuSpeed.x = 0.3;
    gameRenderer.arenaMenuState = ArenaMenuStates.InGameMenu;
  };
  
  var ctrls = [];
  gameRenderer.arenaMenus[ArenaMenuStates.InGameMenu] = ctrls;
  ctrls.push(new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "Formations", 30, "dark"));
  ctrls.push(new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.20}, Control.Sizes["Wide"], "Tactics", 30, "dark"));
  ctrls[0].clicked = () => {    
    gameRenderer.arenaMenuState = ArenaMenuStates.FormationsMenu;
  };
  
  
  var ctrls = [];
  gameRenderer.arenaMenus[ArenaMenuStates.WaitForOpponentMenu] = ctrls;
  ctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.18}, Control.Sizes["Wide"], "Wait for:", "Opponent", 32));
  ctrls[0].editable = false;
  gameRenderer.initFormationsMenu();
  
};

gameRenderer.initFormationsMenu = () => {
	var ctrls = [];
  gameRenderer.arenaMenus[ArenaMenuStates.FormationsMenu] = ctrls;  
  ctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark"));
  ctrls[0].clicked = () => {    
    gameRenderer.arenaMenuState = ArenaMenuStates.InGameMenu;
  };
  var counter = 0;
  for (formationsIndex in team.formations){
  	var formation = team.formations[formationsIndex];
  	var positionsName = formation.name;
  	var pos = formation.positions;
  	var btn = new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.065+counter*0.125}, Control.Sizes["Wide"], positionsName, 30, "dark"); 
		btn.formationIndex = formationsIndex;
  	btn.clicked = (sender) => {
  		var msg = { 
        t: MsgTypes.ChangeFormation, 
        frm: team.formations[sender.formationIndex].positions // defaultPositions[sender.text]        
      }
			gameRenderer.ws.send(JSON.stringify(msg));
			gameRenderer.arenaMenuSpeed.x = 0.3;
  	}
  	ctrls.push(btn);
  	counter++;
  }
}

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
          t: MsgTypes.PlayerIsControlled, 
          pi: gameRenderer.playerIndex, 
          bk: k2b(gameRenderer.downKeys)
        };
        if (gameRenderer.ws.readyState == gameRenderer.ws.OPEN)
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

  if (gameRenderer.arena !== null){
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
    
    var desiredCamPosX = Math.clamp(gameRenderer.ballpos.x, -xlim, xlim);
    var desiredCamPosY = Math.clamp(gameRenderer.ballpos.y-cyoffset, -ylim-canvas.width/2, ylim);
    gameRenderer.camera.residualPos.x = desiredCamPosX - gameRenderer.camera.pos.x;
    gameRenderer.camera.residualPos.y = desiredCamPosY - gameRenderer.camera.pos.y;
    var x = -w/2+canvas.width/2-gameRenderer.camera.pos.x;
    var y = -h/2+canvas.height/2+gameRenderer.camera.pos.y;

    var sc = gameRenderer.arena.width/canvas.width;
    ctx.drawImage(gameRenderer.arena, -x*sc/s, -y*sc/s, canvas.width*sc/s, canvas.height*sc/s, 0, 0, canvas.width, canvas.height);

		for (var i in gameRenderer.upgrades){
			var item = gameRenderer.upgrades[i];
			gameRenderer.renderItem(item, gameRenderer.camera.pos.x, gameRenderer.camera.pos.y);
		}

    gameRenderer.animPlayers(gameRenderer.camera.pos.x, gameRenderer.camera.pos.y);
    gameRenderer.renderBall(gameRenderer.camera.pos.x, gameRenderer.camera.pos.y);

    btnSize = Math.min(canvas.width, canvas.height)/2;
    if (gameRenderer.clientType !== ClientType.Spectator && !gameRenderer.handsOff){
      ctx.drawImage(gameRenderer.dir, 0, canvas.height-btnSize, btnSize, btnSize);
      ctx.drawImage(gameRenderer.btn, canvas.width -btnSize, canvas.height-btnSize, btnSize, btnSize);
    }    
    gameRenderer.renderTexts();
    
    animations["getReady"].render();
    if (gameRenderer.state === GameStates.PreGame && !gameRenderer.playAgainstAI){
      //gameRenderer.arenaIDTextBox.render();
      //gameRenderer.arenaPlayAgainstAIBtn.render();
    }	
	}
	if (gameRenderer.arenaMenuPos.x < 1){
		ctx.save();
    ctx.translate(gameRenderer.arenaMenuPos.x*canvas.width, 0);
		ctx.drawImage(gameRenderer.arenaMenu,0 , 0, canvas.width, canvas.height);
		if (gameRenderer.arenaMenuState != -1){
			ctrls = gameRenderer.arenaMenus[gameRenderer.arenaMenuState];
			for (var i = 0; i < ctrls.length; i++){
		    var ctrl = ctrls[i];
		    ctrl.render();
		  }
		}
		ctx.restore();
	}
	gameRenderer.arenaMenuPos.x += gameRenderer.arenaMenuSpeed.x;
	
	if (gameRenderer.arenaMenuPos.x < 0.5){
		gameRenderer.arenaMenuSpeed.x -= gameRenderer.arenaMenuPos.x/50; 
	} else {
		gameRenderer.arenaMenuSpeed.x += (1.1-gameRenderer.arenaMenuPos.x)/50; 
	}
	gameRenderer.arenaMenuSpeed.x *= 0.8;

	if (gameRenderer.playerIndex!=-1 && !gameRenderer.handsOff){
		var selectedPlayer = gameRenderer.getTeam()[gameRenderer.playerIndex];
		var selectItem = {
			pos: {
				x: selectedPlayer.pos.x/scale, 
				y: selectedPlayer.pos.y/scale+30
			}, 
			image: gameRenderer.selected, 
			size: {
				x: 20, 
				y: 15 
			}
		}
		gameRenderer.renderItem(selectItem, gameRenderer.camera.pos.x, gameRenderer.camera.pos.y);
		if (gameRenderer.state === GameStates.Playing){
      gameRenderer.renderPointer(gameRenderer.camera.pos.x, gameRenderer.camera.pos.y, cyoffset);
    }
	}
	
}
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
  var time = roundTime - (gameRenderer.currentTimeStamp - gameRenderer.roundStartTime)/1000;
  gameRenderer.renderText(time.toFixed(0), {x: xloc, y: yloc+fontsize}, fontsize, "#bbb", "#333");
};
gameRenderer.renderText = (txt, loc, size = 30, fill = "#000", stroke = null, strokeWidth = scale) => {

  ctx.textAlign = "center";
  ctx.font = size + "px Sans";
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
  gameRenderer.touching = true;
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
  
  if (gameRenderer.arenaMenuPos.x<1){
		ctrls = gameRenderer.arenaMenus[gameRenderer.arenaMenuState];
		for (var i = 0; i < ctrls.length; i++){
		  var ctrl = ctrls[i];
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
		}
  }
}
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

}
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
	if (e.touches.length==0) gameRenderer.touching = false;
  gameRenderer.updateMoveTouch(touch, true);
  if (gameRenderer.arenaMenuPos.x<1){
  ctrls = gameRenderer.arenaMenus[gameRenderer.arenaMenuState];
		for (var i = 0; i < ctrls.length; i++){
			var ctrl = ctrls[i];
			if (ctrl.pressed === true){
				ctrl.pressed = false;
				ctrl.releaseAudio.play();
				ctrl.clicked(ctrl);
			}
		}
  }
	
}
gameRenderer.keyDown = (e)=>{
  e.preventDefault();
  //console.log("'" + e.key + "'");
  gameRenderer.downKeys[e.key] = true;
  //console.log(gameRenderer.downKeys);
}
gameRenderer.keyUp = (e)=>{
  gameRenderer.downKeys[e.key] = false;
}

gameRenderer.setRenderer = () => {
  history.pushState({state: "gameRenderer"}, "game", "index.html");
  gameRenderer.playAgainstAI = false;
  gameRenderer.playerIndex = -1;
  gameRenderer.ballHandler = null;
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
    
  gameRenderer.ws = new WebSocket("wss://" + location.host);  
  gameRenderer.ws.onopen = function()
  {
    var msg = {
      t: MsgTypes.ArenaConnection, 
      tm: JSON.stringify(team),
      arenaID: gameRenderer.arenaID,
      handsOff: gameRenderer.handsOff,
      teamId: menuRenderer.tournament.teamId
    }
    gameRenderer.ws.send(JSON.stringify(msg));
    console.log("Connection request is sent...");
    gameRenderer.connected = true;
  }
  
  /**
   * onmessage recieves messages from the server to interpret.
   * @param {object} evt the event from the server contains a type and metadata about the event.
   * @returns {none}
   */  
  gameRenderer.ws.onmessage = function (evt)
  {    
    var msg = JSON.parse(evt.data);    
    switch (msg.t){
      case MsgTypes.PlayerReturn:
        var player = null;
        if (msg.tm === 1){
          player = gameRenderer.team1[msg.pi];
        } else {
          player = gameRenderer.team2[msg.pi];
        }
        player.returning = true;
        player.posResidual.x = msg.pos.x*scale - player.pos.x;
        player.posResidual.y = msg.pos.y*scale - player.pos.y;
        player.dir = msg.dir;
        gameRenderer.updatePlayerInput(player, msg.bk);
        break;
      case MsgTypes.PlayerMelee:
        var player = null;
        if (msg.tm === 1){
          player = gameRenderer.team1[msg.pi];
        } else {
          player = gameRenderer.team2[msg.pi];
        }
        var otherPlayer = null;
        if (msg.op.tm === 1){
          otherPlayer = gameRenderer.team1[msg.op.pi];
        } else {
          otherPlayer = gameRenderer.team2[msg.op.pi];
        }
        player.kicking = false;
        otherPlayer.falling = true;
        otherPlayer.animFrameIndex = 0;
        otherPlayer.animFrameTime = gameRenderer.currentTimeStamp;
        otherPlayer.posResidual.x = msg.op.pos.x*scale - otherPlayer.pos.x;
        otherPlayer.posResidual.y = msg.op.pos.y*scale - otherPlayer.pos.y;

        if (isClient){
          player.kickImpactAudio.play();
          player.fallAudio.play();
        }
        break;
      case MsgTypes.PlayerInputUpdate:
        var player = null;
        if (msg.tm === 1){
          player = gameRenderer.team1[msg.pi];
        } else {
          player = gameRenderer.team2[msg.pi];
        }
        player.posResidual.x = (msg.pos.x*scale - player.pos.x);
        player.posResidual.y = (msg.pos.y*scale - player.pos.y);
        player.dir = msg.dir;
        if (msg.tdir){
          player.targetDir = msg.tdir;
          player.speed = 0;          
        }
//        console.log(b2k(msg.bk)); 
        gameRenderer.updatePlayerInput(player, msg.bk);        
        break;
      case MsgTypes.PlayerPositionSync:
        var player = null;
        if (msg.tm === 1){
          player = gameRenderer.team1[msg.pi];
        } else {
          player = gameRenderer.team2[msg.pi];
        }
        player.posResidual.x = msg.pos.x*scale - player.pos.x;
        player.posResidual.y = msg.pos.y*scale - player.pos.y;
        break;
      case MsgTypes.PlayerHealthChange:
        var player = null;
        if (msg.tm === 1){
          player = gameRenderer.team1[msg.pi];
        } else {
          player = gameRenderer.team2[msg.pi];
        }
        player.health = msg.value;
        break;
      case MsgTypes.BallHandlerChanged:
        var player = null;
        if (msg.tm === 1){
          player = gameRenderer.team1[msg.pi];
        } else {
          player = gameRenderer.team2[msg.pi];
        }
        player.posResidual.x = msg.pos.x*scale - player.pos.x;
        player.posResidual.y = msg.pos.y*scale - player.pos.y;
        gameRenderer.ballHandler = player;
        gameRenderer.pickupAudio.play();
        //player.kicking = false;
        if (msg.tm === gameRenderer.clientType && gameRenderer.playerIndex !== msg.pi){
          if (gameRenderer.playerIndex !== -1){
            var oldPlayer = gameRenderer.getTeam()[gameRenderer.playerIndex];
            oldPlayer.running = false;   
          }         
          gameRenderer.playerIndex = msg.pi;
          var msg = { 
            t: MsgTypes.PlayerIsControlled, 
            pi: gameRenderer.playerIndex, 
            bk: k2b(gameRenderer.downKeys)
          };
          gameRenderer.ws.send(JSON.stringify(msg));
        }
        break;
      case MsgTypes.BallSync:
        gameRenderer.ballposResidual.x = msg.pos.x*scale - gameRenderer.ballpos.x;
        gameRenderer.ballposResidual.y = msg.pos.y*scale - gameRenderer.ballpos.y;
        gameRenderer.ballSpeed = msg.spd;
        break;
      case MsgTypes.ScoreUpdate:
        //console.log(msg);
        gameRenderer.score = msg.score;
        gameRenderer.crowdCheerAudio.play();
        gameRenderer.beepAudio.play();
        gameRenderer.scoreAudio.play();
        if (msg.restart){                              
          gameRenderer.restartGame();
        }
        break;
      case MsgTypes.RoundEnded:
        gameRenderer.roundStartTime = gameRenderer.currentTimeStamp;
        gameRenderer.switchSide();
        gameRenderer.restartGame();
        gameRenderer.getReadyAudio.play();
        this.roundStartTime = this.currentTimeStamp;
        gameRenderer.round += 1;
        
        break;
      case MsgTypes.ChangeGameState:
      	if (gameRenderer.state == GameStates.PreGame && msg.state == GameStates.GetReady){
      		gameRenderer.arenaMenuState = ArenaMenuStates.InGameMenu;
      		gameRenderer.arenaMenuSpeed.x = 0.3;
      	}
      	if (gameRenderer.state === GameStates.Finished){
          menuRenderer.state = MenuStates.GameOverMenu;
          menuRenderer.renderScreen = false;
          if (gameRenderer.score.team1 === gameRenderer.score.team2){
          	localStorage.winner = "Tie";
          } else {
          	localStorage.winner = gameRenderer.score.team1 > gameRenderer.score.team2 ? gameRenderer.teamName1 : gameRenderer.teamName2;
          }
          history.back();
        }
        gameRenderer.setState(msg.state);
        break;
      case MsgTypes.BallThrown:      
      	//console.log("BallThrown"); 
      	//console.log(evt.data); 
        var bh = gameRenderer.ballHandler;
        gameRenderer.ballSpeed = msg.spd;
        gameRenderer.ballpos.x = bh.pos.x;   
        gameRenderer.ballpos.y = bh.pos.y;   
        gameRenderer.ballpos.z = msg.bp.z;     
        gameRenderer.ballHandler = null;
        gameRenderer.ballposResidual = {
        	x: msg.bp.x*scale - bh.pos.x, 
        	y: msg.bp.y*scale - bh.pos.y, 
        	z: 0
        };
        break;
      case MsgTypes.SyncTeamNames:
        gameRenderer.teamName1 = msg.tn1;
        gameRenderer.teamName2 = msg.tn2;        
        break;
      case MsgTypes.Connected:
      	console.log("connected");
        gameRenderer.clientType = msg.ct;
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
        gameRenderer.playerIndex = -1;
        gameRenderer.upgrades = [];
        for (var i in msg.upgrades){
        	var upgrade = msg.upgrades[i];
        	upgrade.image = upgradeImages[upgrade.type];
        	gameRenderer.upgrades.push(upgrade);
        }
        for (var i = 0; i < msg.team1.length; i++){
          gameRenderer.team1[i].sync(msg.team1[i]);
          gameRenderer.team2[i].sync(msg.team2[i]);
        }
        if (gameRenderer.state != GameStates.PreGame) {
        	gameRenderer.arenaMenuState = ArenaMenuStates.InGameMenu;
 					gameRenderer.arenaMenuSpeed.x = 0.3;
        } else {
        	gameRenderer.arenaMenuState = ArenaMenuStates.WaitForOpponentMenu;
 					gameRenderer.arenaMenuSpeed.x = -0.3;
 					gameRenderer.arenaMenus[ArenaMenuStates.SinglePlayerStartMenu][0].value = gameRenderer.arenaID.toString();
        }
        break;
      case MsgTypes.UpgradeTaken:
      	gameRenderer.removeUpgrade(msg.upg.id);
      	upgradeSounds[msg.upg.type].play();
      	if (msg.upg.type == UpgradeTypes.HealthUpgrade){
      		var player = msg.tm === 1 ?  gameRenderer.team1[msg.pi] : gameRenderer.team2[msg.pi];		     
		      player.health = Math.min(100, player.health + 20);
      	}

      	break;
      case MsgTypes.SpawnUpgrade:
      	var upgrade = msg.upg;
      	upgrade.image = upgradeImages[upgrade.type];
      	gameRenderer.upgrades.push(upgrade);
      	break;
      default:
        console.log(evt.data);
        var type = Object.keys(MsgTypes).find(key => MsgTypes[key] === msg.t)
        console.log("type: " + type);
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

gameRenderer.getUpgrade = (id) => {
	for (i in gameRenderer.upgrades){
		var upgrade = gameRenderer.upgrades[i];
		if (upgrade.id == id) return upgrade;
	}
	return null;
}

gameRenderer.removeUpgrade = (id) => {
	for (i in gameRenderer.upgrades){
		var upgrade = gameRenderer.upgrades[i];
		if (upgrade.id == id){
			gameRenderer.upgrades.splice(i, 1);
			return;
		}
	}

}

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
  	
	  var loc = {x: touch.clientX, y: touch.clientY};
	  var delta = {x: loc.x-gameRenderer.lastLoc.x, y: loc.y-gameRenderer.lastLoc.y};
    
	  gameRenderer.lastLoc = loc;
	  if (slide && gameRenderer.touching){
	  	gameRenderer.arenaMenuSpeed.x += delta.x/canvas.width;
  	}
  }
};

gameRenderer.updateUserInput = () => {
  if (gameRenderer.connected){
    var newInput = k2b(gameRenderer.downKeys); // JSON.stringify(gameRenderer.downKeys);
    if (newInput !== gameRenderer.lastInput){
      //console.log(newInput);
      gameRenderer.ws.send(JSON.stringify({t: MsgTypes.UserInputUpdate, pi: gameRenderer.playerIndex,  bk: newInput}));
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
  var plrw = canvas.width/6;
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

  ctx.lineWidth = 2;
  ctx.moveTo(-25*scale,50*scale);
  ctx.lineTo((-25+player.health/2)*scale, 50*scale);    
  ctx.stroke();
  
  
  
  ctx.restore();
};

gameRenderer.renderItem = (item, camposx, camposy) => {
  
  var pxpos = item.pos.x*scale + canvas.width/2 - camposx -item.size.y*scale/2;
  var pypos = -item.pos.y*scale + canvas.height/2 + camposy - item.size.y*scale;
  ctx.drawImage(item.image, pxpos, pypos, item.size.x*scale, item.size.y*scale);

}

gameRenderer.renderBall = (camposx, camposy) => {
  if (gameRenderer.ballHandler === null){
    var ballsz = canvas.width/50*(1+gameRenderer.ballpos.z*0.5); 
    var pxpos = gameRenderer.ballpos.x + canvas.width/2 - camposx - ballsz;
    var pypos = -gameRenderer.ballpos.y + canvas.height/2 + camposy - ballsz;

    ctx.drawImage(gameRenderer.plrshadow, pxpos, pypos, ballsz*2, ballsz*2);

    var pxpos = gameRenderer.ballpos.x + canvas.width/2 - camposx - ballsz/2;
    var pypos = -gameRenderer.ballpos.y + canvas.height/2 + camposy - ballsz/2;
    ctx.drawImage(gameRenderer.ball, pxpos, pypos, ballsz, ballsz);
  }
}
