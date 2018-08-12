
/* global gameRenderer, animations */

var isServer = typeof isClient !== "undefined" ? !isClient : true;
var isClient = !isServer;
var scale = isClient ? scale : 1;

var places = [
  {x: -150, y: -640}, //0
  {x: 150, y: -640},  //1
  {x: -320, y: -708}, //2
  {x: 320, y: 708},   //3
  {x: 0, y: -460},    //4
  {x: -250, y: -310}, //5
  {x: 250, y: -310},  //6
  {x: 0, y: -100},    //7
  {x: -255, y: 200},  //8
  {x: 255, y: 200},   //9
  {x: 0, y: 265},     //10
  {x: -310, y: 410},  //11
  {x: 310, y: 410},   //12
  {x: 0, y: 630},     //13
  {x: -265, y: 580},  //14
  {x: 265, y: 580},   //15
  {x: 0, y: -760}     //16 goalee
];

defaultPositions = {};

defaultPositions['balanced'] = [15, 14, 9, 8, 7, 1, 0];         // 2, 3, 2
defaultPositions['defencive'] = [7, 6, 5, 3, 2, 1, 0];          // 0, 1, 6
defaultPositions['aggressive'] = [15, 14, 12, 11, 10, 7, 4];    // 5, 1, 1

function Player(defaultPosition = {x: 0.0, y: 0.0}, defaultDir = Math.PI/2, team = 1){
  this.defaultPosition = defaultPosition;
  this.pos = {x: defaultPosition.x, y: defaultPosition.y};
  this.posResidual = {x: 0.0, y: 0.0};
  this.dir = 0.0;
  this.defaultDir = defaultDir;
  this.targetDir = this.defaultDir;
  this.targetPosition = {x: defaultPosition.x, y: defaultPosition.y};
  this.speed = 0;
  this.maxSpeed = 3;
  this.throwSpeed = 6;
  this.strength = 6;
  this.acceleration = 0.08;
  this.maxTravelDist = 300;
  this.intelligence = 20;
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
    //console.log("playerreset");
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
  this.pos = {x: 0.0, y: 0.0};
  this.lastTouch = {x: 0, y: 0};
  this.ballpos = {x: 0.0, y: 0.0, z: 0};
  this.ballposResidual = {x: 0.0, y: 0.0, z: 0};
  this.ballSpeed = {x: 0.0, y: 0.0, z: 0.0};
  this.ballHandler = null;
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
    for (var i = 0; i < 7; i++){
      var pos = {
        x: places[defaultPositions['balanced'][i]].x*scale,
        y: places[defaultPositions['balanced'][i]].y*scale
      };
      this.team1.push(new Player(pos, Math.PI/2));
      var pos = {
        x: places[defaultPositions['balanced'][i]].x*scale,
        y: -places[defaultPositions['balanced'][i]].y*scale
      };
      this.team2.push(new Player(pos, -Math.PI/2, 2));
    }
    var pos = {
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
    this.team2[7].maxTravelDist = 200;
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
    /*for (var i = 0; i < this.team1.length; i++){
      var player = this.team1[i];
      player.restart();
    }
    for (var i = 0; i < this.team2.length; i++){
      var player = this.team2[i];
      player.restart();
    }*/
  };
  this.update = () => {
    this.currentTimeStamp = Date.now();
    this.deltaTime = this.currentTimeStamp - this.lastTimeStamp;
    var dt = this.deltaTime;
    this.lastTimeStamp = this.currentTimeStamp;
    if(isServer){
      var time = 90 - (this.currentTimeStamp - this.roundStartTime)/1000;
      if (time <= 0){
        var msg = {type: "roundEnded"};
        this.eventCallBack(msg);
        this.round ++;
        this.switchSide();
        this.restartGame();
        this.state = GameStates.GetReady;
        this.eventCallBack({ type: "changeGameState", state: GameStates.GetReady });
        this.roundStartTime = this.currentTimeStamp;
      }
    }

    if (this.state !== GameStates.Playing){
      this.roundStartTime += dt;
    }
    this.updateBallPhysics();
    for (var i = 0; i < this.team1.length; i++){
      var player = this.team1[i];
      this.updatePlayer(player);
    }
    for (var i = 0; i < this.team2.length; i++){
      var player = this.team2[i];
      this.updatePlayer(player);
    }
    this.pos.x = this.ballpos.x;
    this.pos.y = this.ballpos.y;
  };
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
  };
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
      //console.log(this.score);
      if (team === 1){
        this.score.team1++;
      }else {
        this.score.team2++;
      }
      //console.log(this.score);
      this.updateScore(true);
    }
  };
  this.updatePlayerInput = (player, downKeys) => { 
    var changed = false;
    var inputDir = {x: 0, y: 0};
    if (player === undefined) return;
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
      if (player.running === false)
        player.animFrameTime = timeStamp;
      if (!player.running){
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
      //player.targetDir = player.defaultDir ;
    }
    return changed;
  };
  this.playerPositionSync = (player) =>{
    var msg = this.getPlayerTeamAndIndex(player);
    msg.type = "playerPositionSync";
    msg.pos = player.pos;
    this.eventCallBack(msg);
  };
  this.ballHandlerChanged = (player) =>{
    this.ballHandler = player;
    var msg = this.getPlayerTeamAndIndex(player);
    msg.type = "ballHandlerChanged";
    msg.pos = player.pos;
    this.eventCallBack(msg);
  };
  this.playerMelee = (player, otherPlayer) => {
    var msg = this.getPlayerTeamAndIndex(player);
    msg.otherPlayer = this.getPlayerTeamAndIndex(otherPlayer);
    msg.type = "playerMelee";
    msg.otherPlayer.pos = otherPlayer.pos;
    this.eventCallBack(msg);
  };
  this.playerHealthChange = (player, value) => {
    var msg = this.getPlayerTeamAndIndex(player);
    msg.type = "playerHealthChange";
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
      type: "ballThrown",
      ballpos: this.ballpos,
      ballSpeed: this.ballSpeed
    };
    this.eventCallBack(msg);
  };

  this.updateScore = (restart) =>{
    var msg = {type: "scoreUpdate", score: this.score, restart: restart};
    if (restart){
      this.restartGame();
    }
    this.eventCallBack(msg);
    this.state = GameStates.GetReady;
    this.eventCallBack({ type: "changeGameState", state: GameStates.GetReady });
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
            player.stepAudio.volume = Math.min(100/camDist,1);
            
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
    if (player === this.ballHandler){
      //console.log(player.speed);
    }

    //console.log(this.deltaTime);
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
          //player.kicking = false;
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
    return {playerIndex: playerIndex, team: team};
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
      if (otherPlayer.dist(player.pos)<otherPlayer.reach+player.reach){
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
      if (isServer){
        if (this.currentTimeStamp - this.ballSyncTime > 1000){
          this.eventCallBack({type:"ballSync", pos: this.ballpos, speed: this.ballSpeed});
          this.ballSyncTime = this.currentTimeStamp;
        }
      }

    } else {
      this.ballpos.x = this.ballHandler.pos.x;
      this.ballpos.y = this.ballHandler.pos.y;
    }
    //console.log(JSON.stringify(this.ballpos));
  };
}
if ( isServer ){
  exports.GameLogics = GameLogics;
  exports.GameStates = GameStates;
}
