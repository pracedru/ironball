var gl = require('./public/js/gameLogic.js');
/* global GameStates */
var rdz = gl.rdz;
var MsgTypes = gl.MsgTypes;

function downKeysFromDirection(dx, dy){
  var downKeys = {a: false, s: false, d: false, w: false, ' ': false};
  var dmax = Math.max(Math.abs(dx), Math.abs(dy));
  dx = dx / dmax;
  dy = dy / dmax;
  if (dx>0.6){
    downKeys['d'] = true;
  }
  if (dx<-0.6){
    downKeys['a'] = true;
  }
  if (dy>0.6){
    downKeys['w'] = true;
  }
  if (dy<-0.6){
    downKeys['s'] = true;
  }
  return downKeys;
}

var Vector = function(position, direction) {
  this.pos = position;
  this.dir = direction;    
  this.intersects = (otherVector) => {
    var ax = this.pos.x;
    var ay = this.pos.y;
    var bx = this.dir.x;
    var by = this.dir.y;
    var cx = otherVector.pos.x;
    var cy = otherVector.pos.y;
    var dx = otherVector.dir.x;
    var dy = otherVector.dir.y;     
    var num = ((cy - ay) * bx - (cx - ax) * by);
    var den = (dx * by - dy * bx);        
    if (den === 0) return null;
    var M = num / den;
    return {x: cx + dx*M, y: cy + dy*M}; 
  };
};

exports.TeamAI = function(gameLogic, team, arena) {
  this.team = team;
  this.gameLogic = gameLogic;
  this.arena = arena;
  this.preGameReady = false;
  this.playersReady = false;
  this.aiOnly = true;
  this.correctionNeededThresshold = 2;
  this.update = () => {
  	var teamNo = this.gameLogic.team1 === this.team ? 1 : 2;
    if (this.gameLogic.state !== gl.GameStates.Playing) {
      if (this.gameLogic.state === gl.GameStates.PreGame){
        var preGameReady = true;        
        var dir = (this.gameLogic.round%2) === 1 ?  -1 : 1;
      	if (teamNo == 2) dir *= -1;
        for (var i = 0; i < this.team.length; i++){
          var player = this.team[i];
          var sepDist = 100;
          player.targetPosition.x = (i*sepDist)%(sepDist*4) - 1.5*sepDist;
          player.targetPosition.y = dir*(Math.floor((i/4))*sepDist+75);
          if (player.dist(player.targetPosition)>player.reach && player.health>50){            
            preGameReady = false;                    
          }  
        }
        this.preGameReady = preGameReady;        
      } else if (this.gameLogic.state === gl.GameStates.GetReady){
        var ready = true;        
        for (var i = 0; i < this.team.length; i++){
          var player = this.team[i];
          player.controlled = false;
          var sepDist = 100;
          player.targetPosition.x = player.defaultPosition.x;
          player.targetPosition.y = player.defaultPosition.y;
          if (player.dist(player.targetPosition)>player.reach  && player.health>50){
            ready = false;          
          }  
          if (player.collisions.length>0){
            var dx = player.targetPosition.x - player.pos.x;
            var dy = player.targetPosition.y - player.pos.y;
            var alpha = Math.atan2(dy, dx) + Math.PI/4;
            var dist = Math.sqrt(dx*dx+dy*dy);
            player.targetPosition.x = player.pos.x + Math.cos(alpha)*dist;
            player.targetPosition.y = player.pos.y + Math.sin(alpha)*dist;
          }
        }
        this.playersReady = ready;        
      }      
    } else {
      //  -----   PLAYING   -----
      if (this.gameLogic.ballHandler !== null){
        if (this.team.indexOf(this.gameLogic.ballHandler) !== -1) {
          // this team has the ball
          for (var i = 0; i < this.team.length; i++){
            var player = this.team[i];

            if (player === this.gameLogic.ballHandler){
	            if (!this.aiOnly) player.controlled = true;
              if (player.dist(player.defaultPosition)>player.maxTravelDist){
                player.evaluation.close = true;
              }
              player.targetPosition.x = team[this.team.length-1].pos.x;
              player.targetPosition.y = -team[this.team.length-1].pos.y*1.1;
            } else {
              player.evaluation.close = false;
              player.targetPosition.x = player.defaultPosition.x;
              player.targetPosition.y = player.defaultPosition.y;
            }
          }
          var prox = this.gameLogic.ballHandler.proximity;
          if (prox.length > 0){
            var enemiesInProximity = [];
            for (var i = 0; i < prox.length; i++){
              if (team.indexOf(prox[i]) === -1){
                enemiesInProximity.push(prox[i]);                
              }              
            }
            if (enemiesInProximity.length > 0){
              this.gameLogic.ballHandler.evaluation.close = true;
            }            
          }
        } else {
          //other team has the ball.
          for (var i = 0; i < this.team.length ; i++){
            var player = this.team[i];
            player.evaluation = player.evaluateDist(this.gameLogic.ballpos);
            if (player.evaluation.go){
              player.targetPosition.x = this.gameLogic.ballpos.x;
              player.targetPosition.y = this.gameLogic.ballpos.y;
            } else {
              if (i !== 7){
                player.targetPosition.x = player.defaultPosition.x;
                player.targetPosition.y = player.defaultPosition.y;
              } else {
                var otherDist = player.dist(this.gameLogic.ballHandler.pos);
                var pivot = {x: 0, y: 0};
                pivot.y = player.defaultPosition.y*1.1;
                var dx = this.gameLogic.ballHandler.pos.x - pivot.x;
                var dy = this.gameLogic.ballHandler.pos.y - pivot.y;
                var v2 = new Vector(pivot, {x: dx, y: dy});
                var v1 = new Vector(player.defaultPosition, {x: 1, y: 0});
                var p = v1.intersects(v2);
                if (p !== null){
                  var dist = player.dist(p);                                              
                  if (true){//(dist<otherDist){
                    player.targetPosition.x = p.x;
                    player.targetPosition.y = p.y;
                  }
                }
              }
            }
          }
          // Goalee shall cover the goal                    
        }
      } else {
        // No team has ball:
        for (var i = 0; i < this.team.length; i++){
          var player = this.team[i];
          player.evaluation = player.evaluateDist(this.gameLogic.ballpos);
          player.evaluation.close = false;
          if (player.evaluation.go){
            player.targetPosition.x = this.gameLogic.ballpos.x;
            player.targetPosition.y = this.gameLogic.ballpos.y;
          } else {
            player.targetPosition.x = player.defaultPosition.x;
            player.targetPosition.y = player.defaultPosition.y;
          }
          var v1 = new Vector(player.pos, {x: 1, y: 0});
          var v2 = new Vector(this.gameLogic.ballpos, this.gameLogic.ballSpeed);
          var p = v1.intersects(v2);
          if (p !== null){
            var dist = player.dist(p);          
            if (dist<player.maxTravelDist && dist > 50){
              player.targetPosition.x = p.x;
              player.targetPosition.y = p.y;
            }
          }
        }
        var player = this.team[7];
        var v1 = new Vector(player.pos, {x: 1, y: 0});
        var v2 = new Vector(this.gameLogic.ballpos, this.gameLogic.ballSpeed);
        var p = v1.intersects(v2);
        if (p !== null){
          var dist = player.dist(p);          
          if (dist<200){
            player.targetPosition.x = p.x;
            player.targetPosition.y = p.y;
          }
        }
      }
    }
    for (var i = 0; i < this.team.length; i++){
      var player = this.team[i];
      var correctionNeeded = false;
      if (!player.controlled && !player.falling){
        var msg = {};
        var downKeys = {a: false, s: false, d: false, w: false, ' ': false};
		    msg.pos = rdz(player.pos);
        msg.dir = rdz(player.dir);
        if (player.dist(player.targetPosition)>player.reach){
          var dx = player.targetPosition.x - player.pos.x;
          var dy = player.targetPosition.y - player.pos.y;
          downKeys = downKeysFromDirection(dx, dy);
        } else {
          if (Math.abs(player.pos.x - player.targetPosition.x) > this.correctionNeededThresshold || Math.abs(player.pos.y - player.targetPosition.y) > this.correctionNeededThresshold){
            correctionNeeded = true;
          }
          player.pos.x = player.targetPosition.x;
          player.pos.y = player.targetPosition.y;
          msg.pos = rdz(player.targetPosition);
          msg.tdir = rdz(player.defaultDir);
          player.targetDir = rdz(player.defaultDir);
        }

        msg.t = MsgTypes.PlayerInputUpdate;
        msg.pi = i;
        msg.tm = this.gameLogic.team1 === this.team ? 1 : 2;
        if (player.health > 0){
          if (player.evaluation && this.gameLogic.state === gl.GameStates.Playing){
            if (player.evaluation.close){            	
            	if (!downKeys[' ']){ 
              	downKeys[' '] = true;
              	inputChanged = [true, downKeys];
              }              
            }
          }
          
          var inputChanged = this.gameLogic.updatePlayerInput(player, gl.k2b(downKeys));
          downKeys = gl.b2k(inputChanged[1]);
          if (player.evaluation && this.gameLogic.state === gl.GameStates.Playing){
            if (player.evaluation.close){
            	if (!downKeys[' ']){ 
              	downKeys[' '] = true;
              	inputChanged[0] = true;
              }               
            }
          }
          if (inputChanged[0] || correctionNeeded){          
          	msg.bk = gl.k2b(downKeys);
            this.arena.sendPlayerUpdate(msg); 
          } else {          
          }          
        }
      }
    }
  };
};
exports.PlayerAI = function (gameLogic, team, arena){
  this.team = team;
  this.gameLogic = gameLogic;
  this.arena = arena;
};
