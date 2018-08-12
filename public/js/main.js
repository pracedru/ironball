/* global menuRenderer, gameRenderer, playerRenderer */

document.addEventListener("DOMContentLoaded", function(){
  init();
});
var playerObjects = null;
var playerImages = [];
var playerIndex = 0;
var canvas;
var currentRenderer = null;
var ctx;
var AudioContext = window.AudioContext || window.webkitAudioContext;
var aCtx = new AudioContext();
var scale = 1;
var modalAccept = () => { console.log("dud modal"); };
var modalClose = () => { 
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
};
var modalShow = (caption, text) => {
  var modal = document.getElementById('myModal');
  document.getElementById('modalCaption').innerHTML = caption;
  document.getElementById('modalInput').value = text;
  modal.style.display = "block";
};


function getNewTeamName(){
  var adjective = nameAdjectives[Math.floor(Math.random()*nameAdjectives.length)];
  var noun = nameNouns[Math.floor(Math.random()*nameNouns.length)];  
  return adjective + " " + noun;
}

function createRandomPlayer(){
  var player = {
    name: "New Player",
    age: 20,
    gender: "Male",
    moto: "Score that ball",
    imageData: ""
  };  
  return player;
}

function getNewPlayers(){
  var players = [];
  for (var i = 0; i < 8; i++){
    players.push(createRandomPlayer());
  }
  return players;
}

function getPlayers(){
  if (playerObjects === null) { 
    var playerData = localStorage.players;
    try {
      playerObjects = JSON.parse(playerData);
    } catch (e) {}
  }
  if (!playerObjects){
    playerObjects = getNewPlayers();
    setPlayers(playerObjects);
  }
  return playerObjects;
}

function setPlayers(players){
  localStorage.players = JSON.stringify(players);
}

window.onpopstate = function (e) {
  console.log(e);
  if (e.state.state === "menuRenderer"){
    menuRenderer.setRenderer();
  }
};

function init(){

  canvas = document.getElementById("renderTarget");
  ctx = canvas.getContext('2d');  
  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scale = canvas.width/412;    
  }
  resizeCanvas();
  var players = getPlayers();
  for (var i = 0; i < players.length; i++){
    var player = players[i];
    var img = new Image();
    img.src = player.imageData;
    playerImages.push(img);
  }
  menuRenderer.init();
  gameRenderer.init();
  playerRenderer.init();
  
  if (localStorage.getItem("teamName") === null || localStorage.getItem("teamName") === "") {
    localStorage.teamName = getNewTeamName();
    localStorage.players =  JSON.stringify(getNewPlayers());    
  }
  //localStorage.teamName = getNewTeamName();
  requestAnimationFrame(mainLoop);
  
  document.getElementById('modalClose').onclick = modalClose;
  document.getElementById("modalAccept").onclick = function(){
    modalAccept();
    modalClose();
    modalAccept = () => { console.log("dud modal"); };
  };
}

function mainLoop(){
  if (currentRenderer !== null){
    currentRenderer.update();
    currentRenderer.render();
  } else {
    if (menuRenderer !== undefined)
      menuRenderer.setRenderer();
  }
  requestAnimationFrame(mainLoop);
}

/*
var Status = {
  JustWoke: 0,
  TryingToStayAwake: 1,
  FailingToStayAwake: 2,
  FallingAsleep: 3,
  Sleeping: 4  
};

var Mode = {  
  Awake: 1,
  Zombie: 2,
  Sleep: 3
};

var Me = function () {
  this.status = Status.JustWoke;
  this.mode = Mode.Awake;
  function drinkCoffee(){
    switch (this.status){
      case Status.JustWoke:
        return true;
      case Status.TryingToStayAwake:
        return true;
      case Status.FailingToStayAwake:
        this.activateZombieMode();
        return true;
      case Status.FallingAsleep:
        this.thinkOfTheCoffeeToDrinkWhenYouWake();
        return false;
      case Status.Sleeping:
        this.simulateCoffeeDrinkingInSleep();
        return false;
    }          
  }    
};
*/