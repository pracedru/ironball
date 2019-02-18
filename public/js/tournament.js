
var Tournament = function(){
  this.connected = false;
  this.ws = null;
  this.teamId = 0;
  this.teamTournamentState = null;
  this.playerUpgrades = {};
  this.gameType = -1;
  this.kachingAudio = new GameAudio("snd/kaching.wav", false);
  this.tree = null;
  this.participants = {};
  this.onmessage = (evt) => {
    var msg = JSON.parse(evt.data);
    //console.log(evt.data);
    switch (msg.t){
      case MsgTypes.Connected:
        localStorage.setItem("tournamentID", msg.id);
        this.teamId = msg.teamId;
        this.teamTournamentState = msg.teamTournamentState;
        this.gameType = msg.gt;
        //console.log(evt.data);
        menuRenderer.menus[MenuStates.TeamManagerMenu][2].updateText();
        break;
      case MsgTypes.TournamentStateChanged:
        localStorage.setItem("playerCount", msg.playerCount);
        localStorage.setItem("poolSize", msg.poolSize);
        this.tree = msg.tt;
        this.participants = {};
        for (var i in msg.p){
        	var participant = msg.p[i];
        	this.participants[participant.id] = participant;
        }
        if (msg.gt === GameTypes.SingleMatch){
        	if (menuRenderer.state == MenuStates.InvitePlayerMenu && msg.playerCount >= 2){
				  	menuRenderer.state = MenuStates.TeamManagerMenu;
				  	menuRenderer.renderScreen = true;        	
        	}        	
        }
        if (this.tree.gamesFinished.length != 0 && this.tree.gamesInProgress.length == 0 && this.tree.gamesUnfinished.length == 0){
		  		menuRenderer.state = MenuStates.TournamentFinishedMenu;
		  		var winner = null;
		  		for (var id in this.participants){
		  			var participant = this.participants[id];
		  			if (winner == null) winner = participant;
		  			else {
		  				if (winner.wins < participant.wins) winner = participant;
		  				else if (winner.wins == participant.wins && winner.score < participant.score) winner = participant;
		  			}
		  		}
					menuRenderer.menus[MenuStates.TournamentFinishedMenu][1].value = winner.name;
					menuRenderer.renderScreen = false;        	
		  	}
        break;
      case MsgTypes.TeamTournamentStateChanged:
      	//console.log(evt.data);
      	if (this.teamTournamentState.id === msg.teamTournamentState.id){
      		this.teamTournamentState = msg.teamTournamentState;
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
    this.ws = null;
  }
  this.onDoneClicked = () => {
  	var msg = {
  		t: MsgTypes.TeamManagementDone
  	}
  	var data = JSON.stringify(msg);
  	this.ws.send(data);
  }
}


