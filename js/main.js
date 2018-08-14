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


function Main()
{

	//category
	//todo: an floating window to select category
	this.category = "chair";

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
	this.camera = new THREE.PerspectiveCamera (45, window.innerWidth / window.innerHeight, 1, 10000);
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

	//store the furniture object and transformation info
	//arrays of Furniture
	this.furnitures = [];  

	//store pieces of mesh
	//set to current selected furniture
	this.furniture = null;
	//this.objects = [];

	//for explode vectors
	this.explodeVectors = [];
	this.selectedIds = [];
	this.objCenter = new THREE.Vector3();
	//for multi selection
	this.selectionBoxes = [];


	//processor for transformations
	this.processor = null;


	//house environment
	this.house = new THREE.Object3D();


	//mesh simplify
	this.modifer = new THREE.SimplifyModifier();

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


	// function setupAttributes(geometry)
	// {
	// 	//todo: bring back quads
	// 	var vectors = [
	// 		new THREE.Vector3(1, 0, 0),
	// 		new THREE.Vector3(0, 1, 0),
	// 		new THREE.Vector3(0, 0, 1)
	// 	];

	// 	var position = geometry.attributes.position;
	// 	var centers = new Float32Array( position.count * 3 );
	// 	for ( var i = 0, l = position.count; i < l; i ++ ) {
	// 		vectors[ i % 3 ].toArray( centers, i * 3 );
	// 	}
	// 	geometry.addAttribute( 'center', new THREE.BufferAttribute( centers, 3 ) );
	// }


}

Main.prototype = {

	init: function(){
		var scope = this;

		let a = 1;
		if(!Detector.webgl)
			Detector.addGetWebGLMessage();

		this.camera.position.set(0, 30, 50);
		this.camera.lookAt(new THREE.Vector3(0, 30, -50));

		var ambientLight = new THREE.AmbientLight( 0xeeeeee, 0.4);
		this.scene.add(ambientLight);

		var pointLight = new THREE.PointLight(0xffffff, 0.2);
		this.camera.add(pointLight);
		this.scene.add(this.camera);
		//this.addHelper(pointLight);


		var hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 0.2);
		hemiLight.position.set( 0, 100, 0 );
		this.scene.add( hemiLight );
		this.addHelper(hemiLight);

		var directlight = new THREE.DirectionalLight( 0xffffff, 0.3 );
		directlight.position.set( 0, 30, 50 );
		// directlight.castShadow = true;
		// directlight.shadow.camera.top = 1.8;
		// directlight.shadow.camera.bottom = -1.8;
		// directlight.shadow.camera.left = -1.2;
		// directlight.shadow.camera.right = 1.2;
		this.scene.add( directlight );
		this.addHelper(directlight);



		var path = './skybox/';
		var format = '.jpg';
		this.envMap = new THREE.CubeTextureLoader().load( [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
			] );			

		this.scene.background = new THREE.Color(.95,.95,.95);

		var gridHelper = new THREE.GridHelper( 1000, 20 ) ;//size, divisions
		this.scene.add( gridHelper );
		//this.addHouseEnvironment();
		
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.gammaOutput = true;
		this.container.appendChild( this.renderer.domElement );

		//this.container.appendChild( this.stats.dom )
		window.addEventListener( 'resize', this.onWindowResize.bind(this), false );

		//mouse events
		this.container.addEventListener('mousedown', this.onMouseDown.bind(this), false);
		this.container.addEventListener('touchstart', this.onTouchStart.bind(this), false);		
		this.container.addEventListener('dblclick', this.onDoubleClick.bind(this), false);

		//keyboard events
		document.addEventListener('keydown', this.onKeyDown.bind(this), false);


		this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		this.controls.addEventListener( 'change', this.render.bind(this) );
		this.controls.minDistance = 1;
		this.controls.maxDistance = 10000;
		this.controls.enablePan = true;
		//this.controls.target.set(0, 0.5, - 0.2);


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

		


		// //test

		// var loader = new THREE.GLTFLoader();
		// loader.load(
		// 	'models/vitra-chair.glb',
		// 	function ( gltf ) {
		// 		scope.gltfLoadedCallback(
		// 			gltf,
		// 			scope.envMap,
		// 			new THREE.Vector3(-1.5,0,-0.5),
		// 			Math.PI*0.2
		// 		);
		// } );


	},


	addHouseEnvironment: function() {

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
    	groundTexture.repeat.set( 10, 10 );

		var ground = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 100, 100, 10, 10),
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
			new THREE.PlaneBufferGeometry( 100, 30, 10, 3),
			new THREE.MeshPhongMaterial( {map: purpleWallTexture, specular: 0x101010} )
		);

    	purple_wall.position.copy(new THREE.Vector3(0, 15, -50));
		purple_wall.receiveShadow = true;
		//scope.scene.add(purple_wall);
		this.house.add(purple_wall);


		var whiteWallTexture = new THREE.TextureLoader().load("../images/white_wall.jpg");
		whiteWallTexture.wrapS = whiteWallTexture.wrapT = THREE.RepeatWrapping;
    	whiteWallTexture.offset.set( 0, 0 );
    	whiteWallTexture.repeat.set( 1, 3 );

		//left wall
		var left_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 3, 30, 10, 1, 3, 1),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	left_wall.position.copy(new THREE.Vector3(-50, 15, -45));
		left_wall.receiveShadow = true;
		//scope.scene.add(left_wall);
		this.house.add(left_wall);

		//left window
		var loader = new THREE.ColladaLoader();

		loader.load( '../models/window.dae', function ( collada ) {
			var fcWindow = collada.scene;
			fcWindow.scale.copy(new THREE.Vector3(0.21, 0.21, 0.21));
			fcWindow.position.copy(new THREE.Vector3(-53, 0, -60));
			fcWindow.rotation.z = - Math.PI / 2;
			//scope.scene.add(fcWindow);
			scope.house.add(fcWindow);
		});
		

		//left window left
		whiteWallTexture.repeat.set( 1, 3);
		var left_window_left_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 3, 30, 90 - 55.5, 1, 3, 3),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	left_window_left_wall.position.copy(new THREE.Vector3(-20, 15, 50 - (90 - 55.5)/2));
		left_window_left_wall.receiveShadow = true;
		//scope.scene.add(left_window_left_wall);
		this.house.add(left_window_left_wall);


		whiteWallTexture.repeat.set( 3, 3);
		var left_wall_left_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 30, 30, 3, 3, 3, 1),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	left_wall_left_wall.position.copy(new THREE.Vector3(-35, 15, 50 - (90 - 55.5) + 1.5));
		left_wall_left_wall.receiveShadow = true;
		//scope.scene.add(left_wall_left_wall);
		this.house.add(left_wall_left_wall);


		//right wall
		whiteWallTexture.repeat.set(3, 5);
		var right_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 3, 30, 50, 1, 3, 5),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	right_wall.position.copy(new THREE.Vector3(50, 15, -25));
		right_wall.receiveShadow = true;
		//scope.scene.add(right_wall);
		this.house.add(right_wall);
		
		//right door
		loader.load( '../models/door.dae', function ( collada ) {
			var fcDoor = collada.scene;
			fcDoor.scale.copy(new THREE.Vector3(0.25, 0.25, 0.25));
			fcDoor.position.copy(new THREE.Vector3(40, 0, -14.3));
			fcDoor.rotation.z = - Math.PI / 2;
			//scope.scene.add(fcDoor);
			scope.house.add(fcDoor);

		});


		//right door top
		whiteWallTexture.repeat.set(1, 1);
		var right_door_top_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 3, 9.4, 8.858, 1, 1, 1),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	right_door_top_wall.position.copy(new THREE.Vector3(50, 20.66 + 9.4 / 2, 8.858 / 2));
		right_door_top_wall.receiveShadow = true;
		//scope.scene.add(right_door_top_wall);
		this.house.add(right_door_top_wall);

		//right door right
		whiteWallTexture.repeat.set(3, 4);
		var right_door_right_wall = new THREE.Mesh(
			new THREE.BoxBufferGeometry( 3, 30, 50 - 8.85, 1, 3, 4),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);

    	right_door_right_wall.position.copy(new THREE.Vector3(50, 15, 8.85 + (50 - 8.858) / 2));
		right_door_right_wall.receiveShadow = true;
		//scope.scene.add(right_door_right_wall);
		this.house.add(right_door_right_wall);

		//ceiling
		whiteWallTexture.repeat.set(10, 10);
		var ceiling = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 100, 100, 10, 10),
			new THREE.MeshPhongMaterial( {map: whiteWallTexture, specular: 0x101010} )
		);
		ceiling.position.y = 30;
		ceiling.rotation.x = Math.PI / 2;
		ceiling.receiveShadow = true;
		//scope.scene.add(ceiling);
		this.house.add(ceiling);


		//the other side, 70 window
		loader.load( '../models/wall_window.dae', function ( collada ) {
			var wWindow = collada.scene;
			wWindow.scale.copy(new THREE.Vector3(0.25, 0.25, 0.25));
			wWindow.position.copy(new THREE.Vector3(-40, 0, 55));
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

			apsad.scale.copy(new THREE.Vector3(0.4, 0.4, 0.4));
			apsad.position.copy(new THREE.Vector3(-40, 0, -40));
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

			wall_art.scale.copy(new THREE.Vector3(0.02, 0.02, 0.02));
			wall_art.position.copy(new THREE.Vector3(0, 15, -49));
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

			wall_shelf.position.copy(new THREE.Vector3(48.5, 15, -30));
			//wall_shelf.rotation.x = - Math.PI / 2;
			wall_shelf.rotation.z = - Math.PI / 2;
			wall_shelf.scale.copy(new THREE.Vector3(0.3, 0.3, 0.3));

			scope.house.add(wall_shelf);
			
		});

		this.scene.add(this.house);

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

	//function to load model into the scene
	addObject: function ( object ) {

		var scope = this;
		var objects = [];


		//test a material
		// var manager = new THREE.LoadingManager();
	 //    manager.onProgress = function ( item, loaded, total ) {
	 //        console.log( item, loaded, total );
	 //    };

	 //    var textureLoader = new THREE.TextureLoader( manager );
	 //    var texture = textureLoader.load( '../model/Fabric-Canyon.jpg' );
	 //    var material = new THREE.MeshBasicMaterial( { wireframe: true});


		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) {
				//scope.addGeometry( child.geometry );

				//scope.objects.push(child);
				child.material.envMap = scope.envMap;
				child.material.needsUpdate = true;
				child.castShadow = true;
				child.name = "";

				objects.push(child);
				//scope.addHelper( child ); //to visualize helpers


				//test


			}

			//if ( child.material !== undefined ) scope.addMaterial( child.material );
		} );


		// for(var i = 0; i < this.objects.length; i++)
		// {
		// 	this.furniture.add(this.objects[i]);
		// }
		// this.scene.add( this.furniture );s
		// this.select( this.furniture );

		//add this to array and visualize its
		var furnitureObj = new THREE.Object3D();
		for(var i = 0; i < objects.length; i++){
			furnitureObj.add(objects[i]);
		}

		let furniture = new Furniture(furnitureObj);
		//furniture.setObjects(objects);
		furniture.setCategory("straight_chair");
		furniture.setIndex(this.furnitures.length + 1);
		this.furnitures.push(furniture);

		this.scene.add(this.furnitures[this.furnitures.length - 1].getFurniture());

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

		if(this.selected == object) return;
		var uuid = null;

		if(object !== null) {
			uuid = object.uuid;
		}

		this.selected = object;

		if(this.onCtrlE == false)
		{
			//single select
			this.addTransformControl(this.furniture, this.selected);
			//this.addNormalAxis(this.selected);
		}else{
			//multi select for merge
			this.addMultiSelection(this.selected);
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


	removeFromScene: function(object){
		this.scene.remove(object);
		
		if(object.geometry !== undefined)
			object.geometry.dispose();
		if(object.material !== undefined)
			object.material.dispose();
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

	explode: function(furniture){
		this.select(null);

		//compute the furniture's center
		this.objCenter = new THREE.Vector3();
		this.objCenter = this.getCenterPoint(furniture.getFurniture());
		//console.log(this.objCenter);
		
		this.explodeVectors = [];
		this.selectedIds = [];
		var objects = furniture.getObjects(); //get the children objs
		for(var i = 0; i < objects.length; i++)  //objects.length
		{
			var elmCenter = this.getCenterPoint(objects[i]);
			// if(i == 0){
			// 	console.log("part before: ");
			// 	console.log(elmCenter);
			// }
			
			var subVector = new THREE.Vector3();
			subVector.subVectors(elmCenter, this.objCenter);
			subVector.multiplyScalar(2);
			this.explodeVectors.push(subVector.clone());

			objects[i].translateX(subVector.x);
			objects[i].translateY(subVector.y);
			objects[i].translateZ(subVector.z);

			// if(i == 0){
			// 	console.log("part moving: x " + subVector.x + " y " + subVector.y + " z " + subVector.z);
			// 	elmCenter = this.getCenterPoint(objects[i]);
			// 	console.log("part after: ");
			// 	console.log(elmCenter);
			// }

		}
		
	},

	collapse: function(furniture){

		var objects = furniture.getObjects();
		if(this.explodeVectors.length != objects.length)
			return;

		for(var i = 0; i < objects.length; i++)
		{
			var subVector = this.explodeVectors[i];
			subVector.negate();
			objects[i].translateX(subVector.x);
			objects[i].translateY(subVector.y);
			objects[i].translateZ(subVector.z);
		}
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
		}

		//add the new one to the array
		var n_elmCenter = this.getCenterPoint(groupObj);
		var n_subVector = new THREE.Vector3();
		//n_subVector.subVectors(n_elmCenter, this.objCenter);
		//n_subVector.multiplyScalar(2);
		this.explodeVectors.push(n_subVector.clone());

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
		if ( this.onDownPosition.distanceTo( this.onUpPosition ) === 0 ) {

			if(this.onCtrlE == false) {
				//only select the furniture
				for(var i = 0; i < this.furnitures.length; i++) {
					var intersects = this.getIntersect( this.onUpPosition, this.furnitures[i].getFurniture());

					if ( intersects.length > 0 ) {

						this.furniture = this.furnitures[i];
						this.select(this.furniture.getFurniture());

						break;
					} else {
						//it also calls select, to detach
						this.select( null );
						this.furniture = null;
					}
				}
			}else{
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
					}
				} else {
					//it also calls select, to detach
					this.select( null );
				}
			}
		}
	},

	onMouseDown: function(event) {
		event.preventDefault();
		var array = this.getMousePosition( this.container, event.clientX, event.clientY );
		this.onDownPosition.fromArray( array );
		document.addEventListener( 'mouseup', this.onMouseUp.bind(this), false );
	},


	onMouseUp: function(event) {
		var array = this.getMousePosition( this.container, event.clientX, event.clientY );
		this.onUpPosition.fromArray( array );

		this.handleClick();

		document.removeEventListener( 'mouseup', this.onMouseUp.bind(this), false );
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
		// var array = this.getMousePosition( this.container, event.clientX, event.clientY );
		// this.onDoubleClickPosition.fromArray( array );

		// var intersects = this.getIntersects( this.onDoubleClickPosition, this.objects );

		// if ( intersects.length > 0 ) {

		// 	var intersect = intersects[ 0 ];

		// 	//focused

		// }
	},

	onKeyDown: function(event) {
		var keyCode = event.which;
		//event.ctrlKey && 
		if(keyCode == 69 && this.onCtrlE == false && this.furniture != undefined){  
			this.onCtrlE = true;
			//enable explosion sview
			if(this.furniture  != null )
				this.explode(this.furniture);
			
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

		}

		document.removeEventListener( 'keyup', this.onKeyUp.bind(this), false );
	},



	//here to put all the operations available
	applyDesign: function() {

		//assume the furnitures are annoted well and get ready
		//add the corners to the labeled and axised components
		/*
		for(var i = 0; i < this.furnitures.length; i++) {
			this.furnitures[i].addCorners();
			this.furnitures[i].addtoPoint();

			//this.scene.add(this.furnitures[i].points);
		}
		*/

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

		$('.operations.operation_chair_align').hide();
		$('.operations.operation_chair_add').hide();
		$('.operations.operation_chair_rebuild').hide();


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

		


		

	}

};


document.addEventListener('DOMContentLoaded', function(event){
	let main = new Main();
	main.init();
	let ui = new Ui(main);
	ui.init();
	
})


