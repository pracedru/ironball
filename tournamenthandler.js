var tournaments = {};

exports.Tournament = function(id) {
  this.id = id;
  this.participantSockets = [];
  this.recycled = false;
  this.arenas = [];
  this.poolSize = 2;
  tournaments[this.id] = this;
  console.log("tournament created: " + id);
  this.checkRecycle = () => {
    if (this.participantSockets.length === 0){
      console.log("Tournament recycled");
      tournaments[this.id] = null;
      this.arenas = [];
      this.recycled = true;      
    }
  }
  
  this.onParticipantMessage = (data) => { 
    var msg = JSON.parse(data); 
    //console.log(data);
    switch (msg.type){
      case "poolSizeChanged":
        var poolSize = Math.min(4, Math.max(2, parseInt(msg.poolSize)));        
        if (poolSize){
          this.poolSize = poolSize;
          this.onTournamentStateChanged();
        }        
        break;
    }            
  }
  
  this.getTournamentState = () => {
    return {
      id: this.id,
      playerCount: this.participantSockets.length,
      poolSize: this.poolSize
    }
  }
  
  this.addSocket = (webSocket, msg) => {    
    webSocket.tournament = this;
    this.participantSockets.push(webSocket);
    webSocket.on("message", this.onParticipantMessage);
    webSocket.on("close", (evt)=>{ 
      console.log("websocket closed " + JSON.stringify(evt));
      var index = this.participantSockets.indexOf(webSocket);
      console.log("index: " + index);
      this.participantSockets.splice(index, 1); 
      this.onTournamentStateChanged();
      this.checkRecycle(); 
    });
    var tournamentState = this.getTournamentState();
    tournamentState.type = "connected";
    webSocket.send(JSON.stringify(tournamentState));
    this.onTournamentStateChanged();
  }
  
  this.onTournamentStateChanged = () => {
    var tournamentState = this.getTournamentState();
    tournamentState.type = "tournamentStateChanged";
    var data = JSON.stringify(tournamentState);
    for (var i = 0; i < this.participantSockets.length ; i++){
      try {
        var webSocket = this.participantSockets[i];
        webSocket.send(data);
      } catch (e){
        
      }
    }    
  }
  
  this.update = () => {    
    if (!this.recycled){
      setTimeout(this.update, 500, 'update');
    }
  }
  setTimeout(this.update, 500, 'update');
}

exports.getTournament = function(id) {
  if (id in tournaments){
    return tournaments[id];
  } else{
    return null;
  }
}
