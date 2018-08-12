
var Tournament = function(){
  this.connected = false;
  this.ws = null;
  this.id = 0;
  this.onmessage = function (evt){
    //console.log(evt.data);
    var msg = JSON.parse(evt.data);
    switch (msg.type){
      case "connected":
        //console.log("tournamentConnected");
        localStorage.setItem("tournamentID", msg.id);
        break;
      case "tournamentStateChanged":
        localStorage.setItem("playerCount", msg.playerCount);
        localStorage.setItem("poolSize", msg.poolSize);
        break;
    }
  };
  this.onclose = function()
  {
    console.log("Connection to tournament is closed...");    
  };
};