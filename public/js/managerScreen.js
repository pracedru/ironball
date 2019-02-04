var ManagerScreen = function (surfaceimg, loc, size){    
  Screen.call(this, surfaceimg, loc, size)
  this.currentPlayerIndex = 0;
  this.imgs = [];
  this.texts = [];
  this.moveDistance = 0;
  this.moveSpeed = 0;
  this.credit = 100;
  this.selectedDiscipline = PickupItemType.ThrowUpgrade;
  this.releaseAudio = new GameAudio("snd/btnRelease.wav", false);
  this.kachingAudio = new GameAudio("snd/kaching.wav", false);
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
		if (menuRenderer.tournament.team === null) return;
		var upgrade = menuRenderer.tournament.team.upgrades[this.currentPlayerIndex];
		this.texts = [];
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.40}, caption: "Credit", text: this.credit.toString(), height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.50}, caption: "Name", text: pl.firstName + ' ' + pl.lastName, height: 20});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.55}, caption: "Speed", value: upgrade[PickupItemType.SpeedUpgrade], height: 20, type: PickupItemType.SpeedUpgrade});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.60}, caption: "Throw", value: upgrade[PickupItemType.ThrowUpgrade], height: 20, type: PickupItemType.ThrowUpgrade});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.65}, caption: "Stammina", value: upgrade[PickupItemType.StamminaUpgrade], height: 20, type: PickupItemType.StamminaUpgrade});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.70}, caption: "Accel.", value: upgrade[PickupItemType.AccelerationUpgrade], height: 20, type: PickupItemType.AccelerationUpgrade});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.75}, caption: "Kick", value: upgrade[PickupItemType.KickUpgrade], height: 20, type: PickupItemType.KickUpgrade});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.80}, caption: "Intell.", value: upgrade[PickupItemType.IntelligenceUpgrade], height: 20, type: PickupItemType.IntelligenceUpgrade});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.85}, caption: "Endur.",  value: upgrade[PickupItemType.EnduranceUpgrade], height: 20, type: PickupItemType.EnduranceUpgrade});
		this.texts.push({ font: "monospace", pos: {x: 0, y: 0.90}, caption: "Health", value: upgrade[PickupItemType.HealthUpgrade], height: 20, type: PickupItemType.HealthUpgrade});
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
      else{
      	var text = this.texts[i].caption; // + ": " + this.texts[i].value;	
      }
      
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
      
      if (this.selectedDiscipline===this.texts[i].type){
      	//console.log(Object.keys(PickupItemType)[this.selectedDiscipline])
      	ctx.fillText("-->", + 20*scale+size.x/2, y);
      }
      
      if (this.texts[i].text === undefined){
      	y += 5*scale;
      	ctx.beginPath();
      	ctx.fillStyle="#987";
      	var fillWidth = size.x/2; //this.texts[i].value
      	ctx.rect(x+size.x/2, y, fillWidth, -height*scale);
      	ctx.fill();
      	ctx.beginPath();
      	ctx.fillStyle="#fec";
      	fillWidth *= this.texts[i].value/300;
      	ctx.rect(x+size.x/2, y, fillWidth, -height*scale);
      	ctx.fill();
      }
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
  this.touchStart = (loc) => {
  	var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
  	
  	relpos = (loc.y - this.loc.y*canvas.height-5*scale)/size.y;
  	if (relpos > 1) return;
  	for (i in this.texts){
  		var text = this.texts[i];
  		var height = 1.5*text.height*scale/canvas.height;
  		if (relpos > text.pos.y && relpos < text.pos.y + height){
  		
  			if (this.selectedDiscipline === text.type){
  				var msg = {
  					t: MsgTypes.PlayerUpgrade,
  					pi: this.currentPlayerIndex,
  					ut: text.type
  				}
  				menuRenderer.tournament.ws.send(JSON.stringify(msg));
  			} else{
  				this.selectedDiscipline = text.type;
  				gameRenderer.pickupAudio.volume = 1;
  				gameRenderer.pickupAudio.play();
  			}
  		}
  	}

  }
  this.moved = (loc, delta) => {   	
  	if(loc.y < canvas.height/3){
  		this.moveDistance += delta.x;
			this.moveSpeed = delta.x;
			this.updatePlayerIndex();
  	}
  	
  }
}
