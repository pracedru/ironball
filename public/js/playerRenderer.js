
PlayerRendererStates = {
  ImageShow: 0,
  ImageEdit: 1
};

var cameraImage = new Image();
var imageDataOriginal = null;
var imageDataManipulated = null;


function pictureTaken(input) {
  console.log("Picture taken!!");
        
  var reader = new FileReader();
  reader.onload = function (e) {          
    console.log("image from camera loaded");
    cameraImage.src =  e.target.result;
    cameraImage.onload = () => {
      playerRenderer.state = PlayerRendererStates.ImageEdit;
    };          
  };
  reader.readAsDataURL(input.files[0]);
}

var playerRenderer = {
  state: PlayerRendererStates.ImageShow,
  init: () => {
    playerRenderer.initAV();    
  },
  initAV: () => {
    playerRenderer.lastTouch = { x: 0, y: 0 };
    playerRenderer.deltaTouch = { x: 0, y: 0 };
    playerRenderer.pinchTouch = { x: 0, y: 0 };
    playerRenderer.pos = { x: 0, y: 0 };
    playerRenderer.scale = 1;
    playerRenderer.state = PlayerRendererStates.ImageShow;
    playerRenderer.transforming = false;
    playerRenderer.imageTransformed = true;
    playerRenderer.contrast = 1;
    playerRenderer.saturation = 0;
    playerRenderer.angle = 0;
    playerRenderer.brightness = {r: 0, g: 0, b:0};       
    playerRenderer.frontImage = new Image();
    playerRenderer.frontImage.src = "img/playerFaceFront.png";
    playerRenderer.frontImageMask = new Image();
    playerRenderer.frontImageMask.src = "img/playerFaceFrontMask.png";
    playerRenderer.frontImageClip = new Image();
    playerRenderer.frontImageClip.src = "img/playerFaceFrontClip.png";
    playerRenderer.adjusterImage = new Image();
    playerRenderer.adjusterImage.src = "img/adjuster.png";
    playerRenderer.playerImage = new Image();
    playerRenderer.menuCtrls = {};
    playerRenderer.backBtn = new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.80}, Control.Sizes["Narrow"], "Back", 35, "blue");
    playerRenderer.camBtn = new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.51, y: 0.80}, Control.Sizes["Narrow"], "Cam", 35, "blue");
    playerRenderer.fileBtn = new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.51, y: 0.64}, Control.Sizes["Narrow"], "File", 35, "blue");
    playerRenderer.saveBtn = new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.125, y: 0.64}, Control.Sizes["Narrow"], "Save", 35, "blue");
    playerRenderer.doneBtn = new Button('img/nbtn.png', 'img/nbtnpress.png', {x: 0.03, y: 0.01}, Control.Sizes["Narrow"], "Done", 35, "blue");
    playerRenderer.backBtn.clicked = () => { menuRenderer.setRenderer(); };
    playerRenderer.camBtn.clicked = () => { 
      var cameraInput = document.getElementById('cameraInput');
      cameraInput.click();
    }
    playerRenderer.fileBtn.clicked = () => {
      var fileInput = document.getElementById('fileInput');
      fileInput.click();
    }
    
    playerRenderer.doneBtn.clicked = () => {
      var alphaMaskPixels = Filters.getPixels(playerRenderer.frontImageMask, {x: canvas.width, y: canvas.width});
      Filters.addAlphaMask(imageDataManipulated, alphaMaskPixels);
      var c = Filters.getCanvas(canvas.width, canvas.width);
      var context = c.getContext('2d');            
      context.putImageData(imageDataManipulated, 0, 0);      
      context.drawImage(playerRenderer.frontImage, 0, 0, canvas.width, canvas.width);
      playerRenderer.playerImage = new Image();
      playerRenderer.playerImage.src = c.toDataURL('image/png');
      playerRenderer.state = PlayerRendererStates.ImageShow;
    }

    playerRenderer.saveBtn.clicked = () => {
    	var playersScreen = menuRenderer.menus[MenuStates.PlayersMenu][2];
    	playersScreen.imgs[playersScreen.currentPlayerIndex] = playerRenderer.playerImage;
    	team.players[playersScreen.currentPlayerIndex].imageData = Filters.toBase64(playerRenderer.playerImage);
    	saveTeam();
    }
    
    var ctrls = [];
    playerRenderer.menuCtrls[PlayerRendererStates.ImageShow] = ctrls;
    ctrls.push(playerRenderer.backBtn);
    ctrls.push(playerRenderer.camBtn);
    ctrls.push(playerRenderer.fileBtn);
    ctrls.push(playerRenderer.saveBtn);
    
    ctrls = [];
    playerRenderer.menuCtrls[PlayerRendererStates.ImageEdit] = ctrls;
    ctrls.push(playerRenderer.doneBtn);
  },
  
  update: () => {
    
  },
  render: () => {
    ctx.fillStyle="black";
    ctx.fillRect ( 0 , 0 , canvas.width , canvas.height );
    var playerIndex = localStorage.playerIndex;
    switch(playerRenderer.state){
      case PlayerRendererStates.ImageShow:
        ctx.drawImage(playerRenderer.playerImage, 0, 0, canvas.width, canvas.width);        
        break;
      case PlayerRendererStates.ImageEdit:
        ctx.save();
        ctx.rotate(playerRenderer.angle);
        ctx.translate(playerRenderer.pos.x, playerRenderer.pos.y);
        ctx.scale(playerRenderer.scale, playerRenderer.scale);
        var ratio = cameraImage.height/cameraImage.width;
        if(playerRenderer.imageTransformed){
          ctx.drawImage(cameraImage, 0, 0, canvas.width, canvas.width*ratio);
        } else {
          if (imageDataManipulated !== null);{
            ctx.putImageData(imageDataManipulated, 0, 0);
          }
        }
        ctx.restore();
        ctx.fillStyle="black";
        ctx.fillRect ( 0 , canvas.width , canvas.width , canvas.height );
        ctx.drawImage(playerRenderer.frontImageClip, 0, 0, canvas.width, canvas.width);
        ctx.drawImage(playerRenderer.frontImage, 0, 0, canvas.width, canvas.width);
        
        ctx.drawImage(playerRenderer.adjusterImage, 0, canvas.width, canvas.width, canvas.height - canvas.width);
        
        break;        
    }    
    ctrls = playerRenderer.ctrls();
    for (var i = 0; i< playerRenderer.ctrls().length; i++){
      var ctrl = playerRenderer.ctrls()[i];
      ctrl.render();
    }
  },
  renderImage: () => {
    
  },
  
  ctrls: () => { 
    return playerRenderer.menuCtrls[playerRenderer.state];
  },
  
  getImageData: () => {
    playerRenderer.imageTransformed = false;
    var context = Filters.getCanvas(canvas.width, canvas.width).getContext('2d');;
    context.save();
    context.rotate(playerRenderer.angle);
    context.translate(playerRenderer.pos.x, playerRenderer.pos.y);
    context.scale(playerRenderer.scale, playerRenderer.scale);
    var ratio = cameraImage.height/cameraImage.width;
    context.drawImage(cameraImage, 0, 0, canvas.width, canvas.width*ratio);    
    context.restore();    
    imageDataOriginal = context.getImageData(0, 0, canvas.width, canvas.width);
    imageDataManipulated = context.getImageData(0, 0, canvas.width, canvas.width);
    Filters.contrast(imageDataOriginal, playerRenderer.contrast, playerRenderer.saturation, imageDataManipulated);
    Filters.brightnessRGB(imageDataManipulated, playerRenderer.brightness);    
    console.log("image data gotten");
  },
  
  touchStart: (e)=>{
    e.preventDefault();
    var touch = null;
		if(e.touches == undefined){
		  for (var i = 0; i< menuRenderer.ctrls().length; i++){
		    touch = e;
		    e.touches = [];
		  }     
		} else {
			touch = e.touches[e.which];  	  
		}
    var buttonPressed = false;
    for (var i = 0; i< playerRenderer.ctrls().length; i++){
      var ctrl = playerRenderer.ctrls()[i];
      
      if (ctrl.inside({x: touch.clientX, y: touch.clientY})){
        if (ctrl.pressed === false){
          ctrl.pressed = true;
          buttonPressed = true;
          ctrl.pressAudio.play();
          if (navigator.vibrate){            
            navigator.vibrate(25);            
          }
        }
      } else {
        if (ctrl.pressed === true){
          ctrl.pressed = false;
          ctrl.releaseAudio.play();
        }
      }
    }    
    
    if (e.touches.length>1){
      var t1 = e.touches[0];
      var t2 = e.touches[1];
      playerRenderer.pinchTouch.x = t2.clientX - t1.clientX;
      playerRenderer.pinchTouch.y = t2.clientY - t1.clientY;
    } else {
      if (touch.clientY < canvas.width && !buttonPressed){
        playerRenderer.transforming = true;
      }
    }    
    playerRenderer.lastTouch.x = touch.clientX;
    playerRenderer.lastTouch.y = touch.clientY;
  },

  touchMove: (e)=>{
    e.preventDefault();
    var touch = null;
		if(e.touches == undefined){
		  for (var i = 0; i< menuRenderer.ctrls().length; i++){
			  if (e.buttons == 0){ return; }
		    touch = e;
		    e.touches = [];
		  }     
		} else {
			touch = e.touches[e.which];  	  
		}
    var x = touch.clientX;
    var y = touch.clientY;
    playerRenderer.deltaTouch.x = touch.clientX - playerRenderer.lastTouch.x;
    playerRenderer.deltaTouch.y = touch.clientY - playerRenderer.lastTouch.y;
    playerRenderer.lastTouch.x = touch.clientX;
    playerRenderer.lastTouch.y = touch.clientY;
    var buttonPressed = false;
    
    for (var i = 0; i< playerRenderer.ctrls().length; i++){
      var ctrl = playerRenderer.ctrls()[i];      
      if (ctrl.inside({x: touch.clientX, y: touch.clientY})){
        buttonPressed = true;
        if (ctrl.pressed === false){
          ctrl.pressed = true;          
          ctrl.pressAudio.play();
        }
      } else {
        if (ctrl.pressed === true){
          ctrl.pressed = false;
          ctrl.releaseAudio.play();
        }
      }
    }
    
    if (playerRenderer.transforming){
      playerRenderer.pos.x += playerRenderer.deltaTouch.x;
      playerRenderer.pos.y += playerRenderer.deltaTouch.y;
      playerRenderer.imageTransformed = true;
    } else if (!buttonPressed) {
      if (playerRenderer.imageTransformed){
        playerRenderer.getImageData();        
      }
      if (e.touches.length>1){
        var t1 = e.touches[0];
        var t2 = e.touches[1];
        var dx = t2.clientX - t1.clientX;
        var dy = t2.clientY - t1.clientY;
        var odx = playerRenderer.pinchTouch.x;
        var ody = playerRenderer.pinchTouch.y;
        var oldDist = Math.sqrt(odx*odx+ody*ody);
        var newDist = Math.sqrt(dx*dx+dy*dy);
        playerRenderer.brightness.r += playerRenderer.deltaTouch.x*0.5;
        playerRenderer.brightness.b += playerRenderer.deltaTouch.y*0.5;
      } else {
        playerRenderer.brightness.r += playerRenderer.deltaTouch.x*0.5;
        playerRenderer.brightness.g += playerRenderer.deltaTouch.x*0.5;
        playerRenderer.brightness.b += playerRenderer.deltaTouch.x*0.5;
        playerRenderer.contrast += playerRenderer.deltaTouch.y*0.01;
        playerRenderer.contrast = Math.max(0, playerRenderer.contrast);
        playerRenderer.contrast = Math.min(3, playerRenderer.contrast);
      }
      Filters.contrast(imageDataOriginal, playerRenderer.contrast, playerRenderer.saturation, imageDataManipulated);
      Filters.brightnessRGB(imageDataManipulated, playerRenderer.brightness);               
    }
    if (e.touches.length>1){
      var t1 = e.touches[0];
      var t2 = e.touches[1];
      var dx = t2.clientX - t1.clientX;
      var dy = t2.clientY - t1.clientY;
      var odx = playerRenderer.pinchTouch.x;
      var ody = playerRenderer.pinchTouch.y;
      var oldDist = Math.sqrt(odx*odx+ody*ody);
      var newDist = Math.sqrt(dx*dx+dy*dy);
      var pivot = {x: t1.clientX + dx/2, y: t1.clientY + dy/2 };
      var dxpivot = playerRenderer.pos.x - pivot.x;
      var dypivot = playerRenderer.pos.y - pivot.y;
      
      if (playerRenderer.transforming){
        playerRenderer.scale *= newDist/oldDist;

        playerRenderer.pos.x += dxpivot*newDist/oldDist-dxpivot;
        playerRenderer.pos.y += dypivot*newDist/oldDist-dypivot;      
        playerRenderer.imageTransformed = true;
        var pdx = playerRenderer.pinchTouch.x;
        var pdy = playerRenderer.pinchTouch.y;
        var oldAngle = Math.atan2(pdy, pdx);
        var newAngle = Math.atan2(dy, dx);
        playerRenderer.angle += newAngle - oldAngle;
      } 
      
      playerRenderer.pinchTouch.x = dx;
      playerRenderer.pinchTouch.y = dy;
    } else if(e.buttons) {
    	console.log(JSON.stringify(e.buttons));
    }
  }, 
  touchEnd: (e)=>{
    e.preventDefault();
    var touch = null;
		if(e.touches == undefined){
		  for (var i = 0; i< menuRenderer.ctrls().length; i++){
		    touch = e;
		    e.touches = [];
		  }     
		} else {
			touch = e.touches[e.which];  	  
		}
    if (e.touches.length<1){
      if (playerRenderer.transforming){
        playerRenderer.transforming = false;      
        playerRenderer.getImageData();        
      }      
    }
    
    for (var i = 0; i< playerRenderer.ctrls().length; i++){
      var ctrl = playerRenderer.ctrls()[i];

      if (ctrl.pressed === true){
        ctrl.pressed = false;
        ctrl.releaseAudio.play();
        ctrl.clicked();
      }
    }
  },
  
  setRenderer: () => {
    history.pushState({state: "playerRenderer"}, "game", "index.html");
    if (currentRenderer !== undefined && currentRenderer !== null){
      currentRenderer.unsetRenderer();
    }
    canvas.addEventListener("touchstart", playerRenderer.touchStart, false);
    canvas.addEventListener("touchmove", playerRenderer.touchMove, false);
    canvas.addEventListener("touchend", playerRenderer.touchEnd, false);  
    
    
    canvas.addEventListener("mousedown", playerRenderer.touchStart, false); 
    canvas.addEventListener("mouseup", playerRenderer.touchEnd, false);   
    canvas.addEventListener("mousemove", playerRenderer.touchMove, false);    
    
    currentRenderer = playerRenderer;    
  },
  unsetRenderer: () => {
    canvas.removeEventListener("touchstart", playerRenderer.touchStart);
    canvas.removeEventListener("touchmove", playerRenderer.touchMove);
    canvas.removeEventListener("touchend", playerRenderer.touchEnd);    
    
    canvas.removeEventListener("mousedown", playerRenderer.touchStart); 
    canvas.removeEventListener("mouseup", playerRenderer.touchEnd);   
    canvas.removeEventListener("mousemove", playerRenderer.touchMove); 
    
    currentRenderer = null;    
  }
};


