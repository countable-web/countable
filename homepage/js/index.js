console.log('loaded!');


var clock, scene, camera, renderer, controls, stats, geometry, particles, raycaster;
var mouse = new THREE.Vector2();

var particles = [];

var noisefn = noise.simplex3;

function init() {
	stats = initStats();

	clock = new THREE.Clock();
	clock.start();

	camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 5000);
	// camera = new THREE.OrthographicCamera(window.innerWidth/-2, window.innerWidth/2, window.innerHeight/2, window.innerHeight/-2, 1, 5000);
	camera.position.z = 1000;
	camera.position.y = 1000;
	// camera.position.z = 1000;
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	scene = new THREE.Scene();
	// scene.fog = new THREE.FogExp2(0x000000, 0.001);
	scene.add(camera);

	geometry = new THREE.Geometry();
	sprite = new THREE.TextureLoader().load('./images/disk.png');
	//make particles
	var dimension = 100;
	var increment = 2000/(dimension-1);
	for(var i=0; i<dimension; i++) {
		for(var j=0; j<dimension; j++) {
			var vertex = new THREE.Vector3();
			vertex.x = -1000+i * increment;
			vertex.z = -1000+j * increment;
			vertex.y = 0;

			var norm = Math.pow(vertex.x, 2) + Math.pow(vertex.z, 2);
			var max = (-1000)*(-1000)+(-1000)*(-1000);

			geometry.vertices.push( vertex );
			
			var thiscolor = new THREE.Color();
			thiscolor.setHSL(Math.sqrt(norm/max), 0.7, 0.4);
			geometry.colors.push(thiscolor);
			// geometry.colors.push(new THREE.Color(norm/max*0xffffff));
		}
	}



	material = new THREE.PointsMaterial({size: 50, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true, vertexColors: THREE.VertexColors} );

	particles = new THREE.Points(geometry, material);

	scene.add(particles);
	// console.log(geometry);

	//renderer, raycaster
	renderer = new THREE.WebGLRenderer();
	raycaster = new THREE.Raycaster();
	raycaster.params.Points.threshold = 100; //not sure what this is


	//finish
	document.getElementById("WebGL-output").appendChild(renderer.domElement);
	onResize();
	renderScene();
}

function renderScene() {
	updateParticles();
	stats.update();
	requestAnimationFrame(renderScene);
	renderer.render(scene, camera);
}

function updateParticles() {
	var time = clock.getElapsedTime();

	//starts at x=0, z=1000
	camera.position.x = 1000*Math.cos(time*0.2+Math.PI/2);
	camera.position.z = 1000*Math.sin(time*0.2+Math.PI/2);

	camera.lookAt(new THREE.Vector3(0, 0, 0));

	for(var i=0; i<particles.geometry.vertices.length; i++) {
		currentpos = particles.geometry.vertices[i];
		// particles.geometry.vertices[i].y=80*Math.sin(currentpos.x*0.008+0.5*time)+
										// 80*Math.sin(currentpos.z*0.008+0.8*time);
		var particleheight = (noisefn(currentpos.x/300, currentpos.z/300, time*0.2)+1)*70;
		particles.geometry.vertices[i].y=particleheight;
		particles.geometry.colors[i].setHSL(particles.geometry.vertices[i].y/160, 0.7, 0.4);
	}
	particles.geometry.verticesNeedUpdate=true;
	particles.geometry.colorsNeedUpdate=true;

	raycaster.setFromCamera(mouse, camera);
	var intersections = raycaster.intersectObjects();
	// intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

	// if(time%10<1) console.log(intersections);
	// h = time * 0.1 % 360;
	// material.color.setHSL(h, 0.5, 0.5);
}


window.addEventListener('resize', onResize, false);
function onResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('mousemove', onMouseMove, false);
function onMouseMove( event ) {
	mouse.x = event.clientX - window.innerWidth / 2;
	mouse.y = event.clientY - window.innerHeight / 2;
}

function initStats() {
	var statcontroller = new Stats();
	statcontroller.setMode(0);

	statcontroller.domElement.style.position="absolute";
	statcontroller.domElement.style.left="0";
	statcontroller.domElement.style.top="0";

	document.getElementById("Stats-output").appendChild(statcontroller.domElement);

	return statcontroller;
}

init();