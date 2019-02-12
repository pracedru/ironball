
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
  TournamentLobbyMenu: 13,
  FormationsMenu: 14,
  FormationMenu: 15,
  PlacesMenu: 16,
  TeamManagerMenu: 17,
  InvitePlayerMenu: 18
};

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
  selectedFormation: null,
  init: () => {
    menuRenderer.tournament = new Tournament();
    menuRenderer.initAV();    
  },
  initAV: () => {    
    menuRenderer.bg = new Image();
    //menuRenderer.bg.src = 'img/menuback.webp';
    menuRenderer.bg.src = 'img/sm_menuback.jpg';
    menuRenderer.bgscreen = new Image();
    //menuRenderer.bgscreen.src = 'img/menuscreen.webp';
    menuRenderer.bgscreen.src = 'img/sm_menuscreen.png';
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
    menuRenderer.initFormationsMenu();
    menuRenderer.initFormationMenu();
    menuRenderer.initPlacesMenu();
    menuRenderer.initManagerMenu();
    menuRenderer.initInvitePlayerMenu();
  },
  initMainMenu: () => {
    var mmctrls = [];
    menuRenderer.menus[MenuStates.MainMenu] = mmctrls;    
    mmctrls.push(new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "Single Match", 30, "dark"));
    mmctrls.push(new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.20}, Control.Sizes["Wide"], "Tournament", 30, "dark"));
    mmctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.33}, Control.Sizes["Narrow"], "Team", 30, "dark"));
    mmctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.51, y: 0.33}, Control.Sizes["Narrow"], "Score", 30, "dark"));
    mmctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.46}, Control.Sizes["Narrow"], "Setup", 30, "dark"));
    mmctrls[0].clicked = () => { menuRenderer.state = MenuStates.SingleFightMenu; };
    mmctrls[1].clicked = () => { menuRenderer.state = MenuStates.TournamentMenu; };
    mmctrls[2].clicked = () => { menuRenderer.state = MenuStates.TeamMenu; };
    mmctrls[4].clicked = () => { menuRenderer.state = MenuStates.SetupMenu; };
  },
  initSingleFightMenu: () => {
    var sfmctrls = [];
    menuRenderer.menus[MenuStates.SingleFightMenu] = sfmctrls;
    var newMatchButton = new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "New Match", 30, "dark");
    var joinMatchButton = new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.20}, Control.Sizes["Wide"], "Join Match", 30, "dark");
    var newHandsOffMatchButton = new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.33}, Control.Sizes["Wide"], "Hands Off", 30, "dark");
    var backButton = new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark"); 
    var testButton = new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.46}, Control.Sizes["Wide"], "Test", 30, "dark");
    sfmctrls.push(newMatchButton);
    sfmctrls.push(joinMatchButton);    
    sfmctrls.push(newHandsOffMatchButton);
    sfmctrls.push(backButton);
		sfmctrls.push(testButton);
		newMatchButton.clicked = () => {
			menuRenderer.connectTournament(0, MenuStates.InvitePlayerMenu, GameTypes.SingleMatch);
    }
    joinMatchButton.clicked = () => { 
      modalShow("Invitation", 100);
      modalAccept = () => {
        var tournamentID = document.getElementById('modalInput').value;
        if (tournamentID !== ""){
        	menuRenderer.connectTournament(tournamentID, MenuStates.TeamManagerMenu, GameTypes.SingleMatch);
          
          /*tournamentID = parseInt(tournamentID);
          gameRenderer.arenaID = arenaID;
          gameRenderer.setRenderer();*/
        } 
      }
    }
    newHandsOffMatchButton.clicked = () => { 
      var request = new XMLHttpRequest();
      request.responseType = 'json';
      request.open('GET', "createArena", true);      
      request.onload = function() {
        if (request.response.t === MsgTypes.ArenaCreated){
          gameRenderer.arenaID = request.response.arenaID;
          gameRenderer.handsOff = true;
          gameRenderer.setRenderer();
        }
      }
      request.send();
    }
    testButton.clicked = () => { 
    	menuRenderer.connectTournament(0, MenuStates.InvitePlayerMenu, GameTypes.SingleMatch);
    }
    backButton.clicked = () => { menuRenderer.state = MenuStates.MainMenu; };
  },
  initInvitePlayerMenu: () => {
  	var ctrls = [];
  	menuRenderer.menus[MenuStates.InvitePlayerMenu] = ctrls;
  	var backBtn = new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark"); 
  	var inviteAddressTxt = new TextBox('img/sm_txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "Invite friend to", {name: "tournamentID"}, 25, "dark");
  	var playAgainstAIBtn = new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.20}, Control.Sizes["Wide"], "Play against AI", 30, "dark");
  	inviteAddressTxt.editable = false;
  	backBtn.clicked = () => {
  		menuRenderer.state = MenuStates.SingleFightMenu; 
		  menuRenderer.tournament.ws.close();
		  menuRenderer.tournament.ws = null;
  	}
  	playAgainstAIBtn.clicked = () => {
  		var msg = {
  			t: MsgTypes.PlayAgainstAI
  		}
  		var data = JSON.stringify(msg);
  		menuRenderer.tournament.ws.send(data);
  		menuRenderer.state = MenuStates.TeamManagerMenu;
  		menuRenderer.renderScreen = true;
  	}
  	ctrls.push(inviteAddressTxt);
  	ctrls.push(backBtn);
  	ctrls.push(playAgainstAIBtn);
  },
  initJoinArenaMenu: () => {
    var jamctrls = [];
    menuRenderer.menus[MenuStates.JoinArenaMenu] = jamctrls;
    jamctrls.push(new TextBox('img/sm_txtbx.png', {x: 0.1, y: 0.06}, Control.Sizes["Wide"], "Arena ID:", {name: "teamName"}, 25, "dark"));
  },
  initTournamentMenu: () => {
    var tnmctrls = [];
    menuRenderer.menus[MenuStates.TournamentMenu] = tnmctrls;
    tnmctrls.push(new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "New Tournament", 30, "dark"));
    tnmctrls.push(new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.20}, Control.Sizes["Wide"], "Join Tournament", 30, "dark"));
    tnmctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark"));
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
        menuRenderer.state = MenuStates.SingleFightMenu; 
		    menuRenderer.tournament.ws.close();
		    menuRenderer.tournament.ws = null;
      }
      menuRenderer.connectTournament(0, MenuStates.NewTournamentMenu)
    };
  },  
  initNewTournamentMenu: () => {
    var ctrls = [];
    menuRenderer.menus[MenuStates.NewTournamentMenu] = ctrls;
    ctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark"));
    ctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.51, y: 0.815}, Control.Sizes["Narrow"], "Lobby", 30, "dark"));
    ctrls.push(new TextBox('img/sm_txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "Tournament ID:", {name: "tournamentID"}, 30, "dark"));            
    ctrls.push(new TextBox('img/txtbxnarrow.png', {x: 0.125, y: 0.20}, Control.Sizes["Narrow"], "Player Count:", {name: "playerCount"}, 30, "dark"));            
    ctrls.push(new NUDBox('img/txtbxnarrow.png', {x: 0.51, y: 0.20}, Control.Sizes["Narrow"], "Pool size:", {name: "poolSize"}, 30, "dark")); 
    ctrls[2].editable = false;
    ctrls[3].editable = false;
    ctrls[1].clicked = () => {  
      menuRenderer.state = MenuStates.TournamentLobbyMenu; 
    }
    ctrls[0].clicked = () => { 
      menuRenderer.state = MenuStates.TournamentMenu; 
      menuRenderer.tournament.ws.close();
      menuRenderer.tournament.ws = null;
    }
    ctrls[4].changed = (oldValue, newValue) => {      
      var poolSize = newValue;
      if (poolSize !== ""){
        poolSize = parseInt(poolSize);          
        var msg = {
          t: MsgTypes.PoolSizeChanged, 
          poolSize: poolSize            
        }
        menuRenderer.tournament.ws.send(JSON.stringify(msg));
      }       
    }
  },
  
  initTournamentLobbyMenu: () => {
    var ctrls = [];
    menuRenderer.menus[MenuStates.TournamentLobbyMenu] = ctrls;
    ctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark"));
    ctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.51, y: 0.815}, Control.Sizes["Narrow"], "Start", 30, "dark"));
    ctrls.push(new LobbyScreen('img/sm_screentall.png', {x: 0.125, y: 0.07}, {x: 0.75, y: 0.7}));
    ctrls[0].clicked = () => { 
      menuRenderer.state = MenuStates.NewTournamentMenu; 
    };
    ctrls[1].clicked = () => { 
      
    };
  },
  initTeamMenu: () => {
    var tmmctrls = [];
    menuRenderer.menus[MenuStates.TeamMenu] = tmmctrls;
    tmmctrls.push(new TextBox('img/sm_txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "Team Name:", team.name, 28, "dark"));
    tmmctrls[0].emptyInputAlternate = getNewTeamName;
    tmmctrls.push(new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.33}, Control.Sizes["Wide"], "Formations", 30, "dark"));
    tmmctrls.push(new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.20}, Control.Sizes["Wide"], "Players", 30, "dark"));
    tmmctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark"));
    tmmctrls.push(new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.46}, Control.Sizes["Wide"], "Tactics", 30, "dark"));
    tmmctrls[0].changed = (oldval, newval) => {
	    //var playersScreen = menuRenderer.menus[MenuStates.PlayersMenu][2];
    	team.name = newval;
    	//playersScreen.updateText();
    	saveTeam();
    }
    tmmctrls[1].clicked = () => { 
    	menuRenderer.state = MenuStates.FormationsMenu; 
    	menuRenderer.renderScreen = false;
		};
    tmmctrls[2].clicked = () => { 
    	menuRenderer.state = MenuStates.PlayersMenu; 
    	menuRenderer.renderScreen = true;
		};
    tmmctrls[3].clicked = () => { menuRenderer.state = MenuStates.MainMenu; };
  },
  initFormationsMenu: () => {
  	var ctrls = [];
    menuRenderer.menus[MenuStates.FormationsMenu] = ctrls;
		
  	var backBtn = new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark");
    ctrls.push(backBtn);
    backBtn.clicked = () => { 
    	menuRenderer.state = MenuStates.TeamMenu; 
    }
    var newBtn = new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.51, y: 0.815}, Control.Sizes["Narrow"], "New", 30, "dark");
    ctrls.push(newBtn);
    newBtn.clicked = () => { 
    	if (team.formations.length<6){
		  	var newFormation = { 
					name: "New formation", 
					positions: defaultPositions['Balanced'] 
				}
				team.formations.push(newFormation);
				saveTeam();
			  menuRenderer.initFormationsMenu();
			  gameRenderer.initFormationsMenu();
    	}
			
    }
    var counter = 0;
    for (formationIndex in team.formations){
    	var formation = team.formations[formationIndex];
    	var formationButton = new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.060+0.126*counter}, Control.Sizes["Wide"], formation.name, 30, "dark");
    	formationButton.formationIndex = formationIndex;
    	formationButton.clicked = (sender) => {
    		this.selectedFormation = sender.formationIndex;
    		menuRenderer.state = MenuStates.FormationMenu; 
    		menuRenderer.menus[MenuStates.FormationMenu][0].value = team.formations[sender.formationIndex].name; 
    	}
    	ctrls.push(formationButton);
    	counter++;
    }
  },
  initFormationMenu: () => {
  	var ctrls = [];
    menuRenderer.menus[MenuStates.FormationMenu] = ctrls;
    ctrls.push(new TextBox('img/sm_txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "Formation Name:", "Formation Name", 30, "dark"));
    ctrls.push(new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.20}, Control.Sizes["Wide"], "Places", 30, "dark"));
    ctrls[0].changed = (oldValue, newValue) => {      
	    team.formations[this.selectedFormation].name = newValue;
	    saveTeam();
	    menuRenderer.initFormationsMenu();
	    gameRenderer.initFormationsMenu();
    };
    ctrls[1].clicked = () => {      
	    menuRenderer.state = MenuStates.PlacesMenu;
	    var formation = team.formations[this.selectedFormation];
		  var placesControls = menuRenderer.menus[MenuStates.PlacesMenu];
		  for (placesControlIndex in placesControls){
		  	placesControls[placesControlIndex].switchValue = false;
		  }
		  for (formationIndex in formation.positions){
		  	var placeIndex = formation.positions[formationIndex];
		  	placesControls[placeIndex].switchValue = true;
		  }
    };
    var backBtn = new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark");
    ctrls.push(backBtn);
    backBtn.clicked = () => { 
    	menuRenderer.state = MenuStates.FormationsMenu; 
    	menuRenderer.initFormationsMenu();
    	gameRenderer.initFormationsMenu();
    }
  },
  initPlacesMenu: () => {
    var ctrls = [];
    menuRenderer.menus[MenuStates.PlacesMenu] = ctrls;
    
    for (placeIndex in places){
    	var place = places[placeIndex];
		  var size = Control.Sizes["Small"];
		  var pos = {x: 0.5-size.x/2 +place.x/1000 , y: 0.38-size.y/2+-place.y/2000};
		  var placeSwitch = new Button('img/swbtn.png', 'img/swbtnpressed.png', pos, Control.Sizes["Small"], "", 30, "dark");
		  placeSwitch.isSwitch = true;
		  placeSwitch.placeIndex = placeIndex;
		  placeSwitch.clicked = (sender) => {
		  	positions = team.formations[this.selectedFormation].positions;
		  	if (sender.switchValue){
		  		
		  		var posIndex = positions.indexOf(parseInt(sender.placeIndex));
		  		positions.splice(posIndex, 1);

		  	} else {
					if (positions.length >= playerCount){
						var removedIndex = positions.pop();
						menuRenderer.menus[MenuStates.PlacesMenu][removedIndex].switchValue = false;
					}	
					positions.push(parseInt(sender.placeIndex));
		  	}
	  		console.log(positions.length);		  	
		  	ctrls[places.length+2].value = (playerCount-positions.length).toString()+ "/" + playerCount;
		  }
		  ctrls.push(placeSwitch);
		  
    }
    
    var backBtn = new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark");
    ctrls.push(backBtn);
    var saveBtn = new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.51, y: 0.815}, Control.Sizes["Narrow"], "Save", 30, "dark");
    ctrls.push(saveBtn);
    var placesCountTextbox = new TextBox('img/txtbxnarrow.png', {x: 0.325, y: 0.24}, Control.Sizes["Narrow"], "Places:", "0/8", 30, "dark");
    ctrls.push(placesCountTextbox);            
    backBtn.clicked = () => { 
    	menuRenderer.state = MenuStates.FormationMenu;     	
    }
    saveBtn.clicked = () => {
    	saveTeam();
    }
  },
  initManagerMenu: () => {
  	var ctrls = [];
  	menuRenderer.menus[MenuStates.TeamManagerMenu] = ctrls;
  	var backBtn = new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark");
    ctrls.push(backBtn);
    var doneBtn = new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.51, y: 0.815}, Control.Sizes["Narrow"], "Done", 30, "dark");
    ctrls.push(doneBtn);
    ctrls.push(new ManagerScreen('img/sm_screentall.png', {x: 0.125, y: 0.07}, {x: 0.75, y: 0.7}));
  	backBtn.clicked = () => {
  		menuRenderer.renderScreen = false;
  		menuRenderer.state = MenuStates.SingleFightMenu; 
      menuRenderer.tournament.ws.close();
      menuRenderer.tournament.ws = null;
  	}
  	doneBtn.clicked = () => {
  		menuRenderer.tournament.onDoneClicked();
  	}
  },
  initSetupMenu: () => {
    var stpmctrls = [];
    menuRenderer.menus[MenuStates.SetupMenu] = stpmctrls;
    stpmctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark"));
    stpmctrls[0].clicked = () => { 
    	menuRenderer.state = MenuStates.MainMenu; 
    };
  },
  initGameOverMenu: () => {
    var gomctrls = [];
    menuRenderer.menus[MenuStates.GameOverMenu] = gomctrls;
    var doneBtn = new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.3, y: 0.3}, Control.Sizes["Narrow"], "Done", 30, "dark");
    var winnerTextbox = new TextBox('img/sm_txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "The Winner:", {name: "winner"}, 30, "dark");
    gomctrls.push(winnerTextbox);
    gomctrls.push(doneBtn);
    winnerTextbox.editable = false;
    doneBtn.clicked = () => { 
    	if (menuRenderer.tournament.gameType === GameTypes.SingleMatch){
    		menuRenderer.state = MenuStates.TeamManagerMenu; 
    		menuRenderer.renderScreen = true;
    	} else {
	    	menuRenderer.state = MenuStates.MainMenu; 
    	}    	
    }
  },
  initPlayersMenu: () => {
    var ctrls = [];
    menuRenderer.screen = true;
    menuRenderer.menus[MenuStates.PlayersMenu] = ctrls;
    ctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark"));
    ctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.51, y: 0.815}, Control.Sizes["Narrow"], "Edit", 30, "dark"));
    ctrls.push(new PlayersScreen('img/sm_screentall.png', {x: 0.125, y: 0.07}, {x: 0.75, y: 0.7}));
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
      menuRenderer.menus[MenuStates.PlayerEditMenu][4].value = team.players[playersScreen.currentPlayerIndex].age.toString();
      menuRenderer.menus[MenuStates.PlayerEditMenu][6].value = team.players[playersScreen.currentPlayerIndex].motto;
    };
    
  },
  initPlayerEditMenu: () => {
    var ctrls = [];
    menuRenderer.menus[MenuStates.PlayerEditMenu] = ctrls;

    ctrls.push(new Button('img/sm_nbtn.png', 'img/sm_nbtnpress.png', {x: 0.125, y: 0.815}, Control.Sizes["Narrow"], "Back", 30, "dark"));
    ctrls[0].clicked = () => { 
    	menuRenderer.state = MenuStates.PlayersMenu; 
    	menuRenderer.renderScreen = true;
    };
    ctrls.push(new TextBox('img/sm_txtbx.png', {x: 0.125, y: 0.07}, Control.Sizes["Wide"], "First Name:", "First name", 30, "dark"));
    ctrls.push(new TextBox('img/sm_txtbx.png', {x: 0.125, y: 0.20}, Control.Sizes["Wide"], "Last Name:", "Last name", 30, "dark"));
    ctrls.push(new TextBox('img/txtbxnarrow.png', {x: 0.125, y: 0.33}, Control.Sizes["Narrow"], "Gender:", "playerGender", 30, "dark"));
    ctrls.push(new TextBox('img/txtbxnarrow.png', {x: 0.51, y: 0.33}, Control.Sizes["Narrow"], "Age:", "20", 30));
    ctrls.push(new Button('img/sm_wbtn.png', 'img/sm_wbtnpress.png', {x: 0.125, y: 0.59}, Control.Sizes["Wide"], "Picture", 30, "dark"));
    ctrls.push(new TextBox('img/sm_txtbx.png', {x: 0.125, y: 0.46}, Control.Sizes["Wide"], "Motto:", "Motto", 30, "dark"));
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
    ctrls[4].changed = (oldval, newval) => {
	    var playersScreen = menuRenderer.menus[MenuStates.PlayersMenu][2];
    	team.players[playersScreen.currentPlayerIndex].age = newval;
    	playersScreen.updateText();
    	saveTeam();
    }
    ctrls[5].clicked = () => { 
    	playerRenderer.setRenderer(); 
    	var playersScreen = menuRenderer.menus[MenuStates.PlayersMenu][2];
    	playerRenderer.playerImage = playersScreen.imgs[playersScreen.currentPlayerIndex];
    }
    ctrls[6].changed = (oldval, newval) => { 
    	var playersScreen = menuRenderer.menus[MenuStates.PlayersMenu][2];
    	team.players[playersScreen.currentPlayerIndex].motto = newval;
    	playersScreen.updateText();
    	saveTeam();
    }
  },
  ctrls: () => {
    return menuRenderer.menus[menuRenderer.state];
  },  
  connectTournament: (id, destinationMenu, gameType) => {
    localStorage.setItem("playerCount", 0);
    localStorage.setItem("poolSize", 4);
    menuRenderer.tournament.ws = new WebSocket("wss://" + location.host);
    menuRenderer.tournament.ws.onopen = function()
    {
      var msg = {
        t: MsgTypes.TournamentConnection, 
        teamName: localStorage.teamName,
        tournamentID: id,
        gameType: gameType
      }
      menuRenderer.tournament.ws.send(JSON.stringify(msg));
      console.log("Connection request is sent...");
      menuRenderer.tournament.connected = true;
      menuRenderer.state = destinationMenu;
      if (destinationMenu === MenuStates.TeamManagerMenu){
      	menuRenderer.renderScreen = true;
      }
    }
    menuRenderer.tournament.ws.onmessage = menuRenderer.tournament.onmessage;
    menuRenderer.tournament.ws.onclose = (evt) => {        
      menuRenderer.tournament.onclose();  
      if (evt.srcElement===menuRenderer.tournament.ws){ 
        // This indicates that the current tournament connection was closed
        menuRenderer.tournament.ws = null;
        menuRenderer.state = MenuStates.MainMenu;
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
