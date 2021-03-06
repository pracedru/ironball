var isServer = typeof isClient !== "undefined" ? !isClient : true;
var isClient = !isServer;

var playerImages = [];
var UpgradeTypes = null;

if (isServer){
	var misc = require('./misc.js');
	var Vertex2 = misc.Vertex2;
	var Vertex3 = misc.Vertex3;
}

function setUpgrades(upgradeTypes){
	UpgradeTypes = upgradeTypes;
}

function Player(defaultPosition = {x: 0.0, y: 0.0}, defaultDir = Math.PI/2, team = 1){
  this.defaultPosition = defaultPosition;
  this.pos = new Vertex2(defaultPosition.x, defaultPosition.y);
  this.posResidual = new Vertex2(0, 0);
	this.isGoalee = false;
  this.dir = 0.0;
  this.defaultDir = defaultDir;
  this.targetDir = this.defaultDir;
  this.targetPosition = new Vertex2(defaultPosition.x, defaultPosition.y);
  this.speed = 0;
  this.maxSpeed = 2.5;
  this.throwSpeed = 5;
  this.strength = 6;
  this.acceleration = 0.06;
  this.maxTravelDist = 300;
  this.intelligence = 30;
  this.stamina = 100;
  this.kickForce = 100;
  this.endurance = 100;
  this.running = false;
  this.kicking = false;
  this.throwing = false;
  this.falling = false;
  this.returning = false;
  this.controlled = false;
  this.animFrameIndex = 0;
  this.animFrameTime = 0;
  this.animFrameRate = this.maxSpeed*3.5;
  this.reach = 30;
  this.health = 100;
  this.team = team;
  this.name = "player";
  this.proximity = [];
  this.collisions = [];
  this.lastDecisionTimeStamp = 0;
  this.upgrades = [];
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
    this.defaultPosition.x = playerData.defaultPosition.x*scale;
    this.defaultPosition.y = playerData.defaultPosition.y*scale;
    this.targetPosition.x = playerData.targetPosition.x*scale;
    this.targetPosition.y = playerData.targetPosition.y*scale;
    this.pos.x = playerData.pos.x*scale;
    this.pos.y = playerData.pos.y*scale;
    this.dir = playerData.dir;
    this.health = playerData.health;
    this.speed = playerData.speed;
    this.running = playerData.running;
    this.falling = playerData.falling;
    this.name = playerData.name;
    this.animFrameTime = Date.now();
    this.animFrameIndex = 0;
    this.maxSpeed = playerData.maxSpeed;
    this.throwSpeed = playerData.throwSpeed;
    this.animFrameRate = this.maxSpeed*3.5;
    this.stamina = playerData.stamina;
    this.kickForce = playerData.kickForce;
    this.intelligence = playerData.intelligence;
    this.endurance = playerData.endurance;
  };
  this.setUpgrades = (upgrades) => {
  	this.maxSpeed = upgrades[UpgradeTypes.SpeedUpgrade]*2.5/100;
  	this.throwSpeed = upgrades[UpgradeTypes.ThrowUpgrade]*5/100;
  	this.stamina = upgrades[UpgradeTypes.StaminaUpgrade];
  	this.acceleration = upgrades[UpgradeTypes.AccelerationUpgrade]*0.06/100;
  	this.kickForce = upgrades[UpgradeTypes.KickUpgrade];
  	this.intelligence = upgrades[UpgradeTypes.IntelligenceUpgrade]*30/100; 
  	this.endurance = upgrades[UpgradeTypes.EnduranceUpgrade];
  	this.health = upgrades[UpgradeTypes.HealthUpgrade];
  	this.animFrameRate = this.maxSpeed*3.5;
  } 
}

if ( isServer ){
	exports.Player = Player;
	exports.setUpgrades = setUpgrades;
}
