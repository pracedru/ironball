
var Tournament = function(){
  this.connected = false;
  this.ws = null;
  this.teamId = 0;
  this.teamUpgrades = null;
  this.playerUpgrades = {};
  this.gameType = -1;
  this.kachingAudio = new GameAudio("snd/kaching.wav", false);
  this.onmessage = (evt) => {
    var msg = JSON.parse(evt.data);
    //console.log(evt.data);
    switch (msg.t){
      case MsgTypes.Connected:
        localStorage.setItem("tournamentID", msg.id);
        this.teamId = msg.teamId;
        this.teamUpgrades = msg.teamUpgrades;
        this.gameType = msg.gt;
        //console.log(evt.data);
        menuRenderer.menus[MenuStates.TeamManagerMenu][2].updateText();
        break;
      case MsgTypes.TournamentStateChanged:
        localStorage.setItem("playerCount", msg.playerCount);
        localStorage.setItem("poolSize", msg.poolSize);
        if (msg.gt === GameTypes.SingleMatch && msg.playerCount >= 2){
        	menuRenderer.state = MenuStates.TeamManagerMenu;
        	menuRenderer.renderScreen = true;
        }
        break;
      case MsgTypes.TeamUpgradesChanged:
      	//console.log(evt.data);
      	if (this.teamUpgrades.id === msg.teamUpgrades.id){
      		this.teamUpgrades = msg.teamUpgrades;
      		menuRenderer.menus[MenuStates.TeamManagerMenu][2].updateText();
      		this.kachingAudio.play();
      	}
      	
      	break;
      case MsgTypes.TeamIdChanged:
      	
      	break;
      case MsgTypes.ArenaCreated:
      	gameRenderer.arenaID = msg.id;
        gameRenderer.handsOff = false;
        gameRenderer.setRenderer();
        
      	break;
      default:
      	console.log(evt.data);
    }
  }
  this.onclose = () => {
    console.log("Connection to tournament is closed...");    
  }
  this.onDoneClicked = () => {
  	var msg = {
  		t: MsgTypes.TeamManagementDone
  	}
  	var data = JSON.stringify(msg);
  	this.ws.send(data);
  }
}


