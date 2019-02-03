var ManagerScreen = function (surfaceimg, loc, size){    
  Screen.call(this, surfaceimg, loc, size)
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
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.50}, caption: "Name", text: pl.firstName + ' ' + pl.lastName, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.55}, caption: "Speed", value: 100, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.60}, caption: "Throw", value: 100, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.65}, caption: "Stammina", value: 100, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.70}, caption: "Accel.", value: 100, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.75}, caption: "Kick", value: 100, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.80}, caption: "Intell.", value: 100, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.85}, caption: "Endur.",  value: 100, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.90}, caption: "Health", value: 100, height: 20});
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
  	ctx.drawImage(this.imgs[this.currentPlayerIndex], loc.x + size.x/2-size.y/6 + offset, loc.y + 20*scale, size.y/3, size.y/3);  
  	  
  }
  this.renderText = (size, loc) => {
    for (var i = 0; i < this.texts.length; i++){
    	if (this.texts[i].text !== undefined)
      	var text = this.texts[i].caption + ": " + this.texts[i].text;
      else
      	var text = this.texts[i].caption + ": " + this.texts[i].value;
      var height = this.texts[i].height;
      var font = this.texts[i].font;
      var pos = this.texts[i].pos;
      var x = pos.x * size.x; 
      var y = pos.y * size.y;
      x += loc.x + 20*scale;
      y += loc.y + 20*scale;
      ctx.font = height*scale + "px " + font;
      
      ctx.fillStyle="#fec";
      ctx.textAlign="start"; 
      ctx.fillText(text, x, y);
    }  
  }
  this.released = () => { 
  	
  }
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
  }
  this.moved = (loc, delta) => {   	
  	this.moveDistance += delta.x;
  	this.moveSpeed = delta.x;
  	this.updatePlayerIndex();
  }
}
