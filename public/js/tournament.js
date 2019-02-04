
var Tournament = function(){
  this.connected = false;
  this.ws = null;
  this.teamId = 0;
  this.team = null;
  this.playerUpgrades = {};
  
  this.onmessage = (evt) => {
    var msg = JSON.parse(evt.data);
    //console.log(evt.data);
    switch (msg.t){
      case MsgTypes.Connected:

        localStorage.setItem("tournamentID", msg.id);
        this.teamId = msg.teamId;
        this.team = msg.team;
        console.log(JSON.stringify(this));
        menuRenderer.menus[MenuStates.TeamManagerMenu][2].updateText();
        break;
      case MsgTypes.TournamentStateChanged:
        localStorage.setItem("playerCount", msg.playerCount);
        localStorage.setItem("poolSize", msg.poolSize);
        break;
      case MsgTypes.TeamUpgradesChanged:
      	console.log(evt.data);
      	this.team = msg.team;
      	menuRenderer.menus[MenuStates.TeamManagerMenu][2].updateText();
      	break;
      case MsgTypes.TeamIdChanged:
      	
      	break;
    }
  }
  this.onclose = function()
  {
    console.log("Connection to tournament is closed...");    
  }
}


