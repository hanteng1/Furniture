const {log, status} = require('./log')
const csgToGeometries = require('./csgToGeometries')
const {geometryToCsgs, unionCsgs} = require('./geometryToCsgs')
const {hinge, addHinge} = require('./processor')
const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations


function main()
{
	var scene;
	var geometries = {};
	var materials = {};
	var selected = null;
	var helpers = {};

	init();

	function init()
	{
		let a = 1;
		if(!Detector.webgl)
			Detector.addGetWebGLMessage();

		var container = document.getElementById('container');

		var camera = new THREE.PerspectiveCamera (45, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.set(250, 400, 650);
		camera.lookAt(new THREE.Vector3());

		scene = new THREE.Scene();
		scene.background = new THREE.Color(0xf0f0f0);

		var ambientLight = new THREE.AmbientLight( 0xccccc, 0.4);
		scene.add(ambientLight);

		var pointLight = new THREE.PointLight(0xffffff, 0.8);
		camera.add(pointLight);
		scene.add(camera);

		var gridHelper = new THREE.GridHelper( 1000, 20 ) ;//size, divisions
		scene.add( gridHelper );

		var renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );

		var stats = new Stats();
		//container.appendChild( stats.dom )
		window.addEventListener( 'resize', onWindowResize, false );

		var controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.addEventListener( 'change', render );
		controls.minDistance = 1;
		controls.maxDistance = 10000;
		controls.enablePan = true;

		animate();

		function animate()
		{
			requestAnimationFrame(animate);
			render();
			stats.update();
		}

		function render()
		{
			renderer.render(scene, camera);
		}

		function onWindowResize()
		{
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
		}

	}

	// function loadModelObj(objFilePath)
	// {

	// 	var onProgress = function ( xhr ) {
	// 		if ( xhr.lengthComputable ) {
	// 			var percentComplete = xhr.loaded / xhr.total * 100;
	// 			console.log( Math.round(percentComplete, 2) + '% downloaded' );
	// 		}
	// 	};
	// 	var onError = function ( xhr ) {};
	// 	var loader = new THREE.OBJLoader();
	// 	loader.load(objFilePath, function(object){
	// 		var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 });
	// 		object.traverse(function(child){

	// 			log('child');

	// 			if(child instanceof THREE.Mesh){
	// 				child.material = material;
	// 				child.position.set(0, 0, 0);
	// 				child.scale.set(1, 1, 1);
	// 				child.castShadow = true;
	// 				child.receiveShadow = true;

	// 				//scene.add(child);
	// 			}
	// 		});

	// 		scene.add(object);
	// 	}, onProgress, onError);
	// }


	function setupAttributes(geometry)
	{
		//todo: bring back quads
		var vectors = [
			new THREE.Vector3(1, 0, 0),
			new THREE.Vector3(0, 1, 0),
			new THREE.Vector3(0, 0, 1)
		];

		var position = geometry.attributes.position;
		var centers = new Float32Array( position.count * 3 );
		for ( var i = 0, l = position.count; i < l; i ++ ) {
			vectors[ i % 3 ].toArray( centers, i * 3 );
		}
		geometry.addAttribute( 'center', new THREE.BufferAttribute( centers, 3 ) );
	}


	function addObject(object) {
		object.traverse(function(child){
			if(child.geometry !== undefined) addGeometry(child.geometry);
			if(child.material !== undefined) addMaterial(child.material);

			addHelper(child);
		});

		scene.add(object);
	}

	function addGeometry(geometry)
	{
		geometries[geometry.uuid] = geometry;
	}

	function addMaterial(material)
	{
		materials[material.uuid] = material;
	}	
}


document.addEventListener('DOMContentLoaded', function(event){
	var _main = new main();
	var _ui = new ui(_main);
})


