
var frontImageMask = new Image();

var playerImageLoaded = function() {
	this.removeEventListener("load", playerImageLoaded);
	var c = Filters.getCanvas(frontImageMask.width, frontImageMask.width);
	var context = c.getContext('2d'); 
	context.drawImage(this, 0, 0, c.width, c.width);
	var imageData = context.getImageData(0, 0, c.width, c.width);
	var alphaMaskPixels = Filters.getPixels(frontImageMask, {x: c.width, y: c.width});			
	Filters.addAlphaMask(imageData, alphaMaskPixels);
	context.putImageData(imageData, 0, 0); 
	this.src = c.toDataURL('image/png');
}
	

var PlayersScreen = function (surfaceimg, loc, size){    
  Screen.call(this, surfaceimg, loc, size);
  this.currentPlayerIndex = 0;
  this.moveDistance = 0;
  this.moveSpeed = 0;
  this.releaseAudio = new GameAudio("snd/btnRelease.wav", false);
	
	this.frontImageMaskLoaded = () => {
		//console.log("frontImageMaskLoaded");
		for (var i = 0; i < playerCount; i++){
			pl = team.players[i];
			var img = new Image();
			if (pl.imageData!=null){
				img.addEventListener('load', playerImageLoaded);
				img.src = pl.imageData;				
		
			} else {
				img.src = "img/default.png";	
			}
			playerImages.push(img);
		}
	}
	
	frontImageMask.addEventListener('load', this.frontImageMaskLoaded);
  frontImageMask.src = localStorage.frontImageMask;
	
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
  	ctx.drawImage(playerImages[this.currentPlayerIndex], loc.x + 20*scale + offset, loc.y + 20*scale, 268*scale, 268*scale);  
  	  	
  }
  this.renderText = (size, loc) => {
    for (var i = 0; i < this.texts.length; i++){
      var text = this.texts[i].caption + ": " + this.texts[i].text;
      var height = this.texts[i].height;
      var font = this.texts[i].font;
      var pos = this.texts[i].pos;
      var x = pos.x * size.x; 
      var y = pos.y * size.y;
      x += loc.x + 20*scale;
      y += loc.y + 20*scale;
      ctx.font = height*scale + "px " + font;
      
      ctx.fillStyle="#afc";
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

