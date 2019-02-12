var isServer = typeof isClient !== "undefined" ? !isClient : true;
var isClient = !isServer;

function reducePrecision(number, decimals){
	return Math.round(number * 10**decimals) / 10**decimals;
}

function Vertex2(x, y){
	this.x = x;
	this.y = y;
	this.round = (decimals) => {
		return new Vertex2(reducePrecision(this.x, decimals), reducePrecision(this.y, decimals));
	}
	this.dist = (other)=>{
    var dx = other.x-this.x;
    var dy = other.y-this.y;
    return Math.sqrt(dx**2+dy**2);
  }
  this.magn = () => {
  	return Math.sqrt(this.x**2+this.y**2);
  }
}

function Vertex3(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
	this.round = (decimals) => {
		return new Vertex3(reducePrecision(this.x, decimals), reducePrecision(this.y, decimals), reducePrecision(this.z, decimals));
	}
	this.dist = (other)=>{
    var dx = other.x-this.x;
    var dy = other.y-this.y;
    var dz = 0.0;
    if (other.z !== undefined){
    	dz = other.z-this.z;
    } 
    return Math.sqrt(dx**2+dy**2+dz**2);
  }
  this.magn = () => {
  	return Math.sqrt(this.x**2+this.y**2+this.z**2);
  }
}

function k2b(dk){
	return (dk['a'] << 0) + (dk['s'] << 1) + (dk['d'] << 2) + (dk['w'] << 3) + (dk[' '] << 4);
}

Math.clamp = function(number, min, max) {
  return Math.min(Math.max(number, min), max);
};

function b2k(bk){
	var downKeys = {
		a: (bk & 0b1)>0, 
		s: (bk & 0b10)>0, 
		d: (bk & 0b100)>0, 
		w: (bk & 0b1000)>0, 
		' ': (bk & 0b10000)>0
	}
	return downKeys;
}

var Vector = function(position, direction) {
  this.pos = position;
  this.dir = direction;    
  this.intersects = (otherVector) => {
    var ax = this.pos.x;
    var ay = this.pos.y;
    var bx = this.dir.x;
    var by = this.dir.y;
    var cx = otherVector.pos.x;
    var cy = otherVector.pos.y;
    var dx = otherVector.dir.x;
    var dy = otherVector.dir.y;     
    var num = ((cy - ay) * bx - (cx - ax) * by);
    var den = (dx * by - dy * bx);        
    if (den === 0) return null;
    var M = num / den;
    return {x: cx + dx*M, y: cy + dy*M}; 
  }
}

if (isServer){
  exports.Vertex3 = Vertex3;
  exports.Vertex2 = Vertex2;
  exports.b2k = b2k;
  exports.k2b = k2b;
  exports.reducePrecision = reducePrecision;
  exports.Vector = Vector;
}
