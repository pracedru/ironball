
document.addEventListener("DOMContentLoaded", function(){
  init();
});
var teamIndex = 0;
var team = null;
var playerImages = [];
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
	var firstName = maleFirstNames[Math.floor(Math.random()*maleFirstNames.length)];
	var lastName = lastNames[Math.floor(Math.random()*lastNames.length)];
	var player = createPlayer(firstName, lastName, 23+Math.floor(Math.random()*10), "Male", "Score galore");
  return player;
}

function createPlayer(firstName, lastName, age, gender, motto){
  var player = {
    firstName: firstName,
    lastName: lastName,
    age: age,
    gender: gender,
    motto: motto,
    imageData: null
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

function loadTeam(index){
	team = JSON.parse(localStorage.getItem("team" + index));	
  return team;
}

function saveTeam(){
	localStorage.setItem("team" + teamIndex, JSON.stringify(team));
}

function setPlayers(players){
  localStorage.players = JSON.stringify(players);
}


window.onpopstate = function (e) {
  //console.log(e);
  if (e.state.state === "menuRenderer"){
    menuRenderer.setRenderer();
  }
};

function createNewTeam() {
	newTeam = {
		name: getNewTeamName(),
		players: getNewPlayers(),
		formations: {
			'aggressive': defaultPositions['aggressive'],
			'defensive': defaultPositions['defensive'],
			'balanced': defaultPositions['balanced'] 
		},
		tactics: {
			
		}		
	}		
	return newTeam;
}

function init(){
	teamIndex = localStorage.getItem("teamIndex");
	if (teamIndex == undefined){
		teamIndex = 0;
		team = createNewTeam();
		localStorage.setItem("teamIndex", teamIndex);
		saveTeam();
		
	} else {
		teamIndex = parseInt(teamIndex);
		team = loadTeam(teamIndex);
		
	}

  canvas = document.getElementById("renderTarget");
  ctx = canvas.getContext('2d');  
  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scale = canvas.width/412;    
  }
  resizeCanvas();  
  menuRenderer.init();
  gameRenderer.init();
  playerRenderer.init();
  
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

