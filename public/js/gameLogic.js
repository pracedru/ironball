var isServer = typeof isClient !== "undefined" ? !isClient : true;
var isClient = !isServer;
var scale = isClient ? scale : 1;

var places = [
  {x: 0, y: -760},			//0 goalee
  {x: -260, y: -708},	//1
  {x: 260, y: -708},	//2
  {x: -140, y: -628},	//3
  {x: 140, y: -628},	//4
  {x: -182, y: -297},	//5
  {x: 182, y: -297},	//6
  {x: 0, y: -243},		//7
  {x: 0, y: -100},		//8
  {x: -184, y: -65},	//9
  {x: 184, y: -65},		//10
  {x: -320, y: 182},	//11
  {x: 320, y: 182},		//12
  {x: 0, y: 385},			//13
  {x: -212, y: 458},	//14
  {x: 212, y: 458},		//15
  {x: 0, y: 548},			//16
  {x: -342, y: 569},  //17
  {x: 342, y: 569}		//18
];

playerCount = 8;

defaultPositions = {};

defaultPositions['Balanced'] = [0, 15, 14, 10, 9, 8, 4, 3];         // 2, 3, 2
defaultPositions['Defensive'] = [0, 10, 9, 8, 6, 5, 4, 3];          // 0, 1, 6
defaultPositions['Aggressive'] = [0, 15, 14, 12, 11, 8, 6, 5];    // 5, 1, 1

var MsgTypes = {
	Connected: 0,
	ArenaConnection: 1,	
	ArenaPlayAgainstAI: 2,
	UserInputUpdate: 3,
	PlayerInputUpdate: 4,
	PlayerIsControlled: 5,
	PlayerMelee: 6,
	PlayerHealthChange: 7,
	PlayerPositionSync: 8,
	BallHandlerChanged: 9,
	BallThrown: 10,
	BallSync: 11,
	ChangeGameState: 12,
	ChangeFormation: 13,
	SyncTeamNames: 14,
	ScoreUpdate: 15,
	RoundEnded: 16,
	TournamentConnection: 17,
	SpawnPickupItem: 18,
	PickupItemTaken: 19
}

function reducePrecision(num){
	return Math.round(num * 100) / 100;
}

function rdz(pos){
	if (typeof pos == "number") return reducePrecision(pos);
	var newPos = {
		x: reducePrecision(pos.x),
		y: reducePrecision(pos.y)
	}
	if ("z" in pos){
		newPos.z = reducePrecision(pos.z);
	}
	return newPos;
}


function k2b(dk){
	return (dk['a'] << 0) + (dk['s'] << 1) + (dk['d'] << 2) + (dk['w'] << 3) + (dk[' '] << 4);
}

function b2k(bk){
	var downKeys = {
		a: (bk & 0b1)>0, 
		s: (bk & 0b10)>0, 
		d: (bk & 0b100)>0, 
		w: (bk & 0b1000)>0, 
		' ': (bk & 0b10000)>0
	}
	return downKeys;
}

var PickupItemType = {
  Credit: 0,  
  SpeedUpgrade: 1,
  ThrowUpgrade: 2,
  StamminaUpgrade: 3,
  AccelerationUpgrade: 4,
  KickUpgrade: 5,
  IntelligenceUpgrade: 6,
  EnduranceUpgrade: 7,
  HealtUpgrade: 8
};

var pickupItemCounter = 0;

function PickupItem(position, type){
	this.id = pickupItemCounter;
	pickupItemCounter++;
	this.pos = position;
	this.type = type;
	this.size = {x: 40, y: 30};		
	switch (type) {
		case PickupItemType.Credit:
			this.size = {x: 30, y: 30};				
			break;
		case PickupItemType.HealtUpgrade:
			this.size = {x: 45, y: 35};				
			break;		
	}
	
} 

function Player(defaultPosition = {x: 0.0, y: 0.0}, defaultDir = Math.PI/2, team = 1){
  this.defaultPosition = defaultPosition;
  this.pos = {x: defaultPosition.x, y: defaultPosition.y};
  this.posResidual = {x: 0.0, y: 0.0};
  this.dir = 0.0;
  this.defaultDir = defaultDir;
  this.targetDir = this.defaultDir;
  this.targetPosition = {x: defaultPosition.x, y: defaultPosition.y};
  this.speed = 0;
  this.maxSpeed = 2.5;
  this.throwSpeed = 5;
  this.strength = 6;
  this.acceleration = 0.08;
  this.maxTravelDist = 300;
  this.intelligence = 30;
  this.running = false;
  this.kicking = false;
  this.throwing = false;
  this.falling = false;
  this.returning = false;
  this.controlled = false;
  this.animFrameIndex = 0;
  this.animFrameTime = 0;
  this.animFrameRate = this.maxSpeed*3;
  this.reach = 30;
  this.health = 100;
  this.team = team;
  this.name = "player";
  this.proximity = [];
  this.collisions = [];
  this.lastDecisionTimeStamp = 0;
  this.pickupItems = [];
  if (isClient){
    this.stepAudio = new GameAudio("snd/step.wav");
    this.whoshAudio = new GameAudio("snd/whosh.wav");
    this.fallAudio = new GameAudio("snd/fall.wav");
    this.kickImpactAudio = new GameAudio("snd/kickimpact.wav");
  }
  this.dist = (pos)=>{
    var dx = pos.x-this.pos.x;
    var dy = pos.y-this.pos.y;
    return Math.sqrt(dx*dx+dy*dy);
  };
  this.evaluateDist = (pos) => {
    var dist = this.dist(pos);
    var dx = pos.x-this.defaultPosition.x;
    var dy = pos.y-this.defaultPosition.y;
    var distFromDefault = Math.sqrt(dx*dx+dy*dy);
    var evaluation = {dist: dist, distFromDefault: distFromDefault, go: false, close: false};
    if (dist < this.maxTravelDist && distFromDefault < this.maxTravelDist){
      evaluation.go = true;
    }
    if (dist < 2*this.reach){
      evaluation.close = true;
    }
    return evaluation;
  };
  this.restart = () =>{
    this.pos.x = this.defaultPosition.x;
    this.pos.y = this.defaultPosition.y;
    this.posResidual = {x: 0.0, y: 0.0};
    this.targetDir = this.defaultDir;
    this.dir = -this.defaultDir;
    this.targetPosition.x = this.defaultPosition.x;
    this.targetPosition.y = this.defaultPosition.y;
    this.running = false;
    this.speed = 0;
  };
  this.sync = (playerData) => {
    this.defaultDir = playerData.defaultDir;
    this.defaultPosition = playerData.defaultPosition;
    this.targetPosition = playerData.targetPosition;
    this.pos = playerData.pos;
    this.dir = playerData.dir;
    this.health = playerData.health;
    this.speed = playerData.speed;
    this.running = playerData.running;
    this.falling = playerData.falling;
    this.name = playerData.name;
    this.animFrameTime = Date.now();
    this.animFrameIndex = 0;
  };
}

var Rounds = {
  First: 1,
  Second: 2,
  Third: 3,
  Fourth: 4
};

var GameStates = {
  Paused: 0,  
  Playing: 1,
  Goal: 2,
  HalfTime: 3,
  PreGame: 4,
  GetReady: 5
};

function GameLogics(){
  this.lastTouch = {x: 0, y: 0};
  this.ballpos = {x: 0.0, y: 0.0, z: 0};
  this.ballposResidual = {x: 0.0, y: 0.0, z: 0};
  this.ballSpeed = {x: 0.0, y: 0.0, z: 0.0};
  this.ballHandler = null;
  this.pickupItems = [];
  this.lastTimeStamp = 0;
  this.currentTimeStamp = 0;
  this.deltaTime = 0;
  this.ballSyncTime = 0;
  this.roundStartTime = 0;
  this.stateTime = 0;
  this.round = Rounds.First;
  this.state = GameStates.PreGame;
  this.score = {team1: 0, team2: 0};
  this.eventCallBack = (msg)=>{};
  this.initLogic = () =>{

    this.team1 = [];
    this.team2 = [];
    this.teamName1 = "Team 1";
    this.teamName2 = "Team 2";
    var defaultFormation = defaultPositions['Balanced']; //team.formations[team.defaultFormation];
    for (var i = 0; i < 8; i++){
      var pos = {
        x: places[defaultFormation[i]].x*scale,
        y: places[defaultFormation[i]].y*scale
      };
      this.team1.push(new Player(pos, Math.PI/2));
      pos = {
        x: places[defaultFormation[i]].x*scale,
        y: -places[defaultFormation[i]].y*scale
      };
      this.team2.push(new Player(pos, -Math.PI/2, 2));
    }
    /*var pos = {
      x: places[16].x*scale,
      y: places[16].y*scale
    };        
    this.team1.push(new Player(pos, Math.PI/2, 1));
    this.team1[7].maxTravelDist = 200;
    
    var pos = {
      x: places[16].x*scale,
      y: -places[16].y*scale
    };        
    this.team2.push(new Player(pos, -Math.PI/2, 2));
    this.team2[7].maxTravelDist = 200;*/
    this.lastTimeStamp = Date.now();
    this.roundStartTime = this.lastTimeStamp;
  };
  this.restartGame = () => {
    this.ballpos.x = 0;
    this.ballpos.y = 0;
    this.ballpos.z = 10;
    this.ballSpeed.x = 0;
    this.ballSpeed.y = 0;
    this.ballposResidual.x = 0;
    this.ballposResidual.y = 0;
    this.ballHandler = null;
    
  };
  this.update = () => {
    this.currentTimeStamp = Date.now();

    this.deltaTime = this.currentTimeStamp - this.lastTimeStamp;
    var dt = this.deltaTime;
    this.lastTimeStamp = this.currentTimeStamp;
    if(isServer){
      var time = 90 - (this.currentTimeStamp - this.roundStartTime)/1000;
      if (time <= 0){
        var msg = {t: MsgTypes.RoundEnded};
        this.eventCallBack(msg);
        this.round ++;
        this.switchSide();
        this.restartGame();
        this.state = GameStates.GetReady;
        this.eventCallBack({ t: MsgTypes.ChangeGameState, state: GameStates.GetReady });
        this.roundStartTime = this.currentTimeStamp;
      }
//w       var pickupItemChance = this.
    }

    if (this.state !== GameStates.Playing){
      this.roundStartTime += dt;
    }
    this.updateBallPhysics();
    for (var i = 0; i < this.team1.length; i++){
      var player = this.team1[i];
      this.updatePlayer(player);
      if(isServer){
      	this.checkPickupItem(player);
		  }
    }
    for (var i = 0; i < this.team2.length; i++){
      var player = this.team2[i];
      this.updatePlayer(player);
      if(isServer){
      	this.checkPickupItem(player);
		  }
    }		
  };
  this.checkPickupItem = (player) => {
  	var pickedItems = [];
		for (j in this.pickupItems){											
			var pickupItem = this.pickupItems[j];
			var dist = player.dist(pickupItem.pos);					
			if (dist<player.reach){
				pickedItems.push(pickupItem);
				var takeMsg = { 
					t: MsgTypes.PickupItemTaken,
					item: pickupItem
				}				
				this.eventCallBack(takeMsg);
				player.pickupItems.push(pickupItem);
			}					
		}
		for (j in pickedItems){	
			var pickupItem = pickedItems[j];
			var itemIndex = this.pickupItems.indexOf(pickupItem);
			this.pickupItems.splice(itemIndex, 1);
		}
  }
  this.switchSide = () => {
    for (var i = 0; i < this.team1.length; i++){
      var p1 = this.team1[i];
      var p2 = this.team2[i];
      p1.defaultPosition.y *= -1;
      p2.defaultPosition.y *= -1;
      p1.targetPosition.y = p1.defaultPosition.y;
      p2.targetPosition.y = p2.defaultPosition.y;
      p1.defaultDir += Math.PI;
      p1.defaultDir = p1.defaultDir % (2*Math.PI);
      p2.defaultDir += Math.PI;
      p2.defaultDir = p2.defaultDir % (2*Math.PI);
    }
  }
  this.setState = (state) => {
    this.state = state;
    switch (state) {
      case GameStates.Paused:        
        break;
      case GameStates.Playing:
        if (isClient){
          this.goAudio.play(0);
        }
        break;
      case GameStates.Goal:
        break;
      case GameStates.HalfTime:
        break;
      case GameStates.GetReady:
        if (isClient){
          gameRenderer.getReadyAudio.play(0);
          animations['getReady'].start();
          gameRenderer.playerIndex = -1;          
        }
        break;
    }
  };
  this.scored = (team) => {
    if (isServer){
      if (team === 1){
        this.score.team1++;
      }else {
        this.score.team2++;
      }
      this.updateScore(true);
    }
  };
  this.updatePlayerInput = (player, bk) => {
  	var downKeys = b2k(bk);
    var changed = false;
    var inputDir = {x: 0, y: 0};
    if (player === undefined) return [changed, bk];
    if (downKeys['w']){
      inputDir.y = 1;
    } else {
      if (inputDir.y > 0)
        inputDir.y = 0;
    }
    if (downKeys['s']){
      inputDir.y = -1;
    } else {
      if (inputDir.y < 0)
        inputDir.y = 0;
    }
    if (downKeys['a']){
      inputDir.x = -1;
    } else {
      if (inputDir.x < 0)
        inputDir.x = 0;
    }
    if (downKeys['d']){
      inputDir.x = 1;
    } else {
      if (inputDir.x > 0)
        inputDir.x = 0;
    }
    if (downKeys['f'] && !player.falling){
      player.animFrameIndex = 0;
      player.falling = true;
      if (isClient){
        player.fallAudio.play();
      }
      player.animFrameTime = this.currentTimeStamp;
    }

    if (downKeys[' ']){
      if (this.ballHandler !== null){
        if (this.ballHandler === player && !player.throwing && !player.falling){          
          player.throwing = true;
          player.animFrameIndex = 0;
          player.animFrameTime = this.currentTimeStamp;
          downKeys[' '] = false;
          changed = true;
          if(isClient){
            gameRenderer.whoshAudio.play();
          }
        }
      }
      if (this.ballHandler !== player){
        if (downKeys[' '] && !player.kicking && !player.falling){
          player.kicking = true;
          player.animFrameIndex = 0;
          player.animFrameTime = this.currentTimeStamp;
          downKeys[' '] = false;
          changed = true;
          if(isClient){
            gameRenderer.whoshAudio.play();
          }
        }
      }
    }

    if (inputDir.x !== 0 || inputDir.y !== 0){
      var timeStamp = Date.now();
      if (player.running === false ){
        player.animFrameTime = timeStamp;
        changed = true;
      }
      player.running = true;
      if(!player.falling && !player.kicking ){
        oldDir = player.targetDir;
        player.targetDir = Math.atan2(inputDir.y, inputDir.x) ;
        if (oldDir !== player.targetDir){
          changed = true;
        }
      }
    } else {
      if (player.running){
        changed = true;
      }
      player.running = false;      
    }
    return [changed, k2b(downKeys)];
  };
  this.playerPositionSync = (player) =>{
    var msg = this.getPlayerTeamAndIndex(player);
    msg.t = MsgTypes.PlayerPositionSync;
    msg.pos = rdz(player.pos);
    this.eventCallBack(msg);
  };
  this.ballHandlerChanged = (player) =>{
    this.ballHandler = player;
    var msg = this.getPlayerTeamAndIndex(player);
    msg.t = MsgTypes.BallHandlerChanged;
    msg.pos = player.pos;
    this.eventCallBack(msg);
  };
  this.playerMelee = (player, otherPlayer) => {
    var msg = this.getPlayerTeamAndIndex(player);
    msg.op = this.getPlayerTeamAndIndex(otherPlayer);
    msg.t = MsgTypes.PlayerMelee;
    msg.op.pos = rdz(otherPlayer.pos);
    this.eventCallBack(msg);
  };
  this.playerHealthChange = (player, value) => {
    var msg = this.getPlayerTeamAndIndex(player);
    msg.t = MsgTypes.PlayerHealthChange;
    msg.value = value;
    this.eventCallBack(msg);
  };

  this.ballThrown = (player) => {
    this.ballHandler = null;
    this.ballpos.x += Math.cos(player.dir)*(player.reach*scale+15);
    this.ballpos.y += Math.sin(player.dir)*(player.reach*scale+15);
    this.ballpos.z = 1.6;
    this.ballSpeed.x = Math.cos(player.dir)*(player.throwSpeed+player.speed);
    this.ballSpeed.y = Math.sin(player.dir)*(player.throwSpeed+player.speed);
    this.ballSpeed.z = player.throwSpeed/2;
    var msg = {
      t: MsgTypes.BallThrown,
      bp: this.ballpos,
      bspd: this.ballSpeed
    };
    this.eventCallBack(msg);
  };

  this.updateScore = (restart) =>{
    var msg = {t: MsgTypes.ScoreUpdate, score: this.score, restart: restart};
    if (restart){
      this.restartGame();
    }
    this.eventCallBack(msg);
    this.state = GameStates.GetReady;
    this.eventCallBack({ t: MsgTypes.ChangeGameState, state: GameStates.GetReady });
  };

  this.updatePlayer = (player) =>{
    player.proximity = [];
    player.collisions = [];
    if (isClient){
      var resx = player.posResidual.x*0.05;
      var resy = player.posResidual.y*0.05;
      player.pos.x += resx;
      player.pos.y += resy;
      player.posResidual.x -= resx;
      player.posResidual.y -= resy;
    }
    if (player.falling){
      player.speed *= Math.pow(0.95,this.deltaTime/16);
      var nextFrameTimeLength = 1000/player.animFrameRate;
      if (this.currentTimeStamp>(player.animFrameTime+nextFrameTimeLength)){
        player.animFrameTime += nextFrameTimeLength;
        player.animFrameIndex++;
      }

      if (player.speed < 0.1 && player.animFrameIndex > 20){
        if(player.health > 0){
          player.falling = false;
          if (isServer){
            this.playerPositionSync(player);
          }
        }
      }
    } else if (player.kicking){
      var nextFrameTimeLength = 1000/player.animFrameRate;
      if (this.currentTimeStamp>player.animFrameTime+nextFrameTimeLength){
        player.animFrameTime += nextFrameTimeLength;
        player.animFrameIndex++;
      }
      if (player.animFrameIndex > 5){
        player.kicking = false;
      }
      if (isServer){
        if (player.animFrameIndex >= 3){
          for (var i = 0; i < this.team1.length; i++){
            otherPlayer = this.team1[i];
            if (otherPlayer !== player){
              this.checkPlayerKick(player, otherPlayer);
            }
          }
          for (var i = 0; i < this.team2.length; i++){
            otherPlayer = this.team2[i];
            if (otherPlayer !== player){
              this.checkPlayerKick(player, otherPlayer);
            }
          }
        }
      }
    } else if (player.throwing) {
      var nextFrameTimeLength = 1000/player.animFrameRate;
      if (this.currentTimeStamp>player.animFrameTime+nextFrameTimeLength){
        player.animFrameTime += nextFrameTimeLength;
        player.animFrameIndex++;
      }
      
            
      if (isServer && player.animFrameIndex > 3 && player === this.ballHandler){
        this.ballThrown(player);                    
      }
      if (player.animFrameIndex >= 5){  
        player.throwing = false;                
      }
            
      
    } else if (player.running) {
      var healthMultiplier = Math.max(0.45, player.health/100);
      player.speed += (player.maxSpeed*healthMultiplier-player.speed)* Math.pow(player.acceleration, 16/this.deltaTime);
      var nextFrameTimeLength = 1000/(player.animFrameRate);
      if (this.currentTimeStamp>player.animFrameTime+nextFrameTimeLength){
        player.animFrameTime += nextFrameTimeLength + Math.random()*40-20;
        player.animFrameIndex++;
        if (player.animFrameIndex%8 === 2 || player.animFrameIndex%8 === 6){
          if (isClient){
            var camDist = player.dist(this.camera.pos);
            player.stepAudio.pbr = 1 - Math.random()*0.1;
            player.stepAudio.volume = Math.min(50/camDist,1);
            
            player.stepAudio.play();
          }
          if (healthMultiplier<0.75){
            player.animFrameIndex++;
          }
          if (healthMultiplier<0.5){
            player.animFrameIndex++;
          }
        }
      }
    } else {      
      player.speed *= Math.pow(1-player.acceleration,this.deltaTime/16);
    }
    if(player.health <= 0){
     return;
    }

    var xlimit = 440 - player.reach/2;
    var ylimit = 810 - player.reach/2;
    
    player.pos.x += scale * player.speed * Math.cos(player.dir) * this.deltaTime/16;
    player.pos.y += scale * player.speed * Math.sin(player.dir) * this.deltaTime/16;

    player.pos.x = Math.max(-xlimit*scale, player.pos.x);
    player.pos.x = Math.min(xlimit*scale, player.pos.x);
    player.pos.y = Math.max(-ylimit*scale, player.pos.y);
    player.pos.y = Math.min(ylimit*scale, player.pos.y);

    // Collision detection

    for (var i = 0; i < this.team1.length; i++){
      otherPlayer = this.team1[i];
      if (otherPlayer !== player && !otherPlayer.falling){
        var collision = this.checkPlayerCollision(player, otherPlayer);
      }
    }
    for (var i = 0; i < this.team2.length; i++){
      otherPlayer = this.team2[i];
      if (otherPlayer !== player && !otherPlayer.falling){
        var collision = this.checkPlayerCollision(player, otherPlayer);
      }
    }

    var deltaDir = (player.targetDir-player.dir);
    if (Math.abs(deltaDir) > Math.PI ){
      deltaDir = -(Math.PI*2-deltaDir);
    }
    player.dir += (deltaDir)*Math.pow(player.acceleration, 16/this.deltaTime);

    if (player.dir<-Math.PI*2){
      player.dir+=Math.PI*2;
    } else if (player.dir>=Math.PI/2){
      player.dir-=Math.PI*2;
    }

    if (isServer && this.state === GameStates.Playing){
      if (this.ballHandler === null && this.ballpos.z<2.8 && !player.falling){
        dx = player.pos.x - this.ballpos.x;
        dy = player.pos.y - this.ballpos.y;
        var balldist = Math.sqrt(dx*dx+dy*dy);
        if (balldist<player.reach*scale) {
          this.ballHandlerChanged(player);
        }
      }
    }
  };
  this.getPlayerTeamAndIndex = (player) => {
    var playerIndex = -1;
    var team = 0;
    if (this.team1.indexOf(player) !== -1){
      team = 1;
      playerIndex = this.team1.indexOf(player);
    } else {
      team = 2;
      playerIndex = this.team2.indexOf(player);
    }
    return {pi: playerIndex, tm: team};
  };
  this.checkPlayerCollision = (player, otherPlayer) =>{
    var dist = otherPlayer.dist(player.pos);
    mindist = 2*(otherPlayer.reach*scale+player.reach*scale)/3;
    if (dist < mindist){
      var overlap = mindist - dist;
      var dx = player.pos.x - otherPlayer.pos.x;
      var dy = player.pos.y - otherPlayer.pos.y;
      var angle = Math.atan2(dy, dx);
      player.pos.x += Math.cos(angle)*overlap;
      player.pos.y += Math.sin(angle)*overlap;
      player.collisions.push(otherPlayer);
    }
    if (dist < mindist*2){
      player.proximity.push(otherPlayer);
    }
  };
  this.checkPlayerKick = (player, otherPlayer) => {
    if (player !== otherPlayer){
    	var kickPos = {
    		x: player.pos.x + player.reach*Math.cos(player.dir),
    		y: player.pos.y + player.reach*Math.sin(player.dir),
    	}
      if (otherPlayer.dist(kickPos)<player.reach*2){
        if(!otherPlayer.falling){
          otherPlayer.falling = true;
          otherPlayer.health -= player.strength;
          this.playerHealthChange(otherPlayer, otherPlayer.health);
          player.kicking = false;
          otherPlayer.animFrameIndex = 0;
          otherPlayer.animFrameTime = this.currentTimeStamp;

          this.playerMelee(player, otherPlayer);

          if (otherPlayer === this.ballHandler){
            this.ballHandlerChanged(player);
          }
        }
      }
    }
  };
  this.updateBallPhysics = () => {
    if (this.ballHandler === null){
      var resx = this.ballposResidual.x*0.05;
      var resy = this.ballposResidual.y*0.05;
      this.ballpos.x += resx;
      this.ballpos.y += resy;
      this.ballposResidual.x -= resx;
      this.ballposResidual.y -= resy;
      var originalPos = {x: this.ballpos.x, y: this.ballpos.y}
      if (this.ballpos.z<0) {
        if (isClient){
          this.ballAudio.volume = 0.3;
          this.ballAudio.play();
        }
        this.ballSpeed.z = 0;
        this.ballpos.z = 0;
      } else {
        if (this.ballpos.z>0)
          this.ballSpeed.z -= 9.82*this.deltaTime/1000;
      }
      this.ballpos.x += scale * this.ballSpeed.x * this.deltaTime/16;
      this.ballpos.y += scale * this.ballSpeed.y * this.deltaTime/16;
      this.ballSpeed.x *= Math.pow(0.995,this.deltaTime/16);
      this.ballSpeed.y *= Math.pow(0.995,this.deltaTime/16);
      this.ballpos.z += this.ballSpeed.z*this.deltaTime/1000;
      if (Math.abs(this.ballpos.x)>440*scale){
        if (isClient){
          this.ballAudio.volume = Math.min(Math.abs(this.ballSpeed.x)/30, 1);
          this.ballAudio.play();
        }
        this.ballSpeed.x *= -1;
        this.ballpos.x += scale * this.ballSpeed.x * this.deltaTime/16;
        if (Math.abs(this.ballpos.x)>440*scale){
          this.ballpos.x *= 440*scale/Math.abs(this.ballpos.x);
        }
      }
      if (Math.abs(this.ballpos.y)>810*scale){
        if (isClient){
          this.ballAudio.volume = Math.min(1, Math.abs(this.ballSpeed.y)/30);
          this.ballAudio.play();
        }
        if (Math.abs(this.ballpos.x)<110){
          if (this.ballpos.z<2.8){
            var team = 0;
            if (this.ballpos.y>0){
              team = (this.round%2) === 1 ?  1 : 2;
            }else{
              team = (this.round%2) === 1 ?  2 : 1;
            }
            this.scored(team);
            return;
          } else {
            console.log(this.ballpos);
          }
        }
        this.ballSpeed.y *= -1;
        this.ballpos.y += scale * this.ballSpeed.y * this.deltaTime/16;
        if (Math.abs(this.ballpos.y)>810*scale){
          this.ballpos.y *= 810*scale/Math.abs(this.ballpos.y);
        }
      }
      // Obstruction on mid field
      var yDist = Math.abs(Math.abs(this.ballpos.y)-360*scale);
      if (yDist<40){
	      var xDist = Math.abs(this.ballpos.x);
	      if (xDist<40*scale){
	      	if (Math.sqrt(xDist**2+yDist**2)<40*scale){
	      		this.ballSpeed.y *= -1;
			    	this.ballSpeed.x *= -1;
			    	this.ballpos.x = originalPos.x;
			    	this.ballpos.y = originalPos.y;
			    	if (isClient){
				      this.ballAudio.volume = Math.min(1, Math.abs(this.ballSpeed.y+this.ballSpeed.x)/30);
				      this.ballAudio.play();
				    }
	      	}	      	
	      }
      }
      if (isServer){
        if (this.currentTimeStamp - this.ballSyncTime > 1000){
          this.eventCallBack({
          	t: MsgTypes.BallSync, 
          	pos: rdz(this.ballpos), 
          	spd: rdz(this.ballSpeed)
        	});
          this.ballSyncTime = this.currentTimeStamp;
        }
      }

    } else {
      this.ballpos.x = this.ballHandler.pos.x;
      this.ballpos.y = this.ballHandler.pos.y;
    }
  };
}
if ( isServer ){
  exports.GameLogics = GameLogics;
  exports.GameStates = GameStates;
  exports.b2k = b2k;
  exports.k2b = k2b;
  exports.places = places;
  exports.PickupItemType = PickupItemType;
  exports.PickupItem = PickupItem;
  exports.rdz = rdz;
  exports.MsgTypes = MsgTypes;
}
