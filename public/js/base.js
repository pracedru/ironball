/* global aCtx, ctx, scale, canvas */

isClient = true;

var Base = {};
Base.renderText = (txt, loc, size = 30, fill = "#000", stroke = null, strokeWidth = scale, font = "sans") => {
  ctx.textAlign = "center";
  ctx.font= size + "px " + font;
  ctx.fillStyle=fill;
  ctx.fillText(txt,loc.x,loc.y);
  if (stroke !== null){
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = stroke;
    ctx.strokeText(txt,loc.x,loc.y);
  }
};
var audioBuffers = {};

function GameAudio(path, loop = false){
  this.gain = aCtx.createGain();
  //targetAudio.source.connect(targetAudio.gain);
  this.gain.connect(aCtx.destination);
  this.loop = loop;
  this.volume = 1;
  this.pbr = 1;
  var request = new XMLHttpRequest();
  
  
  //console.log("before buffer load");
  this.play = () => {
    this.source = aCtx.createBufferSource();
    this.source.buffer = audioBuffers[this.path];
    this.source.connect(this.gain);
    //this.gain.connect(aCtx.destination);
    this.gain.gain.value = this.volume;
    this.source.loop = this.loop;
    this.source.playbackRate.value = this.pbr;
    this.source.start(0);
  };

  this.stop = () => {
    this.source.stop();
  };
  
  var ga = this;
  this.path = path;
  if (!(path in audioBuffers)){
    audioBuffers[path] = null;
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      aCtx.decodeAudioData(request.response, function(buffer) {
        audioBuffers[ga.path] = buffer;        
      });
    };
    request.send();
  }  
}

var Control = function(loc, size){
  this.isScreen = false;
  this.pressAudio = null;
  this.releaseAudio = null;
  this.loc = {x: 0, y:0};
  this.loc.x = loc.x;
  this.loc.y = loc.y;
  this.size = {x: 0, y:0};
  this.size.x = size.x;
  this.size.y = size.y;
  this.enabled = true;
  this.pressed = false;
  this.clicked = (loc) => { /*console.log("dud control clicked: " + JSON.stringify(loc));*/ };  
  this.released = () => { /*console.log("dud control released")*/ };
  this.moved = (loc, delta) => { /*console.log("dud control moved")*/ };
  this.render = () => { /*console.log("nothing to render")*/ };
  this.changed = (oldValue, newValue) => { console.log("control changed from: " + oldValue + " to: " + newValue) };
  this.lastTouchLocation = {x: 0, y:0};
  this.inside = (touchLoc) => {
    if (this.enabled){
      var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
      var loc = { x: this.loc.x * canvas.width, y: this.loc.y * canvas.height };
      if(touchLoc.x > loc.x){
        if(touchLoc.x < loc.x+size.x){
          if(touchLoc.y > loc.y){
            if(touchLoc.y < loc.y+size.y){
              return true;
            }
          }
        }
      }  
    }    
    return false;
  };  
  this.touchStart = (loc) => {
    this.lastTouchLocation.x = loc.x;
    this.lastTouchLocation.y = loc.y;
    if (this.inside(loc)){
      if (this.pressed === false){
        this.pressed = true;
        if (this.pressAudio) this.pressAudio.play();
        if (navigator.vibrate){            
          navigator.vibrate(25);            
        }
      }
    } else {
      if (this.pressed === true){
        this.pressed = false;
        if (this.releaseAudio) this.releaseAudio.play();
        this.released();
      }
    }
  };
  this.touchMove = (loc) => {
    var delta = {x: loc.x - this.lastTouchLocation.x, y: loc.y - this.lastTouchLocation.y};
    if (this.inside(loc)){
      this.moved(loc, delta);
      if (this.pressed === false){
        this.pressed = true;
        if (this.pressAudio) this.pressAudio.play();        
      }
    } else {
      if (this.pressed === true){
        this.pressed = false;
        if (this.releaseAudio) this.releaseAudio.play();
        this.released();
      }
    }
    this.lastTouchLocation.x = loc.x;
    this.lastTouchLocation.y = loc.y;
  };
  this.touchEnd = () => {
    if (this.pressed === true){
      this.pressed = false;
      if (this.releaseAudio) this.releaseAudio.play();
      this.released();
      this.clicked();
    }
  };
}

Control.Sizes = {
  Wide: {x: 0.75, y: 0.12},
  Narrow: {x: 0.365, y: 0.12}
};

var Button = function (btnimg, btnpressimg, loc, size, text = "Button", fontHeight = null, fontColor = "red"){
  Control.call(this, loc, size);
  this.pressAudio = new GameAudio("snd/btnPress.wav", false);
  this.releaseAudio = new GameAudio("snd/btnRelease.wav", false);
  this.btn = new Image();
  this.btn.src = btnpressimg;
  this.btnPress = new Image();
  this.btnPress.src = btnimg;  
  this.text = text;  
  this.fontColor = fontColor;
  this.fontColors = { red: ["#865", "#311", "#f96", "#721"], blue: ["#566", "#113", "#6ef", "#127"], black: ["#000", null, "#000", null],  dark: ["#0009", null, "#0009", null]};
  this.pressed = false;
  this.fontHeight = fontHeight === null ? this.size.y/3 : fontHeight*scale/canvas.height;  
  this.render = () => {
    if (this.enabled){
      var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
      var loc = { x: this.loc.x * canvas.width, y: this.loc.y * canvas.height };
      var fontHeight = this.fontHeight * canvas.height;
      var fc = this.fontColors[this.fontColor];
      if (this.pressed){
        fontHeight *= 0.993;
        ctx.drawImage(this.btnPress, loc.x, loc.y, size.x, size.y);
        Base.renderText(this.text,{x: loc.x+size.x/2, y: loc.y+fontHeight/3 + size.y/2}, fontHeight, fc[0], fc[1]);
      } else {
        ctx.drawImage(this.btn, loc.x, loc.y, size.x, size.y);
        Base.renderText(this.text,{x: loc.x+size.x/2, y: loc.y+fontHeight/3 + size.y/2}, fontHeight, fc[2], fc[3]);
      }
    }
  };  
  
};

var TextBox = function (txtimg, loc, size, caption = "TextBox", text = "null", fontHeight = null){
  Control.call(this, loc, size);
  this.pressAudio = new GameAudio("snd/btnPress.wav", false);
  this.releaseAudio = new GameAudio("snd/btnRelease.wav", false);
  this.txtbx = new Image();
  this.txtbx.src = txtimg;  
  this.value = text;  
  this.caption = caption;
  this.pressed = false;
  this.fontHeight = fontHeight === null ? this.size.y/3 : fontHeight*scale;
  this.editable = true;
  this.emptyInputAlternate = () => { return ""; };
  this.clicked = function(loc){     
    if (this.editable){
      modalShow(this.caption, this.getValue());
      modalAccept = () => {
        if (document.getElementById('modalInput').value === ""){
          document.getElementById('modalInput').value = this.emptyInputAlternate();
        }
        this.setValue(document.getElementById('modalInput').value);        
      };    
    }    
  };
  this.setValue = (value) => {
    var changed = false;
    var oldValue = this.getValue();
    if (typeof this.value === "string" ||  typeof this.value === "number"){
      if (this.text !== value){
        changed = true;
        this.value = value;      
      }      
    } else {
      if (localStorage.getItem(this.value.name) !== value){
        changed = true;
        localStorage.setItem(this.value.name, value);        
      }
    }  
    if (changed) this.changed(oldValue, value);
    return changed;
  };
  this.getValue = () => {
    return typeof this.value === "string" || this.value === "number" ? this.value : localStorage.getItem(this.value.name);
  };
  this.render = () => {
    var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
    var loc = { x: this.loc.x * canvas.width, y: this.loc.y * canvas.height };
    ctx.drawImage(this.txtbx, loc.x, loc.y, size.x, size.y);
    var text = this.getValue();
    Base.renderText(text,{x: loc.x+size.x/2, y: loc.y+this.fontHeight/3 + 1.8*size.y/3}, this.fontHeight, "#ac6", "#330");
    Base.renderText(this.caption,{x: loc.x+size.x/2, y: loc.y+this.fontHeight/3 + 1*size.y/4}, this.fontHeight/2, "#ac6", "#ac6");
  };  
};

var NUDBox  = function (txtimg, loc, size, caption = "TextBox", text = "null", fontHeight = null){
  TextBox.call(this, txtimg, loc, size, caption, text, fontHeight);
  this.tbRender = this.render;
  this.tbClicked = this.clicked;
  this.render = () => {
    var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
    var loc = { x: this.loc.x * canvas.width, y: this.loc.y * canvas.height };
    this.tbRender();
    var left = "◄";
    var right = "►";
    Base.renderText(left,{x: loc.x+size.x/6, y: loc.y+this.fontHeight/3 + 2*size.y/4}, this.fontHeight, "#ac6", "#ac6");
    Base.renderText(right,{x: loc.x+5*size.x/6, y: loc.y+this.fontHeight/3 + 2*size.y/4}, this.fontHeight, "#ac6", "#ac6");
  };
  this.clicked = () => {
    if (this.enabled) {
      if (this.insideCenter(this.lastTouchLocation)){
        this.tbClicked();
      } else if (this.insideLeft(this.lastTouchLocation)){        
        this.setValue(parseInt(this.getValue())-1);
      } else if (this.insideRight(this.lastTouchLocation)){                
        this.setValue(parseInt(this.getValue())+1);
      }
    }
  };
  this.insideCenter = (touchLoc) => {
    if (this.enabled){
      var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
      var loc = { x: this.loc.x * canvas.width, y: this.loc.y * canvas.height };
      if(touchLoc.x > loc.x+size.x/3){
        if(touchLoc.x < loc.x+2*size.x/3){
          if(touchLoc.y > loc.y){
            if(touchLoc.y < loc.y+size.y){
              return true;
            }
          }
        }
      }  
    }    
    return false;
  };  
  this.insideLeft = (touchLoc) => {
    if (this.enabled){
      var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
      var loc = { x: this.loc.x * canvas.width, y: this.loc.y * canvas.height };
      if(touchLoc.x > loc.x){
        if(touchLoc.x < loc.x+size.x/3){
          if(touchLoc.y > loc.y){
            if(touchLoc.y < loc.y+size.y){
              return true;
            }
          }
        }
      }  
    }    
    return false;
  };  
  this.insideRight = (touchLoc) => {
    if (this.enabled){
      var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
      var loc = { x: this.loc.x * canvas.width, y: this.loc.y * canvas.height };
      if(touchLoc.x > loc.x+2*size.x/3){
        if(touchLoc.x < loc.x+size.x){
          if(touchLoc.y > loc.y){
            if(touchLoc.y < loc.y+size.y){
              return true;
            }
          }
        }
      }  
    }    
    return false;
  };  
}

var Screen = function (surfaceimg, loc, size) {  
  Control.call(this, loc, size);
  this.surface = new Image();
  this.surface.src = surfaceimg;  
  this.isScreen = true;
   
  this.render = () => {
    var size = { x: this.size.x * canvas.width, y: this.size.y * canvas.height };
    var loc = { x: this.loc.x * canvas.width, y: this.loc.y * canvas.height };       
    ctx.drawImage(this.surface, loc.x, loc.y, size.x, size.y);    
  }
  
  this.renderContents = () =>{
  }
};


function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

var Animator = function(framePaths){
  this.frames = [];
  this.frameIndex = 0;
  this.frameRate = 30;
  this.lastFrameTimeStamp = 0;
  this.loop = false;
  this.fadeIn = false;
  this.fadeOut = false;
  this.alpha = 1;
  this.pos = {x: 0, y: 0};
  this.size = {x: 100, y: 100};
  this.finished = false;
  for (var i = 0; i < framePaths.length; i++){
    var frame = new Image();
    frame.src = framePaths[i];
    this.frames.push(frame);
  }
  this.start = () =>{
    this.frameIndex = 0;
    this.lastFrameTimeStamp = gameRenderer.currentTimeStamp;
    this.alpha = 1;
    this.finished = false;
  }
  this.update = () => {
    var deltaTime = gameRenderer.currentTimeStamp-this.lastFrameTimeStamp;
    var timeLim = 1000/this.frameRate;
    if (deltaTime > timeLim){
      this.lastFrameTimeStamp = gameRenderer.currentTimeStamp;
      this.frameIndex++;
    }
    if (!this.loop){
      if (this.frameIndex>=this.frames.length){
        if (this.fadeOut){
          this.alpha -=  0.01;
          if (this.alpha<=0){
            this.alpha = 0;
            return true;
          }
        } else{
          return true;
        }
      }
    }
    return false;
  }
  this.render = () =>{
    if (!this.finished){
      this.finished = this.update();
      ctx.globalAlpha = this.alpha;
      var index = this.frameIndex;
      if (this.loop){
        index = index % this.frames.length;
      } else {
        index = Math.min(index, this.frames.length-1);
      }
      ctx.drawImage(this.frames[index], this.pos.x, this.pos.y, this.size.x, this.size.y);
      ctx.globalAlpha = 1;
    }
  }
}


var Filters = {
  getPixels: (img, size = null) => {
    if (size === null) {
      size = {x: img.width, y: img.height};
    }
    var c = Filters.getCanvas(size.x, size.y);
    var ctx = c.getContext('2d');
    //ctx.clearRect(0,0,size.x, size.y);
    ctx.drawImage(img, 0, 0, size.x, size.y);
    return ctx.getImageData(0, 0, size.x, size.y);
  },
  getCanvas: (w, h) => {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  },
  filterImage: (image, filters, size = null) => {    
    if (size === null){
      size = {x: image.width, y: image.height};
    }
    var pixels = Filters.getPixels(image, size);
    for (var i = 0; i < filters.length; i++) {
      var filterFunction = filters[i].function;
      var parameters = filters[i].parameters;
      pixels = filterFunction(pixels, parameters);
    }
    return Filters.createImageFromPixels(pixels, size.x, size.y);
    //return pixels;    
  },
  grayscale: (pixels) => {
    var d = pixels.data;
    for (var i=0; i<d.length; i+=4) {
      var r = d[i];
      var g = d[i+1];
      var b = d[i+2];      
      var v = 0.2126*r + 0.7152*g + 0.0722*b;
      d[i] = d[i+1] = d[i+2] = v;
    }
    return pixels;
  },
  brightness: (pixels, adjustment, targetPixels = null) => {
    var d = pixels.data;    
    var td = targetPixels === null ? pixels.data : targetPixels.data;
    for (var i = 0; i < d.length; i += 4) {
      td[i] = d[i] + adjustment;
      td[i+1] = d[i+1] + adjustment;
      td[i+2] = d[i+2] + adjustment;
    }
    return targetPixels === null ? pixels : targetPixels;
  },
  brightnessRGB: (pixels, adjustment, targetPixels = null) =>{
    var d = pixels.data;    
    var td = targetPixels === null ? pixels.data : targetPixels.data;
    for (var i = 0; i < d.length; i += 4) {
      td[i] = d[i] + adjustment.r;
      td[i+1] = d[i+1] + adjustment.g;
      td[i+2] = d[i+2] + adjustment.b;
    }
    return targetPixels === null ? pixels : targetPixels;
  },
  contrast: (pixels, contrastAdjustment, saturationAdjustment, targetPixels = null) => {
    var d = pixels.data;
    var td = targetPixels === null ? pixels.data : targetPixels.data;
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i];
      var g = d[i+1];
      var b = d[i+2];      
      var v = 0.2126*r + 0.7152*g + 0.0722*b;
      var sa = saturationAdjustment;
      var dr = sa*(v-r);
      var dg = sa*(v-g);
      var db = sa*(v-b);
      td[i] = contrastAdjustment*(d[i] + dr - 128) + 128;
      td[i+1] = contrastAdjustment*(d[i+1] + dg - 128) + 128;
      td[i+2] = contrastAdjustment*(d[i+2] + db - 128) + 128;
      
    }
    return targetPixels === null ? pixels : targetPixels;
  },
  tmpCanvas: document.createElement('canvas'),
  
  createImageData: function(w,h) {    
    return this.tmpCanvas.getContext('2d').createImageData(w,h);    
    //return ctx.createImageData(w,h);
  },

  createImageFromPixels: function(pixels, w, h) {
    var img = new Image();
    var c = Filters.getCanvas(w, h);
    var ctx = c.getContext('2d');
    //ctx.clearRect(0,0,size.x, size.y);
    ctx.putImageData(pixels, 0, 0);
    img.src = c.toDataURL('image/png');
    return img;
  },

  convolute: function(pixels, weights, opaque) {
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side/2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    var output = Filters.createImageData(w, h);
    var dst = output.data;
    // go through the destination image pixels
    var alphaFac = opaque ? 1 : 0;
    for (var y=0; y<h; y++) {
      for (var x=0; x<w; x++) {
        var sy = y;
        var sx = x;
        var dstOff = (y*w+x)*4;
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        var r=0, g=0, b=0, a=0;
        for (var cy=0; cy<side; cy++) {
          for (var cx=0; cx<side; cx++) {
            var scy = sy + cy - halfSide;
            var scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              var srcOff = (scy*sw+scx)*4;
              var wt = weights[cy*side+cx];
              r += src[srcOff] * wt;
              g += src[srcOff+1] * wt;
              b += src[srcOff+2] * wt;
              a += src[srcOff+3] * wt;
            }
          }
        }
        dst[dstOff] = r;
        dst[dstOff+1] = g;
        dst[dstOff+2] = b;
        dst[dstOff+3] = a + alphaFac*(255-a);
      }
    }
    return output;
  },
  screenFilter: (pixels) => {        
    var weight =  [ 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9 ];
    var pixels = Filters.brightness(pixels, 50);    
    var pixels = Filters.convolute(pixels, weight);    
    var d = pixels.data;
    for (var i=0; i<d.length; i+=4) {
      var r = d[i];
      var g = d[i+1];      
      var b = d[i+2];  
      var a = Math.min(b, Math.min(r, g));      
      d[i+2] *= 0.7;
      d[i+3] = a;
    }
    return pixels;    
  },
  addAlphaMask: (pixels, alphaMask) => {
    var d = pixels.data;
    var ad = alphaMask.data;
    for (var i=0; i<d.length; i+=4) {
      var r = ad[i];
      var g = ad[i+1];      
      var b = ad[i+2];  
      var a = (r+g+b)/3;            
      d[i+3] = a;
    }
    return pixels;    
  },
  toBase64: (image, size = null) => {
    if (size === null){
      size = {x: image.width, y: image.height};      
    }
    var c = Filters.getCanvas(size.x, size.y);
    var context = c.getContext("2d");
    context.drawImage(image, 0, 0, size.x, size.y);
    return c.toDataURL();
    //return c.toDataURL("image/webp", 0.85);
  }  
};




