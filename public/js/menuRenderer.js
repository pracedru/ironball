/* global canvas, scale, ctx, Base, gameRenderer, currentRenderer, Btn, getNewTeamName */


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
  this.texts = [];
  this.texts.push({ font: "monospace", pos: {x: 0, y: 0.75}, caption: "Name", text: 'Ronal Drumph', height: 20});
  this.texts.push({ font: "monospace", pos: {x: 0, y: 0.80}, caption: "Age", text: '170', height: 20});
  this.texts.push({ font: "monospace", pos: {x: 0, y: 0.85}, caption: "Gender",  text: 'Hermafrodite', height: 20});
  this.texts.push({ font: "monospace", pos: {x: 0, y: 0.9}, caption: "Moto", text: 'MAGA', height: 20});
  this.img = null;
  
  this.render = () => {
    //this.testImg = Filters.createImageData(testImg.width, testImg.height);
    var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
    var loc = { x: this.loc.x * canvas.width, y: this.loc.y * canvas.height };
    if (this.img===null)
      this.img = Filters.filterImage(testImg, [{ function: Filters.screenFilter}], {x: 268*scale, y: 268*scale});
    ctx.drawImage(this.surface, loc.x, loc.y, size.x, size.y);    
    ctx.drawImage(this.img, loc.x + 20*scale, loc.y + 20*scale);    
    this.renderText(size, loc);
  };
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
      
      ctx.fillStyle="#bb7";
      ctx.textAlign="start"; 
      ctx.fillText(text, x, y);
    }  
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
    //this.testImg = Filters.createImageData(testImg.width, testImg.height);
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
  state: MenuStates.MainMenu,
  init: () => {
    menuRenderer.tournament = new Tournament();
    menuRenderer.initAV();    
  },
  initAV: () => {    
    menuRenderer.bg = new Image();
    menuRenderer.bg.src = 'img/menuback.png';
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
    mmctrls[0].clicked = () => { menuRenderer.state = MenuStates.SingleFightMenu; };// gameRenderer.setRenderer;
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
    //menuRenderer.sfmctrls[0].clicked = gameRenderer.setRenderer;
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
    tnmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "New Tournament"));
    tnmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.23}, Control.Sizes["Wide"], "Join Tournament"));
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
    tmmctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "Team Name:", {name: "teamName"}, 32));
    tmmctrls[0].emptyInputAlternate = getNewTeamName;
    tmmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.39}, Control.Sizes["Wide"], "Formations"));
    tmmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.23}, Control.Sizes["Wide"], "Players"));
    tmmctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    tmmctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.55}, Control.Sizes["Wide"], "Tactics"));
    tmmctrls[2].clicked = () => { menuRenderer.state = MenuStates.PlayersMenu; };
    tmmctrls[3].clicked = () => { menuRenderer.state = MenuStates.MainMenu; };
  },
  initSetupMenu: () => {
    var stpmctrls = [];
    menuRenderer.menus[MenuStates.SetupMenu] = stpmctrls;
    stpmctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    stpmctrls[0].clicked = () => { menuRenderer.state = MenuStates.MainMenu; };
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
    menuRenderer.menus[MenuStates.PlayersMenu] = ctrls;
    ctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    ctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.51, y: 0.78}, Control.Sizes["Narrow"], "Edit", 35, "blue"));
    ctrls.push(new PlayersScreen('img/screentall.png', {x: 0.125, y: 0.07}, {x: 0.75, y: 0.7}));
    ctrls[0].clicked = () => { menuRenderer.state = MenuStates.TeamMenu; };
    ctrls[1].clicked = () => { menuRenderer.state = MenuStates.PlayerEditMenu; };
  },
  initPlayerEditMenu: () => {
    var ctrls = [];
    menuRenderer.menus[MenuStates.PlayerEditMenu] = ctrls;
    ctrls.push(new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.78}, Control.Sizes["Narrow"], "Back", 35, "blue"));
    ctrls[0].clicked = () => { menuRenderer.state = MenuStates.PlayersMenu; };
    ctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "Name:", {name: "playerName"}, 32));
    ctrls.push(new TextBox('img/txtbx.png', {x: 0.125, y: 0.23}, Control.Sizes["Wide"], "Gender:", {name: "playerGender"}, 32));
    ctrls.push(new Button('img/wbtn.png', 'img/wbtnpress.png', {x: 0.125, y: 0.39}, Control.Sizes["Wide"], "Picture"));
    ctrls[3].clicked = () => { playerRenderer.setRenderer(); };
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
    ctx.drawImage(menuRenderer.bg, 0, 0, canvas.width, canvas.height);
    for (var i = 0; i < menuRenderer.ctrls().length; i++){
      var ctrl = menuRenderer.ctrls()[i];
      ctrl.render();
    }
  },
  touchStart: (e)=>{
    e.preventDefault();
    var touch = e.touches[e.which];    
    var loc = {x: touch.clientX, y: touch.clientY};
    for (var i = 0; i< menuRenderer.ctrls().length; i++){
      var ctrl = menuRenderer.ctrls()[i];      
      ctrl.touchStart(loc);
    }    
  },
  touchMove: (e)=>{
    e.preventDefault();
    var touch = e.changedTouches[e.which];    
    var loc = {x: touch.clientX, y: touch.clientY};
    for (var i = 0; i< menuRenderer.ctrls().length; i++){      
      var ctrl = menuRenderer.ctrls()[i];      
      ctrl.touchMove(loc);
      
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
    currentRenderer = menuRenderer;    
  },
  unsetRenderer: () => {
    canvas.removeEventListener("touchstart", menuRenderer.touchStart);
    canvas.removeEventListener("touchmove", menuRenderer.touchMove);
    canvas.removeEventListener("touchend", menuRenderer.touchEnd);    
    currentRenderer = null;    
  }
};
