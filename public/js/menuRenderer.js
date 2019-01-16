
MenuStates = {
  MainMenu: 0,
  TournamentMenu: 1 ,
  SingleFightMenu: 2,
  TeamMenu: 3,
  JoinTournamentMenu: 4,
  JoinArenaMenu: 5,
  GameOverMenu: 6,
  SetupMenu: 7,
  PlayersMenu: 8,
  PlayerUpgradeMenu: 9,
  PlayerEditMenu: 10,
  FieldFormationMenu: 11,
  NewTournamentMenu: 12,
  TournamentLobbyMenu: 13
};

var PlayersScreen = function (surfaceimg, loc, size){    
  Screen.call(this, surfaceimg, loc, size);
  this.currentPlayerIndex = 0;
  this.imgs = [];
  this.moveDistance = 0;
  this.moveSpeed = 0;
  this.releaseAudio = new GameAudio("snd/btnRelease.wav", false);
  
	for (var i = 0; i < 8; i++){
		pl = team.players[i];
		var img = new Image();
		if (pl.imageData!=null){
			img.src = pl.imageData;
		} else {
			img.src = "img/default.png";	
		}
		
		this.imgs.push(img);
	}
	
	this.updateText = ()=>{
		pl = team.players[this.currentPlayerIndex];
		this.texts = [];
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.75}, caption: "Name", text: pl.firstName + ' ' + pl.lastName, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.80}, caption: "Age", text: pl.age, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.85}, caption: "Gender",  text: pl.gender, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.9}, caption: "Motto", text: pl.motto, height: 20});
	}
	
	this.updateText();
  this.renderContents = () =>{
  	if (!this.pressed && (this.moveSpeed != 0 || this.moveDistance != 0)){
  		this.moveDistance += this.moveSpeed;
	  	this.updatePlayerIndex();
  		this.moveSpeed -= this.moveDistance/100;
  		this.moveSpeed *= 0.91;
  	}  
	  var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
    var loc = { x: this.loc.x * canvas.width, y: this.loc.y * canvas.height };
  	this.renderText(size, loc);
		var offset = 308*scale*this.moveDistance/35;		
  	ctx.drawImage(this.imgs[this.currentPlayerIndex], loc.x + 20*scale + offset, loc.y + 20*scale, 268*scale, 268*scale);  
  	  	
  }
  this.renderText = (size, loc) => {
    for (var i = 0; i < this.texts.length; i++){
      var text = this.texts[i].caption + ": " + this.texts[i].text;
      var height = this.texts[i].height;
      var font = this.texts[i].font;
      var pos = this.texts[i].pos;
      var x = pos.x * size.x; 
      var y = pos.y * size.y;
      x += loc.x + 20;
      y += loc.y + 20;
      ctx.font = height*scale + "px " + font;
      
      ctx.fillStyle="#fec";
      ctx.textAlign="start"; 
      ctx.fillText(text, x, y);
    }  
  };
  this.released = () => { 
  	
  };
  this.updatePlayerIndex = () => {
  	if (Math.abs(this.moveDistance)>30){
  		if (this.moveDistance>0){
  			this.currentPlayerIndex++;
  			if (this.currentPlayerIndex == 8)
  				this.currentPlayerIndex = 0;
  		} else {
	  		this.currentPlayerIndex--;
  			if (this.currentPlayerIndex == -1)
  				this.currentPlayerIndex = 7;
  		}
  		this.moveDistance -= this.moveSpeed;
  		this.moveDistance *= -1;
  		this.updateText();
  		this.releaseAudio.play();
  	}
  };
  this.moved = (loc, delta) => {   	
  	this.moveDistance += delta.x;
  	this.moveSpeed = delta.x;
  	this.updatePlayerIndex();
  };
}

var Pool = function (slots, loc) {
  this.slots = slots;
  this.loc = loc;
  this.size = {x: 0.48, y: slots === 2 ? 0.2 : 0.3};
  this.setSlots = (slots) => {
    this.slots = slots;
    this.size = {x: 0.48, y: slots === 2 ? 0.2 : 0.3};
    
  };
}

var LobbyScreen = function (surfaceimg, loc, size){    
  Screen.call(this, surfaceimg, loc, size);
  this.pools = [];
  this.avatars = [];
  this.currentAvatar = null;
  this.pools.push(new Pool(2, {x: 0.01, y:0.01}));
  
  this.pools.push({loc: {x: 0.51, y:0.01}, size: {x: 0.48, y: 0.3}});
  
  this.render = () => {
    var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
    var loc = { x: this.loc.x * canvas.width, y: this.loc.y * canvas.height };
    ctx.drawImage(this.surface, loc.x, loc.y, size.x, size.y);
    for (var i = 0; i < this.pools.length; i++){
      var pool = this.pools[i];
      this.renderPool(pool, loc, size);
    }
    for (var j = 0; j < this.avatars.length; j++){
      var avatar = this.avatars[j];
      this.renderAvatar(avatar);
    }    
  };
  this.renderPool = (pool, loc, size) => {
    ctx.fillStyle="#ffa1";
    ctx.strokeStyle="#ffa3";
    var b = 15;
    var w = size.x - 2*b;
    var h = size.y - 2*b;
    roundRect(ctx, loc.x+b+w*pool.loc.x, loc.y+b+h*pool.loc.y, w*pool.size.x, h*pool.size.y, 20, true, true);
  };
  this.renderAvatar = (avatar) => {
    
  };
}

var menuRenderer = {
  menus: {},
	renderScreen: false,
  state: MenuStates.MainMenu,
  init: () => {
    menuRenderer.tournament = new Tournament();
    menuRenderer.initAV();    
  },
  initAV: () => {    
    menuRenderer.bg = new Image();
    //menuRenderer.bg.src = 'img/menuback.webp';
    menuRenderer.bg.src = 'img/menuback.jpg';
    menuRenderer.bgscreen = new Image();
    //menuRenderer.bgscreen.src = 'img/menuscreen.webp';
    menuRenderer.bgscreen.src = 'img/menuscreen.png';
    menuRenderer.initMainMenu();
    menuRenderer.initSingleFightMenu();
    menuRenderer.initTournamentMenu();
    menuRenderer.initNewTournamentMenu();
    menuRenderer.initTournamentLobbyMenu();
    menuRenderer.initTeamMenu();
    menuRenderer.initSetupMenu();
    menuRenderer.initJoinArenaMenu();
    menuRenderer.initGameOverMenu();
    menuRenderer.initPlayersMenu();
    menuRenderer.initPlayerEditMenu();
  },
  initMainMenu: () => {
    var mmctrls = [];
    menuRenderer.menus[MenuStates.MainMenu] = mmctrls;    
    mmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "Single Fight"));
    mmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.23}, Control.Sizes["Wide"], "Tournament"));
    mmctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.39}, Control.Sizes["Narrow"], "Team", 35, "blue"));
    mmctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.51, y: 0.39}, Control.Sizes["Narrow"], "Score", 35, "blue"));
    mmctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.55}, Control.Sizes["Narrow"], "Setup", 35, "blue"));
    mmctrls[0].clicked = () => { menuRenderer.state = MenuStates.SingleFightMenu; };
    mmctrls[1].clicked = () => { menuRenderer.state = MenuStates.TournamentMenu; };
    mmctrls[2].clicked = () => { menuRenderer.state = MenuStates.TeamMenu; };
    mmctrls[4].clicked = () => { menuRenderer.state = MenuStates.SetupMenu; };
  },
  initSingleFightMenu: () => {
    var sfmctrls = [];
    menuRenderer.menus[MenuStates.SingleFightMenu] = sfmctrls;
    sfmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "New Arena"));
    sfmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.23}, Control.Sizes["Wide"], "Join Arena"));
    sfmctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    sfmctrls[0].clicked = () => {
      var request = new XMLHttpRequest();
      request.responseType = 'json';
      request.open('GET', "createArena", true);      
      request.onload = function() {
        console.log(request.response);
        if (request.response.type === "arenaCreated"){
          gameRenderer.arenaID = request.response.arenaID;
          gameRenderer.setRenderer();
        }
      };
      request.send();
    };
    sfmctrls[1].clicked = () => { 
      modalShow("Arena", 100);
      modalAccept = () => {
        var arenaID = document.getElementById('modalInput').value;
        if (arenaID !== ""){
          arenaID = parseInt(arenaID);
          gameRenderer.arenaID = arenaID;
          gameRenderer.setRenderer();
        } 
      };
    };
    sfmctrls[2].clicked = () => { menuRenderer.state = MenuStates.MainMenu; };
  },
  initJoinArenaMenu: () => {
    var jamctrls = [];
    menuRenderer.menus[MenuStates.JoinArenaMenu] = jamctrls;
    jamctrls.push(new TextBox('img/txtbx.png', {x: 0.1, y: 0.06}, Control.Sizes["Wide"], "Arena ID:", {name: "teamName"}, 32));
  },
  initTournamentMenu: () => {
    var tnmctrls = [];
    menuRenderer.menus[MenuStates.TournamentMenu] = tnmctrls;
    tnmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "New Tournament", 32));
    tnmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.23}, Control.Sizes["Wide"], "Join Tournament", 32));
    tnmctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    tnmctrls[2].clicked = () => { 
      menuRenderer.state = MenuStates.MainMenu;       
    };
    tnmctrls[1].clicked = () => { 
      modalShow("Tournament", 100);
      modalAccept = () => {
        var tournamentID = document.getElementById('modalInput').value;
        if (tournamentID !== ""){
          tournamentID = parseInt(tournamentID);
           menuRenderer.connectTournament(tournamentID, MenuStates.TournamentLobbyMenu)
        } 
      };
    };
    tnmctrls[0].clicked = () => {
      if (menuRenderer.tournament.ws !== null){
        menuRenderer.tournament.ws.close();
      }
      menuRenderer.connectTournament(0, MenuStates.NewTournamentMenu)
    };
  },  
  initNewTournamentMenu: () => {
    var ctrls = [];
    menuRenderer.menus[MenuStates.NewTournamentMenu] = ctrls;
    ctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    ctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.51, y: 0.78}, Control.Sizes["Narrow"], "Lobby", 35, "blue"));
    ctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "Tournament ID:", {name: "tournamentID"}, 32));            
    ctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.23}, Control.Sizes["Wide"], "Player Count:", {name: "playerCount"}, 32));            
    ctrls.push(new NUDBox('img/txtbx.png', {x: 0.125, y: 0.39}, Control.Sizes["Wide"], "Pool size:", {name: "poolSize"}, 32)); 
    ctrls[2].editable = false;
    ctrls[3].editable = false;
    ctrls[1].clicked = () => {  
      menuRenderer.state = MenuStates.TournamentLobbyMenu; 
    };
    ctrls[0].clicked = () => { 
      menuRenderer.state = MenuStates.TournamentMenu; 
      menuRenderer.tournament.ws.close();
      menuRenderer.tournament.ws = null;
    };
    ctrls[4].changed = (oldValue, newValue) => {      
      var poolSize = newValue;
      if (poolSize !== ""){
        poolSize = parseInt(poolSize);          
        var msg = {
          type: "poolSizeChanged", 
          poolSize: poolSize            
        };
        menuRenderer.tournament.ws.send(JSON.stringify(msg));
      }       
    };
  },
  
  initTournamentLobbyMenu: () => {
    var ctrls = [];
    menuRenderer.menus[MenuStates.TournamentLobbyMenu] = ctrls;
    ctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    ctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.51, y: 0.78}, Control.Sizes["Narrow"], "Start", 35, "blue"));
    ctrls.push(new LobbyScreen('img/screentall.png', {x: 0.125, y: 0.07}, {x: 0.75, y: 0.7}));
    ctrls[0].clicked = () => { 
      menuRenderer.state = MenuStates.NewTournamentMenu; 
    };
    ctrls[1].clicked = () => { 
      
    };
  },
  initTeamMenu: () => {
    var tmmctrls = [];
    menuRenderer.menus[MenuStates.TeamMenu] = tmmctrls;
    tmmctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "Team Name:", team.name, 32));
    tmmctrls[0].emptyInputAlternate = getNewTeamName;
    tmmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.39}, Control.Sizes["Wide"], "Formations"));
    tmmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.23}, Control.Sizes["Wide"], "Players"));
    tmmctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    tmmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.55}, Control.Sizes["Wide"], "Tactics"));
    tmmctrls[2].clicked = () => { 
    	menuRenderer.state = MenuStates.PlayersMenu; 
    	menuRenderer.renderScreen = true;
		};
    tmmctrls[3].clicked = () => { menuRenderer.state = MenuStates.MainMenu; };
  },
  initSetupMenu: () => {
    var stpmctrls = [];
    menuRenderer.menus[MenuStates.SetupMenu] = stpmctrls;
    stpmctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    stpmctrls[0].clicked = () => { 
    	menuRenderer.state = MenuStates.MainMenu; 
    };
  },
  initGameOverMenu: () => {
    var gomctrls = [];
    menuRenderer.menus[MenuStates.GameOverMenu] = gomctrls;
    gomctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "The Winner:", {name: "winner"}, 32));
    gomctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.3, y: 0.3}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    gomctrls[0].editable = false;
    gomctrls[1].clicked = () => { menuRenderer.state = MenuStates.MainMenu; };
  },
  initPlayersMenu: () => {
    var ctrls = [];
    menuRenderer.screen = true;
    menuRenderer.menus[MenuStates.PlayersMenu] = ctrls;
    ctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    ctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.51, y: 0.78}, Control.Sizes["Narrow"], "Edit", 35, "blue"));
    ctrls.push(new PlayersScreen('img/screentall.png', {x: 0.125, y: 0.07}, {x: 0.75, y: 0.7}));
    ctrls[0].clicked = () => { 
	    menuRenderer.state = MenuStates.TeamMenu; 
    	menuRenderer.renderScreen = false;
    };
    ctrls[1].clicked = () => { 
      menuRenderer.state = MenuStates.PlayerEditMenu; 
      menuRenderer.renderScreen = false;
      var playersScreen = menuRenderer.menus[MenuStates.PlayersMenu][2];
      menuRenderer.menus[MenuStates.PlayerEditMenu][1].value = team.players[playersScreen.currentPlayerIndex].firstName;
      menuRenderer.menus[MenuStates.PlayerEditMenu][2].value = team.players[playersScreen.currentPlayerIndex].lastName;
      menuRenderer.menus[MenuStates.PlayerEditMenu][3].value = team.players[playersScreen.currentPlayerIndex].gender;
    };
    
  },
  initPlayerEditMenu: () => {
    var ctrls = [];
    menuRenderer.menus[MenuStates.PlayerEditMenu] = ctrls;

    ctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    ctrls[0].clicked = () => { 
    	menuRenderer.state = MenuStates.PlayersMenu; 
    	menuRenderer.renderScreen = true;
    };
    ctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "First Name:", {name: "playerName"}, 32));
    ctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.23}, Control.Sizes["Wide"], "Last Name:", {name: "playerName"}, 32));
    ctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.39}, Control.Sizes["Wide"], "Gender:", {name: "playerGender"}, 32));
    ctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.55}, Control.Sizes["Wide"], "Picture"));
    ctrls[1].changed = (oldval, newval) => {
	    var playersScreen = menuRenderer.menus[MenuStates.PlayersMenu][2];
    	team.players[playersScreen.currentPlayerIndex].firstName = newval;
    	playersScreen.updateText();
    	saveTeam();
    }
    ctrls[2].changed = (oldval, newval) => {
	    var playersScreen = menuRenderer.menus[MenuStates.PlayersMenu][2];
    	team.players[playersScreen.currentPlayerIndex].lastName = newval;
    	playersScreen.updateText();
    	saveTeam();
    }
    ctrls[3].changed = (oldval, newval) => {
	    var playersScreen = menuRenderer.menus[MenuStates.PlayersMenu][2];
    	team.players[playersScreen.currentPlayerIndex].gender = newval;
    	playersScreen.updateText();
    	saveTeam();
    }
    ctrls[4].clicked = () => { 
    	playerRenderer.setRenderer(); 
    	var playersScreen = menuRenderer.menus[MenuStates.PlayersMenu][2];
    	playerRenderer.playerImage = playersScreen.imgs[playersScreen.currentPlayerIndex];
    };
  },
  ctrls: () => {
    return menuRenderer.menus[menuRenderer.state];
  },  
  connectTournament: (id, destinationMenu) => {
    localStorage.setItem("playerCount", 0);
    localStorage.setItem("poolSize", 4);
    menuRenderer.tournament.ws = new WebSocket("ws://" + location.host);
    menuRenderer.tournament.ws.onopen = function()
    {
      var msg = {
        type: "tournamentConnection", 
        teamName: localStorage.teamName,
        tournamentID: id
      };
      menuRenderer.tournament.ws.send(JSON.stringify(msg));
      console.log("Connection request is sent...");
      menuRenderer.tournament.connected = true;
      menuRenderer.state = destinationMenu;
    };
    menuRenderer.tournament.ws.onmessage = menuRenderer.tournament.onmessage;
    menuRenderer.tournament.ws.onclose = (evt) => {        
      menuRenderer.tournament.onclose();  
      if (evt.srcElement===menuRenderer.tournament.ws){ 
        // This indicates that the current tournament connection was closed
        menuRenderer.tournament.ws = null;
        menuRenderer.state = MenuStates.TournamentMenu;
      }
    } 
  },
  update: () => {

  },
  render: () => {
    ctx.fillStyle="#222";
    ctx.fillRect ( 0 , 0 , canvas.width , canvas.height );
    var ctrls = menuRenderer.ctrls();
    if (menuRenderer.renderScreen){    
    	for (var i = 0; i < ctrls.length; i++){
				var ctrl = ctrls[i];
				if (ctrl.isScreen){
					ctrl.renderContents();
				}				
			}	
      ctx.drawImage(menuRenderer.bgscreen, 0, 0, canvas.width, canvas.height);
    } else
		  ctx.drawImage(menuRenderer.bg, 0, 0, canvas.width, canvas.height);    
    for (var i = 0; i < ctrls.length; i++){
      var ctrl = ctrls[i];
      ctrl.render();
    }
  },
  touchStart: (e)=>{
    e.preventDefault();
    if(e.touches == undefined){
      for (var i = 0; i< menuRenderer.ctrls().length; i++){
        var ctrl = menuRenderer.ctrls()[i];      
        var loc = {x: e.clientX, y: e.clientY};
        ctrl.touchStart(loc);
      }     
    } else {
      var touch = e.touches[e.which];    
      var loc = {x: touch.clientX, y: touch.clientY};
      for (var i = 0; i< menuRenderer.ctrls().length; i++){
        var ctrl = menuRenderer.ctrls()[i];      
        ctrl.touchStart(loc);
      }    
    }    
  },
  touchMove: (e)=>{
    e.preventDefault();
    if(e.touches == undefined){
      if (e.buttons != 0){
        for (var i = 0; i< menuRenderer.ctrls().length; i++){
          var ctrl = menuRenderer.ctrls()[i];      
          var loc = {x: e.clientX, y: e.clientY};
          ctrl.touchMove(loc);
        }     
      }      
    } else {
      var touch = e.changedTouches[e.which];    
      var loc = {x: touch.clientX, y: touch.clientY};
      for (var i = 0; i< menuRenderer.ctrls().length; i++){      
        var ctrl = menuRenderer.ctrls()[i];      
        ctrl.touchMove(loc);
        
      }    
    }    
  },
  touchEnd: (e)=>{
    e.preventDefault();
    for (var i = 0; i< menuRenderer.ctrls().length; i++){
      var ctrl = menuRenderer.ctrls()[i];
      ctrl.touchEnd();      
    }
  },
  keyDown: (e)=>{
    e.preventDefault();
    console.log(e);
    gameRenderer.setRenderer();
  },
  keyUp: (e)=>{

  },
  setRenderer: () => {
    history.pushState({state: "menuRenderer"}, "game", "index.html");
    if (currentRenderer !== undefined && currentRenderer !== null){
      currentRenderer.unsetRenderer();
    }
    canvas.addEventListener("touchstart", menuRenderer.touchStart, false);
    canvas.addEventListener("touchmove", menuRenderer.touchMove, false);
    canvas.addEventListener("touchend", menuRenderer.touchEnd, false);    

    canvas.addEventListener("mousedown", menuRenderer.touchStart, false); 
    canvas.addEventListener("mouseup", menuRenderer.touchEnd, false);   
    canvas.addEventListener("mousemove", menuRenderer.touchMove, false);  
    
    currentRenderer = menuRenderer;    
  },
  unsetRenderer: () => {
    canvas.removeEventListener("touchstart", menuRenderer.touchStart);
    canvas.removeEventListener("touchmove", menuRenderer.touchMove);
    canvas.removeEventListener("touchend", menuRenderer.touchEnd); 
    
    canvas.removeEventListener("mousedown", menuRenderer.touchStart); 
    canvas.removeEventListener("mouseup", menuRenderer.touchEnd);   
    canvas.removeEventListener("mousemove", menuRenderer.touchMove); 
       
    currentRenderer = null;    
  }
};
