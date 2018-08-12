var scene, camera, renderer;
var geometry, material, mesh;
 
 
 
document.addEventListener("DOMContentLoaded", function(){
  init();
  animate();
    
});

function init() {
 
    scene = new THREE.Scene();
 
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;
    
    var gridHelper = new THREE.GridHelper( 28, 28, 0x303030, 0x303030 );
		gridHelper.position.set( 0, - 0.04, 0 );
		scene.add( gridHelper );
    
    var manager = new THREE.LoadingManager();
		manager.onProgress = function( item, loaded, total ) {
			console.log( item, loaded, total );
		};
    
    geometry = new THREE.BoxGeometry( 200, 200, 200 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
 
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
 
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
 
    document.body.appendChild( renderer.domElement );
    animate();
}
 
function animate() {
 
    requestAnimationFrame( animate );
 
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;
 
    renderer.render( scene, camera );
 
}
