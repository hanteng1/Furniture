const {log, status} = require('./log')
const csgToGeometries = require('./csgToGeometries')
const {geometryToCsgs, unionCsgs} = require('./geometryToCsgs')
const {hinge, addHinge} = require('./processor')
const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations


function Main()
{
	//only stores data
	this.scene = new THREE.Scene();
	this.scene.background = new THREE.Color(0xf0f0f0);
	this.geometries = {};
	this.materials = {};
	this.selected = null;
	this.helpers = {};
	//this.sceneHelpers = new THREE.Scene();
	this.stats = new Stats();
	this.camera = new THREE.PerspectiveCamera (45, window.innerWidth / window.innerHeight, 1, 10000);
	this.renderer = new THREE.WebGLRenderer( { antialias: true } );
	this.control = null;

	this.transformControls = null;
	this.box = new THREE.Box3();
	this.selectionBox = new THREE.BoxHelper();
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

		var container = document.getElementById('container');

		this.camera.position.set(250, 400, 650);
		this.camera.lookAt(new THREE.Vector3());

		var ambientLight = new THREE.AmbientLight( 0xccccc, 0.4);
		this.scene.add(ambientLight);

		var pointLight = new THREE.PointLight(0xffffff, 0.8);
		this.camera.add(pointLight);
		this.scene.add(this.camera);

		var gridHelper = new THREE.GridHelper( 1000, 20 ) ;//size, divisions
		this.scene.add( gridHelper );

		
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( this.renderer.domElement );

		//container.appendChild( this.stats.dom )
		window.addEventListener( 'resize', this.onWindowResize.bind(this), false );

		this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		this.controls.addEventListener( 'change', this.render.bind(this) );
		this.controls.minDistance = 1;
		this.controls.maxDistance = 10000;
		this.controls.enablePan = true;


		this.transformControls = new THREE.TransformControls(this.camera, this.renderer.domElement);
		this.transformControls.addEventListener('change', this.render.bind(this));
		this.scene.add(this.transformControls);

		this.selectionBox.material.depthTest = false;
		this.selectionBox.material.transparent = true;
		this.selectionBox.visible = false;
		this.scene.add( this.selectionBox );

		this.animate();
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


	addObject: function ( object ) {

		var scope = this;

		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

			scope.addHelper( child ); //to visualize helpers

		} );

		this.scene.add( object );

		this.select(object);

	},

	addGeometry: function ( geometry ) {

		this.geometries[ geometry.uuid ] = geometry;
	},

	addMaterial: function ( material ) {

		this.materials[ material.uuid ] = material;

	},


	addHelper: function () {

		var geometry = new THREE.SphereBufferGeometry( 2, 4, 2 );
		var material = new THREE.MeshBasicMaterial( { color: 0xff0000, visible: false } );

		return function ( object ) {

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

			} else {

				// no helper for this object type
				return;

			}

			var picker = new THREE.Mesh( geometry, material );
			picker.name = 'picker';
			picker.userData.object = object;
			helper.add( picker );

			this.scene.add( helper );
			this.helpers[ object.id ] = helper;

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
		this.addTransformControl(this.selected);

	},

	addTransformControl: function(object){
		this.selectionBox.visible = false;
		this.transformControls.detach();

		if ( object !== null && object !== this.scene && object !== this.camera ) {

			this.box.setFromObject( object );

			if ( this.box.isEmpty() === false ) {

				this.selectionBox.setFromObject( object );
				this.selectionBox.visible = true;

			}

			this.transformControls.attach( object );


		}
	}

};


document.addEventListener('DOMContentLoaded', function(event){
	let main = new Main();
	main.init();
	let ui = new Ui(main);
	ui.init();
	
})


