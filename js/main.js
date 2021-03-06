"use strict;"

//const {log, status} = require('./log')
//const csgToGeometries = require('./csgToGeometries')
//const {geometryToCsgs, unionCsgs} = require('./geometryToCsgs')
//const {hinge, addHinge} = require('./processor')
//const scadApi = require('@jscad/scad-api')
//const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
//const {cube, sphere, cylinder} = scadApi.primitives3d
//const {union, difference, intersection} = scadApi.booleanOps
//const {translate, rotate} = scadApi.transformations

//here we define 1 unit == 1 fm

const Processor = require('./Processor')
const computeConvexHull = require('./computeConvexHull')
//test cut
const cadCutByPlane = require('./cadCutByPlane')
//Wei Hsiang start
const MarkSize = require('./MarkSize')
const MarkBetweenSize = require('./MarkBetweenSize')
const cadMakeRod = require('./cadMakeRod')
const {Model_AddBetween , AddRodMousePosi1, AddRodMousePosi2,
	SelectFurniComponent, SelectFurni} = require('./Model_AddBetween')
//Wei Hsiang end
const {Model_Cut,  AddCutPlaneMousePosi1, AddCutPlaneComponent} = require('./Model_Cut'); 


function Main()
{

	//category
	this.category0 = "";
	this.category = "";
	//this.category = "cabinet";
	//this.category = "tool";

	//only stores data
	this.container = document.getElementById('container');
	this.scene = new THREE.Scene();
	this.scene.background = new THREE.Color(0x443333);
	this.geometries = {};
	this.materials = {};
	this.selected = null;
	this.helpers = {};
	//this.sceneHelpers = new THREE.Scene();
	this.stats = new Stats();
	this.camera;
	this.renderer = new THREE.WebGLRenderer( { antialias: true } );
	this.control = null;

	this.envMap;

	//obj transform controller
	this.transformControls = null;
	this.box = new THREE.Box3();
	this.selectionBox = new THREE.BoxHelper();

	//normal axis
	//show only one axis at a time
	this.addAxis = null;

	//mouse pick
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();
	this.onDownPosition = new THREE.Vector2();
	this.onUpPosition = new THREE.Vector2();
	this.onDoubleClickPosition = new THREE.Vector2();
	this.onCtrlE = false;
	this.onCtrl = false;
	//store the furniture object and transformation info
	//arrays of Furniture
	this.furnitures = [];  

	//arrays of scene objects
	this.Sceneobjects = [];

	//arrays of size onject
	this.SizeObj = [];
	
	//arrays of select two object
	this.DistanceObj = [];

	//Obj for get size
	this.GetSizeObj = [];

	//object for wrap 
	this.WrapObject = [];


	//Procedure objects
	//for record objects in every step
	this.stepObject = [];
	//for record operation name in every step
	this.stepOperationName = 'Initial';
	//for record step is the last or not
	this.lastStep = true;
	//for record operation step times
	this.stepNumber = 0;

	//select the single component
	this.Addrod = false;
	//the selected single component 
	this.component = null;
	//the select point
	this.pointball = null;
	this.fixpointball = false;
	this.intersectpoint = null;


	this.Cutting = false;
	this.cutplane = null;

	this.cutplaneDirection = 0;
	this.fixcutplane = false;


	//this is to store the furnitures before any chance
	//simply copy of the this.furnitures
	this.furnituresDataSet = [];

	//store pieces of mesh
	//set to current selected furniture
	this.furniture = null;
	//this.objects = [];

	//for explode vectors
	this.explodeVectors = [];

	//this is used only for adding normal rotations
	this.explodeVectorsCorrected = [];

	this.selectedIds = [];
	this.objCenter = new THREE.Vector3();
	//for multi selection
	this.selectionBoxes = [];


	//processor for transformations
	this.processor = null;


	//house environment
	this.house = new THREE.Object3D();
	this.gridHelper;

	// controls
	this.customControl;


	//mesh simplify
	this.modifer = new THREE.SimplifyModifier();


	//to handle the 
	this.handleClickToCall = false;


	//---------------------test get wall------------------------------------------------
	this.purpleWall = new THREE.Object3D();
	this.ceiling = new THREE.Object3D();



	this.elf = null;

	this.showExample_flag = false;

}

Main.prototype = {

	init: function(){

		document.getElementById("minfo").style = "display:none";
		var scope = this;

		let a = 1;

		//detect if webgl is supported
		// if(!Detector.webgl)
		// 	Detector.addGetWebGLMessage();

		this.camera = new THREE.PerspectiveCamera (45, window.innerWidth / window.innerHeight, 1, 10000);
		
		//this.camera.position.set(0, 17, 10); //height at 1.7m
		
		this.camera.position.set( 0, 2, 3 );
		this.camera.lookAt( 0, 0, 0 );

		//this.camera.lookAt(new THREE.Vector3(0, 10, 200));

		var ambientLight = new THREE.AmbientLight( 0xeeeeee, 0.4);
		this.scene.add(ambientLight);

		var pointLight = new THREE.PointLight(0xffffff, 0.2);
		this.camera.add(pointLight);
		this.scene.add(this.camera);
		//this.addHelper(pointLight);


		var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.2);
		hemiLight.position.set( 0, 100, 0 );
		this.scene.add( hemiLight );
		//this.addHelper(hemiLight);

		var directlight = new THREE.DirectionalLight( 0xffffff, 0.3 );
		directlight.position.set( 0, 30, 50 );
		// directlight.castShadow = true;
		// directlight.shadow.camera.top = 1.8;
		// directlight.shadow.camera.left = -1.2;
		// directlight.shadow.camera.bottom = -1.8;
		// directlight.shadow.camera.right = 1.2;
		this.scene.add( directlight );
		//this.addHelper(directlight);

		var path = './skybox/';
		var format = '.jpg';
		this.envMap = new THREE.CubeTextureLoader().load( [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
			] );			

		this.scene.background = new THREE.Color(.95,.95,.95);

		this.gridHelper = new THREE.GridHelper( 16, 16) ;//size, divisions
		this.scene.add( this.gridHelper );
		
		this.loadHouseEnvironment();
		
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.gammaOutput = true;
		this.container.appendChild( this.renderer.domElement );

		//this.container.appendChild( this.stats.dom )
		window.addEventListener( 'resize', this.onWindowResize.bind(this), false );

		//--------------------Add Model------------------------------------------
		this.container.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );

		//change add, plane, cut, rob parameters
		this.container.addEventListener( 'wheel', this.onMouseWheel.bind(this), false );

		//mouse events
		this.container.addEventListener('mousedown', this.onMouseDown.bind(this), false);
		this.container.addEventListener('touchstart', this.onTouchStart.bind(this), false);		
		this.container.addEventListener('dblclick', this.onDoubleClick.bind(this), false);

		//keyboard events
		document.addEventListener('keydown', this.onKeyDown.bind(this), false);


		//custom control
		this.customControl = new THREE.CustomControls( this.camera, this.renderer.domElement );
		this.customControl.addEventListener( 'change', this.render.bind(this) );
		this.customControl.minDistance = 1;
		this.customControl.maxDistance = 10000;


		//this.customControl.enablePan = true;
		//this.customControl.target.set(0, 0.5, - 0.2);

		// this.customControl.lookSpeed = 0.05;
  //       this.customControl.movementSpeed = 20;
  //       this.customControl.noFly = true;
  //       this.customControl.lookVertical = true;
  //       this.customControl.constrainVertical = true;
  //       this.customControl.verticalMin = 1.0;
  //       this.customControl.verticalMax = 2.0;
  //       this.customControl.lon = -110;
  //       this.customControl.lat = -50;


		this.transformControls = new THREE.TransformControls(this.camera, this.renderer.domElement);
		this.transformControls.addEventListener('change', this.render.bind(this));
		this.scene.add(this.transformControls);

		this.addAxis = new AddAxis(this.camera, this.renderer.domElement);
		this.addAxis.addEventListener('change', this.render.bind(this));
		this.scene.add(this.addAxis);

		this.selectionBox.material.depthTest = false;
		this.selectionBox.material.transparent = true;
		this.selectionBox.visible = false;
		this.scene.add( this.selectionBox );

		this.animate();

		//initialize processor
		this.processor = new Processor(scope);



		////test loading
		// var loadingManager = new THREE.LoadingManager( function () {
		// 		scope.scene.add( scope.elf );
		// } );

		// // collada
		// var loader = new THREE.ColladaLoader( loadingManager );
		// loader.load( './models/chair/chair5.dae', function ( collada ) {
		// 	scope.elf = collada.scene;
		// });

		this.showExample_flag = false;
	},


	enableHouseEnvironment: function() {
		this.scene.remove(this.gridHelper);
		this.scene.add(this.house);
	},

	disableHouseEnvironment: function() {
		this.scene.remove(this.house);
		this.scene.add(this.gridHelper);
	},

	loadHouseEnvironment: function() {

		var scope = this;

		//sky
		// SKYDOME
		var light = new THREE.DirectionalLight( 0xaabbff, 0.3 );
		var vertexShader = document.getElementById( 'vertexShader' ).textContent;
		var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
		var uniforms = {
			topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
			bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
			offset:		 { type: "f", value: 400 },
			exponent:	 { type: "f", value: 0.6 }
		};
		uniforms.topColor.value.copy( light.color );
		var skyGeo = new THREE.SphereBufferGeometry( 4000, 32, 15 );
		var skyMat = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: THREE.BackSide
		} );
		var sky = new THREE.Mesh( skyGeo, skyMat );
		//scope.scene.add( sky );
		this.house.add(sky);

		// ground
		var groundTexture = new THREE.TextureLoader().load("../images/floor.jpg");
		groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    	groundTexture.offset.set( 0, 0 );
    	groundTexture.repeat.set( 10, 16 );

		var ground = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 10, 16, 10, 16),
			new THREE.MeshPhongMaterial( {wireframe: false, map: groundTexture, specular: 0x101010} )
		);
		ground.rotation.x = - Math.PI / 2;
		// plane.position.y = -1;
		ground.receiveShadow = true;
		//scope.scene.add(ground);
		this.house.add(ground);

		//wall
		var purpleWallTexture = new THREE.TextureLoader().load("../images/purple_wall.jpg");
		purpleWallTexture.wrapS = purpleWallTexture.wrapT = THREE.RepeatWrapping;
    	purpleWallTexture.offset.set( 0, 0 );
    	purpleWallTexture.repeat.set( 10, 3 );

    	var purple_wall = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 10, 3, 10, 3),
			new THREE.MeshPhongMaterial( {map: purpleWallTexture, specular: 0x101010} )
		);

    	purple_wall.position.copy(new THREE.Vector3(0, 1.5, -8));
		purple_wall.receiveShadow = true;
		//scope.scene.add(purple_wall);
		this.house.add(purple_wall);

		//---------------------test get wall------------------------------------------------


		this.purpleWall = purple_wall;

		//----------------------------------------------------------------------------------

		var whiteWallTexture = new THREE.TextureLoader().load("../images/white_wall.jpg");
		whiteWallTexture.wrapS = whiteWallTexture.wrapT = THREE.RepeatWrapping;
    	whiteWallTexture.offset.set( 0, 0 );
    	whiteWallTexture.repeat.set( 4, 3 );

		//left wall
		var left_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 0.3, 3, 4, 1, 3, 4),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	left_wall.position.copy(new THREE.Vector3(-5, 1.5, -6));
		left_wall.receiveShadow = true;
		//scope.scene.add(left_wall);
		this.house.add(left_wall);

		//left window
		var loader = new THREE.ColladaLoader();

		loader.load( '../models/window.dae', function ( collada ) {
			var fcWindow = collada.scene;
			fcWindow.scale.copy(new THREE.Vector3(0.021, 0.021, 0.021));
			fcWindow.position.copy(new THREE.Vector3(-5.3, 0, -6));
			fcWindow.rotation.z = - Math.PI / 2;
			//scope.scene.add(fcWindow);
			scope.house.add(fcWindow);
		});

		whiteWallTexture.repeat.set( 3, 3 );
		var left_window_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 0.3, 3, 3, 1, 3, 3),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

		left_window_wall.position.copy(new THREE.Vector3(-5, 1.5, 3.1));
		left_window_wall.receiveShadow = true;
		//scope.scene.add(left_wall);
		this.house.add(left_window_wall);
		

		//left window left
		whiteWallTexture.repeat.set( 1, 3);
		var left_window_left_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 0.3, 3, 9 - 5.55, 1, 3, 3),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	left_window_left_wall.position.copy(new THREE.Vector3(-2.0, 1.5, 8.0 - (9.0 - 5.55)/2));
		left_window_left_wall.receiveShadow = true;
		//scope.scene.add(left_window_left_wall);
		this.house.add(left_window_left_wall);


		whiteWallTexture.repeat.set( 3, 3);
		var left_wall_left_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 3.0, 3.0, 0.3, 3, 3, 1),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	left_wall_left_wall.position.copy(new THREE.Vector3(-3.5, 1.5, 8.0 - (9.0 - 5.55) + 0.15));
		left_wall_left_wall.receiveShadow = true;
		//scope.scene.add(left_wall_left_wall);
		this.house.add(left_wall_left_wall);


		//right wall
		whiteWallTexture.repeat.set(3, 8);
		var right_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 0.3, 3.0, 8.0, 1, 3, 8),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	right_wall.position.copy(new THREE.Vector3(5.0, 1.5, -4.0));
		right_wall.receiveShadow = true;
		//scope.scene.add(right_wall);
		this.house.add(right_wall);
		
		//right door
		loader.load( '../models/door.dae', function ( collada ) {
			var fcDoor = collada.scene;
			fcDoor.scale.copy(new THREE.Vector3(0.025, 0.025, 0.025));
			fcDoor.position.copy(new THREE.Vector3(4, 0, -1.43));
			fcDoor.rotation.z = - Math.PI / 2;
			//scope.scene.add(fcDoor);
			scope.house.add(fcDoor);

		});


		//right door top
		whiteWallTexture.repeat.set(1, 1);
		var right_door_top_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 0.3, 0.94, 0.8858, 1, 1, 1),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	right_door_top_wall.position.copy(new THREE.Vector3(5, 2.066 +0.94 / 2, 0.8858 / 2));
		right_door_top_wall.receiveShadow = true;
		//scope.scene.add(right_door_top_wall);
		this.house.add(right_door_top_wall);

		//right door right
		whiteWallTexture.repeat.set(3, 7);
		var right_door_right_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 0.3, 3, 8 - 0.885, 1, 3, 7),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	right_door_right_wall.position.copy(new THREE.Vector3(5, 1.5, 0.885 + (8.0 - 0.8858) / 2));
		right_door_right_wall.receiveShadow = true;
		//scope.scene.add(right_door_right_wall);
		this.house.add(right_door_right_wall);

		//ceiling
		whiteWallTexture.repeat.set(10, 16);
		var ceiling = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 10.0, 16.0, 10, 16),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);
		ceiling.position.y = 3;
		ceiling.rotation.x = Math.PI / 2;
		ceiling.receiveShadow = true;
		//scope.scene.add(ceiling);
		this.house.add(ceiling);


		//---------------------test get wall------------------------------------------------
		
		this.ceiling = ceiling;

		//---------------------test get wall------------------------------------------------

		//the other side, 70 window
		loader.load( '../models/wall_window.dae', function ( collada ) {
			var wWindow = collada.scene;
			wWindow.scale.copy(new THREE.Vector3(0.025, 0.025, 0.025));
			wWindow.position.copy(new THREE.Vector3(-4, 0, 8.5));
			//wWindow.rotation.z = - Math.PI / 2;
			wWindow.rotation.x = - Math.PI / 2;
			//scope.scene.add(wWindow);
			scope.house.add(wWindow);


			// var box = new THREE.Box3();
			// box.setFromObject(wWindow);
			// var box_size = new THREE.Vector3();
			// box.getSize(box_size);

			// //this includes width, height, depth
			// console.log(box_size);
		});


		//flower
		loader.load( '../models/apsad.dae', function ( collada ) {
			var apsad = collada.scene;

			// apsad.traverse( function ( child ) {
			// 	if ( child.isMesh ) {
			// 		child.material.envMap = scope.envMap;
			// 		child.material.needsUpdate = true;
			// 		child.castShadow = true;
			// 	}
			// });

			apsad.scale.copy(new THREE.Vector3(0.04, 0.04, 0.04));
			apsad.position.copy(new THREE.Vector3(-4.0, 0, -7.0));
			apsad.rotation.x = - Math.PI / 2;
			scope.house.add(apsad);
			
		});


		//on purple wall hanger
		loader.load( '../models/wall_art.dae', function ( collada ) {
			var wall_art = collada.scene;

			// wall_art.traverse( function ( child ) {
			// 	if ( child.isMesh ) {
			// 		child.material.envMap = scope.envMap;
			// 		child.material.needsUpdate = true;
			// 		child.castShadow = true;
			// 	}
			// });

			wall_art.scale.copy(new THREE.Vector3(0.002, 0.002, 0.002));
			wall_art.position.copy(new THREE.Vector3(0, 1.5, -7.9));
			wall_art.rotation.z = Math.PI / 2;
			scope.house.add(wall_art);
			
		});

		//wall shelf
		loader.load( '../models/wall_shelf.dae', function ( collada ) {
			var wall_shelf = collada.scene;

			wall_shelf.traverse( function ( child ) {
				if ( child.isMesh ) {
					child.material.envMap = scope.envMap;
					child.material.needsUpdate = true;
					child.castShadow = true;
				}
			});

			wall_shelf.position.copy(new THREE.Vector3(4.85, 1.5, -3.0));
			//wall_shelf.rotation.x = - Math.PI / 2;
			wall_shelf.rotation.z = - Math.PI / 2;
			wall_shelf.scale.copy(new THREE.Vector3(0.03, 0.03, 0.03));

			scope.house.add(wall_shelf);
			
		});

		//this.scene.add(this.house);

	},


	gltfLoadedCallback: function(gltf, envMap, position, rotation) {

		var scope = this;

		gltf.scene.traverse( function ( child ) {

			if ( child.isMesh ) {

				child.material.envMap = envMap;
				child.material.needsUpdate = true;
				child.castShadow = true;


				//
				var edges = new THREE.EdgesGeometry( child.geometry );
				var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xff0000 } ) );

				scope.scene.add( line );
			}

		} );
		gltf.scene.position.copy( position );
		gltf.scene.rotation.y = rotation;
		gltf.scene.scale.copy(new THREE.Vector3(10, 10, 10));
		scope.scene.add( gltf.scene );
	},


	animate: function()
	{
		requestAnimationFrame(this.animate.bind(this));

		this.customControl.applyTransition();

		this.render();
		this.stats.update();
	},

	render: function()
	{
		this.renderer.render(this.scene, this.camera);
	},

	onWindowResize: function()
	{
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	},

	



	// preAddObject: function(object) {
		
	// 	var scope = this;

	// 	//predict the length, width, height
	// 	var loadedScale = new THREE.Vector3();
	// 	object.getWorldScale(loadedScale);

	// 	console.log(loadedScale);

	// 	var box = new THREE.Box3();
	// 	box.setFromObject(object);
	// 	var box_size = new THREE.Vector3();
	// 	box.getSize(box_size);

	// 	console.log(box_size);

	// 	//a series test to decide the most suitable predicted sizes
	// 	//assume we are using dae files.. and the z is height.. need a rotation?
	// 	//working on...

	// 	var size = []; size.push(box_size.x, box_size.y, box_size.z);
	// 	size.sort(function(a, b){return a - b});

	// 	//in case of chair
	// 	var length = size[0];
	// 	var width = size[1];
	// 	var height = size[2];

	// 	var loadMatrix = new THREE.Matrix4();

	// 	if( height > 0.5 && height < 1.5) {
	// 		//keep the size and ignore the scale
	// 		if(loadedScale.x != 1) {
	// 			var location = new THREE.Vector3(0, 0, -30);
	// 			//var location = new THREE.Vector3();
	// 			//this will cause errors in addAxis
	// 			//var quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0));
	// 			var quaternion = new THREE.Quaternion();

	// 			var scale = new THREE.Vector3(loadedScale.x * 10, loadedScale.y * 10, loadedScale.z * 10)

	// 			loadMatrix.compose(location, quaternion, scale);
		
	// 		}else{  // ==1

	// 			//you decide whether this will be used

	// 			var location = new THREE.Vector3(0, 0, -30);
	// 			//var location = new THREE.Vector3();
	// 			//this will cause errors in addAxis
	// 			//var quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0));
	// 			var quaternion = new THREE.Quaternion();

	// 			var scale = new THREE.Vector3(0.0254 * 10, 0.0254 * 10, 0.0254 * 10)

	// 			loadMatrix.compose(location, quaternion, scale);

	// 		}

	// 	}
	// 	else{
	// 		var location = new THREE.Vector3(0, 0, -30);
	// 		var quaternion = new THREE.Quaternion();

	// 		var scale = new THREE.Vector3(1, 1, 1);

	// 		loadMatrix.compose(location, quaternion, scale);
	// 	}

	// 	//visualize
	// 	var defaultLength = parseFloat(length).toFixed(1);
	// 	var defaultWidth = parseFloat(width).toFixed(1);
	// 	var defaultHeight = parseFloat(height).toFixed(1);
	// 	$('#model_size_initialization').slideDown(300);
	// 	$('#model_size_initialization').find("input")[0].setAttribute("placeholder", "Length " + `${defaultLength}` + " m");
	// 	$('#model_size_initialization').find("input")[1].setAttribute("placeholder", "Width " + `${defaultWidth}` + " m");
	// 	$('#model_size_initialization').find("input")[2].setAttribute("placeholder", "Height " + `${defaultHeight}` + " m");

	// 	//this.addObject(object);
	// 	console.log($('#model_size_initialization').find(".fluid.ui.button"));

	// 	$('#model_size_initialization').find("button")[0].onclick =function() {
	// 		scope.addObject(object, loadMatrix);
	// 		$('#model_size_initialization').slideUp(200);
	// 	};

	// },

	//function to load model into the scene
	// addObject: function ( object, loadMatrix ) {

	// 	//add the compoennts
	// 	var objects = [];
	// 	object.traverse( function ( child ) {

	// 		if ( child.geometry !== undefined ) {
	// 			//child.material.envMap = scope.envMap;
	// 			child.material.needsUpdate = true;
	// 			child.castShadow = true;
	// 			child.name = "";

	// 			objects.push(child);
	// 			//scope.addHelper( child ); //to visualize helpers

	// 		}

	// 		//if ( child.material !== undefined ) scope.addMaterial( child.material );
	// 	} );

	// 	//add this to array and visualize its
	// 	var furnitureObj = new THREE.Object3D();
	// 	for(var i = 0; i < objects.length; i++){
	// 		furnitureObj.add(objects[i]);
	// 	}

	// 	let furniture = new Furniture(furnitureObj);
	// 	//furniture.setObjects(objects);
	// 	furniture.setCategory("straight_chair");
	// 	furniture.setIndex(this.furnitures.length + 1);

	// 	furniture.setLoadMatrix(loadMatrix);

	// 	this.furnitures.push(furniture);

	// 	this.scene.add(this.furnitures[this.furnitures.length - 1].getFurniture());

	// 	//update the menu interface
	// 	furniture.addCard();

	// },


	addObject: function(object) {


		//console.log(object);

		//general matrix
		var loadMatrix = new THREE.Matrix4();
		//var loadCameraMatrix = new THREE.Matrix4();

		var position = new THREE.Vector3();
		position.copy(object.position);
		var quaternion = new THREE.Quaternion();
		quaternion.copy(object.quaternion);
		var scale = new THREE.Vector3();
		scale.copy(object.scale);

		loadMatrix.compose(position, quaternion, scale);
		//loadCameraMatrix.copy(loadMatrix);

		//object matrix
		var object_1 = object.children[0].children[1];
		var loadMatrix_1 = new THREE.Matrix4();
		var position_1 = new THREE.Vector3();
		position_1.copy(object_1.position);
		var quaternion_1 = new THREE.Quaternion();
		quaternion_1.copy(object_1.quaternion);
		var scale_1 = new THREE.Vector3();
		scale_1.copy(object_1.scale);

		loadMatrix_1.compose(position_1, quaternion_1, scale_1);
		loadMatrix.multiply(loadMatrix_1);

		//console.log(loadMatrix);


		// var camera_0 = object.children[0].children[0];

		// if(camera_0.isPerspectiveCamera)
		// {
		// 	console.log("PerspectiveCamera");

		// 	// var loadMatrix_0 = new THREE.Matrix4();
		// 	// var position_0 = new THREE.Vector3();
		// 	// position_0.copy(camera_0.position);
		// 	// var quaternion_0 = new THREE.Quaternion();
		// 	// quaternion_0.copy(camera_0.quaternion);
		// 	// var scale_0 = new THREE.Vector3();
		// 	// scale_0.copy(camera_0.scale);

		// 	// loadMatrix_0.compose(position_0, quaternion_0, scale_0);
		// 	// loadCameraMatrix.multiply(loadMatrix_0);

		// 	// console.log(loadCameraMatrix);

		// 	this.customControl.loadObject(camera_0, loadCameraMatrix);
		// }

		var objects = [];
		object.traverse(function(child){
			if(child.geometry !== undefined)
			{
				child.material.needsUpdate = true;
				child.castShadow = true;
				child.name = "";
				objects.push(child);
			}
		}) ;

		var furnitureObj = new THREE.Object3D();
		for(var i = 0; i< objects.length; i++){
			furnitureObj.add(objects[i]);
		}

		let furniture = new Furniture(furnitureObj);

		furniture.setCategory("straight_chair");  //does this matter ? 

		furniture.setIndex(this.furnitures.length + 1);
		furniture.setLoadMatrix(loadMatrix);

		this.furnitures.push(furniture);
		
		//this is where the position, orientation and scale information got lost
		this.scene.add(this.furnitures[this.furnitures.length - 1].getFurniture());


		//load the object camera view change
		this.customControl.loadObject(furniture);

		//update the menu interface
		furniture.addCard();

	},

	addGeometry: function ( geometry ) {

		this.geometries[ geometry.uuid ] = geometry;
	},

	addMaterial: function ( material ) {

		this.materials[ material.uuid ] = material;

	},


	addHelper: function () {
		//var scope = this;

		var geometry = new THREE.SphereBufferGeometry( 2, 4, 2 );
		var material = new THREE.MeshBasicMaterial( { color: 0xff0000, visible: false } );

		return function ( object ) {

			var scope = this;

			var helper;

			if ( object instanceof THREE.Camera ) {

				helper = new THREE.CameraHelper( object, 1 );

			} else if ( object instanceof THREE.PointLight ) {

				helper = new THREE.PointLightHelper( object, 1 );

			} else if ( object instanceof THREE.DirectionalLight ) {

				helper = new THREE.DirectionalLightHelper( object, 1 );

			} else if ( object instanceof THREE.SpotLight ) {

				helper = new THREE.SpotLightHelper( object, 1 );

			} else if ( object instanceof THREE.HemisphereLight ) {

				helper = new THREE.HemisphereLightHelper( object, 1 );

			} else if ( object instanceof THREE.SkinnedMesh ) {

				helper = new THREE.SkeletonHelper( object );

			} else if( object instanceof THREE.Object3D) {

				helper = new THREE.AxesHelper(20);

			} else {

				// no helper for this object type
				return;

			}

			var picker = new THREE.Mesh( geometry, material );
			picker.name = 'picker';
			picker.userData.object = object;
			helper.add( picker );

			scope.scene.add( helper );
			scope.helpers[ object.id ] = helper;

			//this.signals.helperAdded.dispatch( helper );

		};

	}(),

	removeHelper: function ( object ) {

		if ( this.helpers[ object.id ] !== undefined ) {

			var helper = this.helpers[ object.id ];
			helper.parent.remove( helper );

			delete this.helpers[ object.id ];

			//this.signals.helperRemoved.dispatch( helper );

		}

	},

	select: function(object){
		//var scope = this;
		console.log()
		if(this.selected == object) return;
		var uuid = null;

		if(object !== null) {
			uuid = object.uuid;
		}


		this.selected = object;

		if(this.onCtrlE == false && this.onCtrl == false)
		{
			//single select
			this.addTransformControl(this.furniture, this.selected);
			//this.addNormalAxis(this.selected);
		}else if(this.onCtrlE == true && this.onCtrl == false){
			//multi select for merge
			this.addMultiSelection(this.selected);
		}	
		else if (this.onCtrl == true){
			this.SelectTwo(object);
		}

	},

	addTransformControl: function(furniture, object){
		this.selectionBox.visible = false;
		this.transformControls.detach();

		if (furniture !== null && object !== null && object !== this.scene && object !== this.camera ) {

			this.box.setFromObject( object );

			if ( this.box.isEmpty() === false ) {

				this.selectionBox.setFromObject( object );
				this.selectionBox.visible = true;

			}

			this.transformControls.attach(furniture, object );

		}else {
			this.selected = null;
		}
	},

	addNormalAxis: function(furniture, object) {
		this.addAxis.detach();
		//this is shown only in the exploded mode
		if ( object !== null && object !== this.scene && object !== this.camera ) {
			this.addAxis.attach(furniture, object );
		}
	},

	//selection when exploded, to define group relationship among pieces
	addMultiSelection: function(object){
		this.selectionBox.visible = false;
		this.transformControls.detach();
		
		if ( object !== null && object !== this.scene && object !== this.camera ) {
			this.box.setFromObject( object );
			if ( this.box.isEmpty() === false ) {
				var selectionBox = new THREE.BoxHelper();
				selectionBox.setFromObject( object );
				selectionBox.material.depthTest = false;
				selectionBox.material.transparent = true;
				selectionBox.visible = true;

				this.selectionBoxes.push(selectionBox);
				this.scene.add( selectionBox );

				var selectedId = object.id; //this.furniture.getObjects().indexOf(object);
				this.selectedIds.push(selectedId);
				this.selected = object;

				if(this.selectionBoxes.length > 0)
				{
					$('#label').show();
				}

			}
		}else {
			this.selected = null;
		}
	},

	SelectTwo: function(object){
		//this.selectionBox.visible = false;
		//this.transformControls.detach();
		
		if ( object !== null && object !== this.scene 
			&& object !== this.camera && this.DistanceObj.length<3) {
			this.box.setFromObject( object );
			if ( this.box.isEmpty() === false ) {
				var selectionBox = new THREE.BoxHelper();
				selectionBox.setFromObject( object );
				selectionBox.material.depthTest = false;
				selectionBox.material.transparent = true;
				selectionBox.visible = true;

				this.DistanceObj.push(object);
				this.selectionBoxes.push(selectionBox);
				this.scene.add( selectionBox );

				this.selected = object;

			}
		}else {
			this.selected = null;
		}
		if(this.DistanceObj.length == 2){
			$('.ui.blue.submit.button.getdis').show();
		}
	},

	removeFromScene: function(object){
		this.scene.remove(object);
		
		if(object.geometry !== undefined) {
			object.geometry.dispose();
		}
		if(object.material !== undefined) {

			object.material.dispose();
		}
		object = undefined;
	},


	// getCenterPoint: function(mesh){
	// 	var geometry = mesh.geometry;
	// 	geometry.computeBoundingBox();
	// 	var center = new THREE.Vector3();
	// 	geometry.boundingBox.getCenter(center);
	// 	mesh.localToWorld(center);
	// 	return center;
	// },

	getCenterPoint: function(object){
		var box = new THREE.Box3();
		box.setFromObject(object);
		var center = new THREE.Vector3();
		if(box.isEmpty() === false)
		{
			box.getCenter(center);
		}else{
			console.log("error on getting center point");
		}

		return center;
	},

	getSize: function(object) {
		var box = new THREE.Box3();
		box.setFromObject(object);
		var box_size = new THREE.Vector3();
		box.getSize(box_size);

		//this includes width, height, depth
		return box_size;
	},

	explode: function(furniture){
		this.select(null);

		//compute the furniture's center
		this.objCenter = new THREE.Vector3();
		this.objCenter = this.getCenterPoint(furniture.getFurniture());
		//console.log(this.objCenter);
		
		this.explodeVectors = [];
		this.explodeVectorsCorrected  = [];
		this.selectedIds = [];
		var objects = furniture.getObjects(); //get the children objs

		var lowestHeight = 0;

		for(var i = 0; i < objects.length; i++)  //objects.length
		{
			var elmCenter = this.getCenterPoint(objects[i]);
			// if(i == 0){
			// 	console.log("part before: ");
			// 	console.log(elmCenter);
			// }
			
			var subVector = new THREE.Vector3();
			subVector.subVectors(elmCenter, this.objCenter);
			subVector.multiplyScalar(1);

			//attention to the rotations
			this.explodeVectors.push(subVector.clone());
			
			var elmQuaternion = new THREE.Quaternion();
			var elmPosition = new THREE.Vector3();
			var elmScale = new THREE.Vector3();
			objects[i].matrixWorld.decompose(elmPosition, elmQuaternion, elmScale);


			subVector.divide(elmScale);
			//console.log(elmScale);

			var inverseQuaternion = new THREE.Quaternion();
			inverseQuaternion.copy(elmQuaternion);
			inverseQuaternion.inverse();
			subVector.applyQuaternion(inverseQuaternion);

			this.explodeVectorsCorrected.push(subVector.clone());


			objects[i].translateX(subVector.x);
			objects[i].translateY(subVector.y);
			objects[i].translateZ(subVector.z);

			// if(i == 0){
			// 	console.log("part moving: x " + subVector.x + " y " + subVector.y + " z " + subVector.z);
			// 	elmCenter = this.getCenterPoint(objects[i]);
			// 	console.log("part after: ");
			// 	console.log(elmCenter);
			// }

			//get lowest y
			elmCenter = this.getCenterPoint(objects[i]);
			var elmSize = this.getSize(objects[i]);

			var bottomHeight = elmCenter.y - elmSize.y/2;

			if(bottomHeight < lowestHeight){
				lowestHeight = bottomHeight;
			}
		}


		//position above 0

		//console.log(lowestHeight);

		if(lowestHeight < 0)
		{
			for(var i = 0; i < objects.length; i++)
			{
				
				var additionalVec = new THREE.Vector3(0, Math.abs(lowestHeight), 0);
				this.explodeVectors[i].add(additionalVec.clone());

				var elmQuaternion = new THREE.Quaternion();
				var elmPosition = new THREE.Vector3();
				var elmScale = new THREE.Vector3();
				objects[i].matrixWorld.decompose(elmPosition, elmQuaternion, elmScale);

				//there might be a problem is the object is not evently scaled
				additionalVec.divide(elmScale);

				var inverseQuaternion = new THREE.Quaternion();
				inverseQuaternion.copy(elmQuaternion);
				inverseQuaternion.inverse();
				additionalVec.applyQuaternion(inverseQuaternion);

				this.explodeVectorsCorrected[i].add(additionalVec.clone());


				objects[i].translateX(additionalVec.x);
				objects[i].translateY(additionalVec.y);
				objects[i].translateZ(additionalVec.z);

			}
		}

		
	},

	collapse: function(furniture){

		var objects = furniture.getObjects();
		if(this.explodeVectors.length != objects.length)
			return;


		if(furniture.hasNormalRotation == true) 
		{

			for(var i = 0; i < objects.length; i++)
			{
				var subVector = this.explodeVectorsCorrected[i];
				subVector.negate();

				objects[i].translateX(subVector.x);
				objects[i].translateY(subVector.y);
				objects[i].translateZ(subVector.z);
			}


			furniture.hasNormalRotation = false;

		}else{
			for(var i = 0; i < objects.length; i++)
			{
				var subVector = this.explodeVectors[i];
				subVector.negate();

				//attention
				var elmQuaternion = new THREE.Quaternion();
				var elmPosition = new THREE.Vector3();
				var elmScale = new THREE.Vector3();
				objects[i].matrixWorld.decompose(elmPosition, elmQuaternion, elmScale);
				//console.log(elmScale);

				subVector.divide(elmScale);

				var inverseQuaternion = new THREE.Quaternion();
				inverseQuaternion.copy(elmQuaternion);
				inverseQuaternion.inverse();
				subVector.applyQuaternion(inverseQuaternion);
				

				objects[i].translateX(subVector.x);
				objects[i].translateY(subVector.y);
				objects[i].translateZ(subVector.z);
			}
		}
					
		this.explodeVectorsCorrected  = [];
		this.explodeVectors = [];
	},

	//this is actually apply a group to the objects
	mergeObjs: function(){

		var objects = this.furniture.getObjects();  //children of the furniture
		var furnitureObj = this.furniture.getFurniture();

		// if(objects.length != this.explodeVectors.length)
		// 	return;

		if(this.selectedIds.length < 1)
			return;


		var revertTranslation = this.furniture.position.clone();
		revertTranslation.negate();

		//selected indices in the explodevectors
		var selectedIndices = [];
		//get the selected obj back to orignal positions
		for(var i = 0; i < this.selectedIds.length; i++)
		{
			var objId = this.selectedIds[i];
			var childObj = furnitureObj.getObjectById(objId);
			selectedIndices.push(objects.indexOf(childObj));
			var subVector = this.explodeVectors[ objects.indexOf(childObj) ];
			subVector.negate();

			//attention
			var elmQuaternion = new THREE.Quaternion();
			var elmPosition = new THREE.Vector3();
			var elmScale = new THREE.Vector3();
			childObj.matrixWorld.decompose(elmPosition, elmQuaternion, elmScale);

			subVector.divide(elmScale);

			var inverseQuaternion = new THREE.Quaternion();
			inverseQuaternion.copy(elmQuaternion);
			inverseQuaternion.inverse();
			subVector.applyQuaternion(inverseQuaternion);

			childObj.translateX(subVector.x);
			childObj.translateY(subVector.y);
			childObj.translateZ(subVector.z);

			//childObj.position.add(revertTranslation);
		}

		//delete the selected boxes from scene
		for(var i = 0; i < this.selectionBoxes.length; i++)
		{
			this.removeFromScene(this.selectionBoxes[i]);
		}
		this.selectionBoxes = [];

		//group the selected children objs
		//attention: this action move the obj back to the (0,0,0)
		var groupObj = new THREE.Object3D();
		//groupObj.position.copy(this.furniture.position);
		//console.log(groupObj.position);
		//console.log(this.getCenterPoint(groupObj));

		for(var i = 0; i < this.selectedIds.length; i++)
		{
			var objId = this.selectedIds[i];
			var childObj = furnitureObj.getObjectById(objId);
			groupObj.add(childObj);
		}

		//console.log(groupObj.position);
		//console.log(this.getCenterPoint(groupObj));

		//groupObj.position.add(this.furniture.position);
		//console.log(groupObj.position);
		//console.log(this.getCenterPoint(groupObj));

		// //delete old ones from the obj and vector arrays
		selectedIndices.sort(function(a, b){ return b - a;});
		for(var i = 0; i < selectedIndices.length; i++)
		{
			var objIndex = selectedIndices[i];
			this.explodeVectors.splice(objIndex,1);

			this.explodeVectorsCorrected.splice(objIndex,1);
		}

		//add the new one to the array
		var n_elmCenter = this.getCenterPoint(groupObj);
		var n_subVector = new THREE.Vector3();
		//n_subVector.subVectors(n_elmCenter, this.objCenter);
		//n_subVector.multiplyScalar(2);
		this.explodeVectors.push(n_subVector.clone());


		this.explodeVectorsCorrected.push(n_subVector.clone());

		groupObj.translateX(n_subVector.x);
		groupObj.translateY(n_subVector.y);
		groupObj.translateZ(n_subVector.z);

		// //objects.push(groupObj);
		furnitureObj.add(groupObj);
		// console.log(this.furniture.getFurniture().children.length)
		// furnitureObj.add(groupObj);
		// console.log(this.furniture.getFurniture().children.length)
		// //this.scene.add(groupObj);

		//make the current selection of the new groupObj
		//re-start the multiple seletion process
		this.selectedIds = [];
		this.addMultiSelection(groupObj);

	},


	//label a selected part
	//this should be after an object is selected or merged
	assignLabel: function(label) {
		//there has to be a seected object
		if(this.selected == null || this.selected == undefined) return;

		//set the selected to the label
		//the obj is labeled if it has a name

		//console.log(this.selected.name);

		if( this.selected.name !== "" && this.selected.name !== label) {

			var prevName = this.selected.name;
			var curName = prevName + '-' + label;
			this.selected.name = curName;

			//change the component label
			this.furniture.changeComponentLabel(prevName, curName);

			//enable normal axis
			this.addNormalAxis(this.furniture, this.selected);


			//in case of "seat-back"
			if(curName == "seat-back")
			{
				this.processor.seatback = true;
			}

		}else{
			this.selected.name = label;

			//console.log(this.selected.name);
			this.furniture.addComponentLabel(label);

			//attach the normal axis
			this.addNormalAxis(this.furniture, this.selected);
		}

		
	},


	//mouse events
	getIntersects: function(point, objects) {
		this.mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
		this.raycaster.setFromCamera( this.mouse, this.camera );
		return this.raycaster.intersectObjects( objects, true );
	},

	getIntersect: function(point, object) {
		this.mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
		this.raycaster.setFromCamera( this.mouse, this.camera );
		return this.raycaster.intersectObject( object, true);
	},

	getMousePosition: function(dom, x, y)
	{
		var rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];
	},


	handleClick: function()
	{

		//console.log("handleclick called");
		if ( this.onDownPosition.distanceTo( this.onUpPosition ) === 0 ) {

			if(this.onCtrlE == false && this.onCtrl == false 
				&& this.Addrod == false && this.Cutting == false) {

				var objselect = true;
				//only select the furniture
				for(var i = 0; i < this.furnitures.length; i++) {
					var intersects = this.getIntersect( this.onUpPosition, this.furnitures[i].getFurniture());

					if ( intersects.length > 0 ) {

						this.furniture = this.furnitures[i];

						this.select(this.furniture.getFurniture());

						objselect = false;
						//if haven't select this furniture before
						this.GetSizeObj = [];
						this.GetSizeObj.push( this.furniture.getFurniture() );
						$('.ui.blue.submit.button.getsize').show();

						//-----------------Add Model----------------------------
						
						if( this.processor.model_add !== undefined){
							if(!this.processor.model_add.isCreateObject){
								console.log("hit");
								var furniture = this.furniture.getFurniture();
								this.processor.model_add.selectFurnitureUUID = furniture.uuid;
								this.processor.model_add.selectFurniture = furniture;
								if(this.processor.model_add.selectObjectName != ""){
									console.log("create a new " + this.processor.model_add.selectObjectName);
									this.processor.model_add.createObject();
								}
								else
									console.log("No object need to create");
							}
							else{
								// furniture change
								if(this.processor.model_add.selectFurniture != this.furniture.getFurniture()){
									var furniture = this.furniture.getFurniture();
									this.processor.model_add.selectFurnitureUUID = furniture.uuid;
									this.processor.model_add.selectFurniture = furniture;
								}
								else{
									this.processor.model_add.isCreateObject = false;
									this.processor.model_add.isCreateInsideObject = false;
									var furniture = this.processor.model_add.selectFurniture;
									var obj = this.processor.model_add.selectObject;
									var pos = obj.position.clone ();
									this.processor.model_add.objectAddToFurniture(furniture, obj, pos);
									console.log("add success");
									this.processor.model_add.selectFurnitureUUID = "";
									this.processor.model_add.selectObjectName = "";
								}
							}
						}
						//-----------------Add Model----------------------------

						break;
					} else {
						//it also calls select, to detach
						this.select( null );
						this.furniture = null;

						objselect = true;
						this.GetSizeObj = [];
						$('.ui.blue.submit.button.getsize').hide();
						//this.RemoveSizeLabel();
						
					}
				}
				
				//if furniture isn't selected ,select object
				if (objselect == true){
					var SomethingSelected =false;
					for(var i = 0; i < this.Sceneobjects.length ; i++){
						var intersects = this.getIntersect( this.onUpPosition, this.Sceneobjects[i]);

						if ( intersects.length > 0 ) {
							
							this.furniture = this.Sceneobjects[i];
							this.select(this.Sceneobjects[i]);
							this.GetSizeObj = [];
							this.GetSizeObj.push( this.Sceneobjects[i] );
							$('.ui.blue.submit.button.getsize').show();
							SomethingSelected = true;
							break;
						} else {
							//it also calls select, to detach
							this.furniture = null;
							this.select( null );
							$('.ui.blue.submit.button.getsize').hide();
							this.GetSizeObj = [];
							this.RemoveSizeLabel();

						}

					}
					//if not select anything
					if (SomethingSelected == false){
						//console.log("unselected");
						//this.customControl.switchView2FP();
					}
					
				}


			}else if (this.onCtrlE == true && this.onCtrl == false
				&& this.Addrod == false && this.Cutting == false){
				//select from explode objects, this.furniture should not be null
				var intersects = this.getIntersects( this.onUpPosition, this.furniture.getObjects());

				if ( intersects.length > 0 ) {

					var object = intersects[ 0 ].object;

					if(object.parent != this.furniture.getFurniture()){
						object = object.parent;
					}

					if ( object.userData.object !== undefined ) {
						this.select( object.userData.object );
					} else {
						this.select( object );
						//push object to label size
						this.GetSizeObj.push(object);
						$('.ui.blue.submit.button.getsize').show();

						

					}
				} else {
					//it also calls select, to detach
					this.select( null );
				}

				

			}
			//select two obj for getting distance
			else if(this.onCtrl == true && this.Addrod == false && this.Cutting == false){
				//console.log('select two');
				var objselect = true;
				//only select the furniture
				for(var i = 0; i < this.furnitures.length; i++) {
					var intersects = this.getIntersect( this.onUpPosition, this.furnitures[i].getFurniture());

					if ( intersects.length > 0 ) {

						this.furniture = this.furnitures[i];
						this.select(this.furniture.getFurniture());
						
						objselect = false;
						break;
					} else {
						//it also calls select, to detach
						this.select( null );
						this.furniture = null;
						objselect = true;
					}
				}
				//if furniture isn't selected ,select object
				if (objselect == true){
					for(var i = 0; i < this.Sceneobjects.length ; i++){
						var intersects = this.getIntersect( this.onUpPosition, this.Sceneobjects[i]);

						if ( intersects.length > 0 ) {
							
							this.furniture = this.Sceneobjects[i];
							this.select(this.Sceneobjects[i]);
							break;
						} else {
							//it also calls select, to detach
							this.furniture = null;
							this.select( null );
						}
					}
				}

			}
			//select the furniture component for select the adding position
			else if( this.Addrod == true && this.Cutting == false){
				if(this.onCtrl == false)
					SelectFurniComponent(this);
				else
					SelectFurni(this);
			}else if(this.Cutting == true){

				AddCutPlaneComponent(this);
			}
		}
	},

	onMouseDown: function(event) {

		if(this.handleClickToCall == false)
		{
			event.preventDefault();
			var array = this.getMousePosition( this.container, event.clientX, event.clientY );
			this.onDownPosition.fromArray( array );
			document.addEventListener( 'mouseup', this.onMouseUp.bind(this), false );

			this.handleClickToCall = true;
		}
	},


	onMouseUp: function(event) {

		if(this.handleClickToCall == true){

			var array = this.getMousePosition( this.container, event.clientX, event.clientY );
			this.onUpPosition.fromArray( array );

			this.handleClick();

			document.removeEventListener( 'mouseup', this.onMouseUp.bind(this), false );

			this.handleClickToCall = false;

		}
	},

	getAllChildren: function(obj, array) {
        if(obj.type == "Mesh"){
            array.push(obj);
        }
        if (obj.children.length > 0) {
            for (var i = 0; i < obj.children.length; i++) {
                if(obj.children[i].type == "Mesh" || obj.children[i].type == "Object3D"){
                    this.getAllChildren(obj.children[i], array);
                }   
            }
        }
    },

	onMouseMove: function ( event ) {

		if( this.processor.model_add !== undefined && this.Addrod == false && this.Cutting == false && this.Cutting == false){
			//-----------------------------------Add Model--------------------------
			if(this.processor.model_add.isCreateObject){
				this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
				var raycaster = new THREE.Raycaster();
				raycaster.setFromCamera( this.mouse, this.camera );
				var array = [];
				this.getAllChildren(this.processor.model_add.selectFurniture, array);
				var intersects = raycaster.intersectObjects(array);
				if(intersects.length > 0){
					var pos = intersects[0].point;
					var furniture = intersects[0].object;
					var normalVector = intersects[0].face.normal;
					var worldNormalVector = this.processor.model_add.getFurnitureNormalVectorToWorldVector(furniture, normalVector);
					this.processor.model_add.updateObjectPosition(pos, worldNormalVector);
				}
				else{
					console.log("mousemove miss");
				}
			}
		}//if want to add rod
		else if(this.Addrod == true){
			//select the adding position in select position
			if( this.onCtrl == false )
				AddRodMousePosi1(this);
			if( this.onCtrl == true )
				AddRodMousePosi2(this);
		}
		//else if(this.onCtrl == true)


		else if(this.Cutting == true) {

			AddCutPlaneMousePosi1(this);
		}


	},


	onMouseWheel: function(event) {
		event.preventDefault();

		if(this.Cutting == true && this.customControl.mouseWheelDisabled) {
			//console.log("calling mouse wheel");

			//rotate the cutting plane
			this.cutplaneDirection++;

			if(this.cutplaneDirection == 3)
			{
				this.cutplaneDirection = 0;
			}


			if(this.cutplaneDirection == 0)
			{
				this.cutplane.rotateZ(-90* Math.PI/180);
				this.cutplane.rotateX(90* Math.PI/180);
			}else if(this.cutplaneDirection == 1)
			{
				this.cutplane.rotateX(-90* Math.PI/180);
				this.cutplane.rotateY(90* Math.PI/180);
			}else if(this.cutplaneDirection == 2)
			{
				this.cutplane.rotateY(-90* Math.PI/180);
				this.cutplane.rotateZ(90* Math.PI/180);
			}		
			


		}else {

			// 
		}

	},


	onTouchStart: function(event) {
		var touch = event.changedTouches[ 0 ];

		var array = this.getMousePosition( this.container, touch.clientX, touch.clientY );
		this.onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', this.onTouchEnd.bind(this), false );
	},

	onTouchEnd: function(event) {
		var touch = event.changedTouches[ 0 ];

		var array = this.getMousePosition( this.container, touch.clientX, touch.clientY );
		this.onUpPosition.fromArray( array );

		this.handleClick();

		document.removeEventListener( 'touchend', this.onTouchEnd.bind(this), false );
	},

	onDoubleClick: function(event) {
		var array = this.getMousePosition( this.container, event.clientX, event.clientY );
		this.onDoubleClickPosition.fromArray( array );

		// console.log("double clicked");

		//this.customControl.switchView2TG();
		//this.customControl.switchView2FP();

		//var intersects = this.getIntersects( this.onDoubleClickPosition, this.objects );
		// for(var i = 0; i < this.furnitures.length; i++) {
		// 	var intersects = this.getIntersect( this.onUpPosition, this.furnitures[i].getFurniture());
		// }

		// if ( intersects.length > 0 ) {

		// 	var intersect = intersects[ 0 ];

		// 	//focused

		// }

		if(this.furniture !== null) {
			// console.log("yes furniture");
			//this.customControl.switchView2TG();

			this.customControl.loadObject(this.furniture);
		}else {
			// console.log("no furniture");
			this.customControl.switchView2FP();
		}
	},

	onKeyDown: function(event) {
		var keyCode = event.which;

		//event.ctrlKey && 
		if(keyCode == 69 && this.onCtrlE == false && this.furniture != undefined){  
			this.onCtrlE = true;
			//enable explosion sview
			if(this.furniture  != null )
				this.explode(this.furniture);
			
			//hide the GetSize button
			$('.ui.blue.submit.button.getsize').hide();
			//clear the object for getting size
			this.GetSizeObj = [];

		}else if(keyCode == 87) {

			// if(this.transformControls.visible == true)
			// {
			// 	//w to change mode
			// 	var ctrlMode = this.transformControls.getMode();

			// 	if(ctrlMode == "translate"){
			// 		this.transformControls.setMode("rotate");
			// 	}else if(ctrlMode == "rotate"){
			// 		this.transformControls.setMode("translate");
			// 	}
			// }else{
			// 	//w to switch on
			// 	this.select(this.furniture);

			// }

		}else if(keyCode == 37) {
			//addAxis(this.furniture, this.scene);
		}else if(keyCode == 8) {

			//delete

		}else if(keyCode == 91 && this.onCtrl == false) {//press Ctrl button

			this.onCtrl = true;
			console.log('Ctrl down');
		
		}else if(keyCode == 46){
			
			//delete furniture
			if(this.furniture != null ){
				try{//delete furniture
					this.removeFromScene(this.furniture.getFurniture());
					this.furnitures.splice( this.furnitures.indexOf(this.furniture),1);
					this.selectionBox.visible = false;
					this.transformControls.detach();
					
				}
				catch(err){//delete object
				    this.removeFromScene(this.furniture);
				    this.Sceneobjects.splice( this.Sceneobjects.indexOf(this.furniture),1);
					this.selectionBox.visible = false;
					this.transformControls.detach();
				}
			}
			//clear cards
			$('#cards').empty();
			//add cards again
			for(var i=0; i<this.furnitures.length; i++){
				this.furnitures[i].addCard();
			}

		}


		// else if(keyCode == 37){
		// 	//left
		// 	this.furniture.translateX(-10);
		// }else if(keyCode == 39) {
		// 	//right
		// 	this.furniture.translateX(10);
		// }else if(keyCode == 38) {
		// 	//ups
		// 	this.furniture.translateY(10);
		// }else if(keyCode == 40) {
		// 	//down
		// 	this.furniture.translateY(-10);
		// }else if(keyCode == 77) {
		// 	//m
		// 	var quaternion = new THREE.Quaternion();
		// 	quaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI / 2 );
		// 	//this.furniture.matrix.makeRotationFromQuaternion(quaternion);
		// 	//this.furniture.matrix.setPosition(start_position);
		// 	//this.furniture.matrixAutoUpdate = false;

		// 	this.furniture.quaternion.copy(quaternion);


		// }

		document.addEventListener( 'keyup', this.onKeyUp.bind(this), false );
	},

	onKeyUp: function(event) {

		if(this.onCtrlE == true)
		{
			this.onCtrlE = false;

			//disable explosion view 
			if(this.furniture  != null )
				this.collapse(this.furniture);

			if(this.selectionBoxes.length > 0)
			{
				for(var i = 0; i < this.selectionBoxes.length; i++)
				{
					this.removeFromScene(this.selectionBoxes[i]);
				}
			}
			
			this.selectionBoxes = [];
			this.selectedIds = [];
			this.furniture = null;
			this.addAxis.detach();
			this.selected = null;

			//need to reset the axis
			//to world axis
			this.addAxis.space = 'world';
			//make invisile visible
			this.addAxis.setAllVisible();
			

			$('#label').hide();
			
			//hide the GetSize , RemoveSize button
			$('.ui.blue.submit.button.getsize').hide();
			
			if(this.GetSizeObj.length == this.WrapObject.length){
				for(var i=0 ; i<this.GetSizeObj.length; i++ ){

					var target = this.getCenterPosition( this.GetSizeObj[i] );
					var source = this.getCenterPosition( this.WrapObject[i] );
					
					var diff   = new THREE.Vector3().subVectors(target , source );
					var result = new THREE.Vector3().addVectors(this.WrapObject[i].position,diff);
					this.WrapObject[i].position.set( result.x, result.y, result.z);
					
				}
			}
			
			//clear the object
			this.WrapObject = [];
			
			this.RemoveSizeLabel();

			

		}else {

			var keyCode = event.which;

			if(keyCode == 8) {
				//delete the selected furniture
				if(this.furniture == undefined) {
					return;
				}else {
					
					var cardIndex = this.furniture.index;

					//todo.. to check a better way
					//this.removeObject(this.furniture.getFurniture());
					this.removeFromScene(this.furniture.getFurniture());

					//remove the card
					$(`#card${cardIndex}`).remove();	

					this.furnitures.splice(cardIndex - 1, 1);

					this.furniture = undefined;
					this.select(null);

				}

			}
		}

		if(this.onCtrl == true){
			this.onCtrl = false;
			console.log('Ctrl up');
			this.DistanceObj = [];
			for(var i = 0; i < this.selectionBoxes.length; i++)
				{
					this.removeFromScene(this.selectionBoxes[i]);
				}
			$('.ui.blue.submit.button.getdis').hide();
		}

		document.removeEventListener( 'keyup', this.onKeyUp.bind(this), false );
	},


	//make and update furnitures dataset
	//this.furnituresDataSet = [];
	updateFurnitureDataSet: function() {

		if(this.furnitures.length ==0 )
		{
			console.log("no furniture loaded");
			return;
		}

		//make it empty
		this.furnituresDataSet.length = 0;

		for(var i = 0; i < this.furnitures.length; i++) {

			var furniture = this.furnitures[i];
			var new_furnitureObj = new THREE.Object3D();
			new_furnitureObj.copy(furniture.getFurniture(), true);
			var new_furniture = new Furniture(new_furnitureObj);

			new_furniture.setCategory("straight_chair");
			new_furniture.setIndex(furniture.index);
			this.furnituresDataSet.push(new_furniture);

			//scope.main.scene.add(scope.main.furnitures[scope.main.furnitures.length - 1].getFurniture());

			//update the menu interface
			//new_furniture.addCard();

			//copy the state
			new_furniture.updatePosition(furniture.position);
			new_furniture.updateDirection();
			new_furniture.updateQuaternion(furniture.quaternion);

			//copy the components and labeled state
			new_furniture.updateListedComponents(furniture.listedComponents);
			new_furniture.updateLabeledComponents(furniture.labeledComponents);

			//copy the already labeled normal axis
			//Object.assign(new_furniture.normalAxises, furniture.normalAxises);
			for (let key in furniture.normalAxises) {
				new_furniture.normalAxises[key] = new THREE.Vector3();
				new_furniture.normalAxises[key].copy(furniture.normalAxises[key]);
			}

		}

	},


	removeObject: function(object) {

		if(object.children.length > 0) {
			for(var i = 0; i < object.children.length; i ++) {
				this.removeObject(object.children[i]);
			}
		}else{
			this.removeFromScene(object);
		}
	},


	resetFurnitures: function() {
		//clean the scene and copy back the furnitures from the dataset
		for(var i = this.scene.children.length - 1; i > -1; i -- ){ 
			var object =  this.scene.children[i];	
			
			if(object.isObject3D){

				if ( object instanceof THREE.Camera ) {

				} else if ( object instanceof THREE.PointLight ) {

				} else if ( object instanceof THREE.DirectionalLight ) {

				} else if ( object instanceof THREE.SpotLight ) {					

				} else if ( object instanceof THREE.HemisphereLight ) {

				}else if ( object instanceof THREE.AmbientLight ) {

				}else if ( object instanceof THREE.GridHelper ) {

				}else if ( object instanceof THREE.TransformControls ){

				}else if( object instanceof AddAxis){

				}else if( object instanceof THREE.BoxHelper){


				}else if(object == this.house) {

				}else{
					this.removeFromScene(object); 
				}
			}
		}

		//clear cards
		$('#cards').empty();

		//hide suggested design
		//hide all the parameter operations
		$('#label').hide();

		$('#parameter_control_chair_align').hide();
		$('#parameter_control_chair_rebuild').hide();
		$('#parameter_control_chair_add').hide();
		$('#parameter_control_cabinet_bed').hide();

		$('.operations.operation_chair_align').hide();
		$('.operations.operation_chair_add').hide();
		$('.operations.operation_chair_rebuild').hide();
		$('.operations.operation_cabinet_kallax_one').hide();
		$('.operations.operation_cabinet_kallax_two').hide();
		$('.ui.blue.submit.button.getsize').hide();
		$('.ui.red.submit.button.removesize').hide();
		$('.ui.blue.submit.button.getdis').hide();
		$('.operations.operation_tool').hide();
		$('#parameter_control_tool_painting').hide();
		$('#parameter_control_tool_wrap').hide();
		$('#parameter_control_tool_rotation').hide();
		$('#parameter_control_tool_align').hide();
		$('.operations.operation_desk').hide();
		$('.operations.operation_table').hide();
		$('#parameter_control_tool_addbetween').hide();
		$('#parameter_control_tool_cut').hide();
		$('#AddRodInput').hide();

		// example
		$('.example').hide();

		this.furnitures.length = 0;	

		//add the furnitures and their cards
		for(var j = 0; j < this.furnituresDataSet.length; j ++) {
			var furniture = this.furnituresDataSet[j];
			var new_furnitureObj = new THREE.Object3D();
			new_furnitureObj.copy(furniture.getFurniture(), true);
			var new_furniture = new Furniture(new_furnitureObj);

			new_furniture.setCategory("straight_chair");
			new_furniture.setIndex(furniture.index);
			this.furnitures.push(new_furniture);

			this.scene.add(new_furniture.getFurniture());

			//update the menu interface
			new_furniture.addCard();

			//copy the state
			new_furniture.updatePosition(furniture.position);
			new_furniture.updateDirection();
			new_furniture.updateQuaternion(furniture.quaternion);

			//copy the components and labeled state
			new_furniture.updateListedComponents(furniture.listedComponents);
			new_furniture.updateLabeledComponents(furniture.labeledComponents);

			//copy the already labeled normal axis
			//Object.assign(new_furniture.normalAxises, furniture.normalAxises);
			for (let key in furniture.normalAxises) {
				new_furniture.normalAxises[key] = new THREE.Vector3();
				new_furniture.normalAxises[key].copy(furniture.normalAxises[key]);
			}

		}
		for(var i = this.selectionBoxes.length-1; i >-1 ; i--)
		{
			this.removeFromScene(this.selectionBoxes[i]);
		}
		this.Sceneobjects=[];


		//-----Dresser Add-------
		if( this.processor.dresser_add !== undefined)
			this.processor.dresser_add.hasRemovedDrawers = false;
	},


	//here to put all the operations available
	applyDesign: function() {

		//make copies the furnitures that are already set and labeled
		if(this.furnitures.length != this.furnituresDataSet.length){
			this.updateFurnitureDataSet();
		}

		//assume the furnitures are annoted well and get ready
		//add the corners to the labeled and axised components


		//testing
		// for(var i = 0; i < this.furnitures.length; i++) {

		// 	//draw the corners
		// 	var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

		// 	var geometry = new THREE.Geometry();

		// 	for(let key in this.furnitures[i].corners) {
		// 		var corners = this.furnitures[i].corners[key];
		// 		for(var j = 0; j < corners.length; j++) {
		// 			geometry.vertices.push(corners[j]);
		// 		}
		// 	}

		// 	var line = new THREE.Line( geometry, material );

		// 	this.scene.add( line );

		// }


		//testing


		$('#parameter_control_chair_align').hide();
		$('#parameter_control_chair_rebuild').hide();
		$('#parameter_control_chair_add').hide();
		$('#parameter_control_cabinet_bed').hide();

		$('.operations.operation_chair_align').hide();
		$('.operations.operation_chair_add').hide();
		$('.operations.operation_chair_rebuild').hide();
		$('.operations.operation_cabinet_kallax_one').hide();
		$('.operations.operation_cabinet_kallax_two').hide();
		$('.ui.blue.submit.button.getsize').hide();
		$('.ui.red.submit.button.removesize').hide();
		$('.ui.blue.submit.button.getdis').hide();
		$('.operations.operation_tool').hide();
		$('#parameter_control_tool_painting').hide();
		$('#parameter_control_tool_wrap').hide();
		$('#parameter_control_tool_rotation').hide();
		$('#parameter_control_tool_align').hide();
		$('.operations.operation_desk').hide();
		$('.operations.operation_table').hide();
		$('#parameter_control_tool_addbetween').hide();
		$('#parameter_control_tool_cut').hide();
		$('#AddRodInput').hide();

		this.processor.init();
		//this.processor.executeDesign();


		//test
		//var back_left = this.furnitures[0].getComponentInName("back", "left");

		//visualize
		// this.selectionBox.setFromObject( back_left );
		// this.selectionBox.visible = true;

		// var points = computeConvexHull(back_left, "yz");

		// //draw points
		// var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
		// var geometry = new THREE.Geometry();

		// for(var i =0; i < points.length; i++) {
		// 	var point = points[i];
		// 	var tempP = new THREE.Vector3(0, point[0], point[1]);
		// 	geometry.vertices.push(tempP);
		// }

		// var line = new THREE.Line( geometry, material );

		// this.scene.add( line );



		//test mesh simplify
		// if(back_left.isMesh)
		// {

		// 	var verticesAttribute = back_left.geometry.getAttribute('position');
		// 	var verticesArray = verticesAttribute.array;
		// 	var itemSize = verticesAttribute.itemSize;
		// 	var verticesNum = verticesArray.length / itemSize;

		// 	var beforeLength = verticesNum;

		// 	console.log(beforeLength);

		// 	var simplified = this.modifer.modify( back_left.geometry,  beforeLength * 0.5 | 0 );
		// 	console.log('simplified', simplified.faces.length, simplified.vertices.length);
			
		// 	var wireframe = new THREE.MeshBasicMaterial({
		// 		color: Math.random() * 0xffffff,
		// 		wireframe: true
		// 	});


		// 	var materialNormal = new THREE.MeshNormalMaterial({
		// 		transparent: true,
		// 		opacity: 0.7
		// 	});
			

		// 	//go to cut
		// 	var cutResultGeometry = cadCutByPlane(simplified);


		// 	var mesh = THREE.SceneUtils.createMultiMaterialObject( cutResultGeometry, [
		// 			//material,
		// 			wireframe,
		// 			materialNormal
		// 		]);

		// 	this.scene.add( mesh );



		// }

		

	},

	LabelSize: function(){

		if(this.GetSizeObj.length > 0 ){

			for(var i =0 ; i< this.GetSizeObj.length ; i++){
				MarkSize(this, this.GetSizeObj[i]);
			}

			//show the remove button
			$('.ui.red.submit.button.removesize').show();

		}
		else{
			console.log('this.GetSizeObj is null');
		}

	},

	RemoveSizeLabel: function(){
		for(var i = this.SizeObj.length - 1; i > -1; i -- ){ 
				
			var object =  this.SizeObj[i];
			this.removeFromScene(object);
		}
		this.SizeObj = [];
		this.GetSizeObj = [];
		//hide the remove button
		$('.ui.red.submit.button.removesize').hide();
	},
	GetDistance: function(){

		MarkBetweenSize(this , this.DistanceObj[0] , this.DistanceObj[1]);
		this.DistanceObj = [];
		$('.ui.blue.submit.button.getdis').hide();
		$('.ui.red.submit.button.removesize').show();

	},
	getSize: function( model ) {
        var box = new THREE.Box3();
        box.setFromObject( model );
        var box_size = new THREE.Vector3();
        box.getSize(box_size);

        //this includes width, height, depth
        return box_size;
    },

    showExample: function(){
    	if(this.showExample_flag){
    		$('.example').hide();
    		this.showExample_flag = false;
    	}
    	else{
    		$('.example').show();
    		this.showExample_flag = true;
    	}
    },

    getCenterPosition: function( model ){
    	var box = new THREE.Box3();
		box.setFromObject( model );
		var center = new THREE.Vector3();
		box.getCenter(center);
		return center;
    },

    DeleteObj: function(){
    	this.collapse(this.furniture);
    	var objects = this.furniture.getObjects();
    	var furnitureObj = this.furniture.getFurniture();
    	//this.objCenter = this.getCenterPoint(this.furniture.getFurniture());
    	//delete object in furniture
		for(var i=0 ; i < this.GetSizeObj.length; i++){
			var model = this.GetSizeObj[i];
			model.parent.remove(model);
		}
		
		this.explode(this.furniture);
		this.GetSizeObj = [];
		$('.ui.blue.submit.button.getsize').hide();

    },

    //creat the rod in intersection point
    AddRodFunc: function(){
    	//get the point's normal vector
    	var addvector = this.intersectpoint.face.normal;
    	//set normal vector from local to world
    	var normalMatrix = new THREE.Matrix3().getNormalMatrix( this.intersectpoint.object.matrixWorld );
    	addvector = addvector.clone().applyMatrix3( normalMatrix ).normalize();
    	//set the point position
    	var original  = new THREE.Vector3().addVectors(this.pointball.position,addvector);
    	//set the raycaster from point and normal vector
    	var Raycaster = new THREE.Raycaster( original, addvector );
    	var intersects;
    	//get the intersects from raycaster
    	if(this.onCtrl == false)
    		intersects = Raycaster.intersectObjects ( this.furniture.getObjects(), true);
    	if(this.onCtrl == true )
    		intersects = Raycaster.intersectObjects ( this.DistanceObj , true);
    	
    	//if get intersections
    	if (intersects.length>0){
    		var pos =  intersects[0].point;
    		//using distance to make rod
    		var geo = cadMakeRod(this.pointball.position.distanceTo(pos));
    		var manager = new THREE.LoadingManager();
    		var textureLoader = new THREE.TextureLoader( manager );
    		var texture = textureLoader.load( '../images/material/material5.jpg' );
        	texture.repeat.set(0.1, 0.1);
        	texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        	var material = new THREE.MeshBasicMaterial( {map: texture} );
    		var rod = new THREE.Mesh( geo, material );
    		rod.position.set(this.pointball.position.x ,
    						 this.pointball.position.y ,
    						 this.pointball.position.z );
    		//this.scene.add(rod);
    		
    		var newPosi = rod.position.clone();
    		this.processor.model_add.objectAddToFurniture(
    			this.furniture.getFurniture(), rod, newPosi);
    		this.furniture.getFurniture().worldToLocal(pos);
    		rod.lookAt(pos);

    		this.selectionBox.visible = false;
			this.transformControls.detach();
			this.furniture = null;
    		this.Addrod = false;
    		this.component = null;
    		this.intersectpoint = null;
    		this.fixpointball = false;
    		this.scene.remove(this.pointball);
    		this.pointball = null;
    		$('#AddRodInput').hide();
    		document.getElementById('InputRodRadius').value = "";
    	}
    	else{//if don't get
    		alert('position err');
    		this.fixpointball = false;
    	}
    },

    AddCutPlaneFunc: function() {
    	//console.log("calling");
    	//to do...
    	//console.log(this.intersectpoint);

    	var cutMaterial = new THREE.MeshBasicMaterial();

    	if (Array.isArray(this.component.material))
			cutMaterial = this.component.material[0].clone();
		else
			cutMaterial = this.component.material.clone();


    	var cutResultGeometries = cadCutByPlane(this.component.geometry, this.cutplane, this.intersectpoint, this.component.matrixWorld);
    	
    	var cutPart1 = new THREE.Mesh( cutResultGeometries[0], cutMaterial );
    	var cutPart2 = new THREE.Mesh( cutResultGeometries[1], cutMaterial );

    	var parent = this.component.parent;
    	parent.remove(this.component);
    	this.furniture.getFurniture().add(cutPart1);
    	this.furniture.getFurniture().add(cutPart2);

    	//this.scene.add(cutResult);

    	this.selectionBox.visible = false;
		this.transformControls.detach();
		this.furniture = null;
		this.Cutting = false;
		this.customControl.mouseWheelDisabled = false;
		this.component = null;
		this.intersectpoint = null;
		this.fixpointball = false;
		this.scene.remove(this.cutplane);
		this.cutplane = null;


    }	

};


document.addEventListener('DOMContentLoaded', function(event){
	let main = new Main();
	main.init();
	let ui = new Ui(main);
	ui.init();
	
})


