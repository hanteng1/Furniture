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
	this.container = document.getElementById('container');
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

	//obj transform controller
	this.transformControls = null;
	this.box = new THREE.Box3();
	this.selectionBox = new THREE.BoxHelper();

	//mouse pick
	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();
	this.onDownPosition = new THREE.Vector2();
	this.onUpPosition = new THREE.Vector2();
	this.onDoubleClickPosition = new THREE.Vector2();
	this.onCtrlE = false;

	//store pieces of mesh
	this.objects = [];

	//for explode vectors
	this.explodeVectors = [];
	this.objCenter = new THREE.Vector3();

	//for multi selection
	this.selectionBoxes = [];


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

		var ccc = 0;
		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) {
				scope.addGeometry( child.geometry );
				
				scope.objects.push(child);
				scope.addHelper( child ); //to visualize helpers
			}

			if ( child.material !== undefined ) scope.addMaterial( child.material );
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

		if(this.onCtrlE == false)
		{
			//single select
			this.addTransformControl(this.selected);
		}else{
			//multi select for merge
			this.addMultiSelection(this.selected);
		}
		

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
	},

	addMultiSelection: function(object){
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

			}
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


	getCenterPoint: function(mesh){
		var geometry = mesh.geometry;
		geometry.computeBoundingBox();
		var center = geometry.boundingBox.getCenter();
		mesh.localToWorld(center);
		return center;
	},

	explode: function(objects){
		//compute the furniture's center
		//log(objects.length);

		this.objCenter = new THREE.Vector3();

		for(var itro = 0; itro < objects.length; itro++)
		{
			var elmCenter = this.getCenterPoint(objects[itro]);
			//console.log(center);
			this.objCenter.add(elmCenter);
		}
		this.objCenter.divideScalar(objects.length);
		
		this.explodeVectors = [];
		for(var i = 0; i < objects.length; i++)
		{
			var elmCenter = this.getCenterPoint(objects[i]);
			
			var subVector = new THREE.Vector3();
			subVector.subVectors(elmCenter, this.objCenter);
			subVector.multiplyScalar(15);
			this.explodeVectors.push(subVector.clone());

			objects[i].translateX(subVector.x);
			objects[i].translateY(subVector.y);
			objects[i].translateZ(subVector.z);

		}
		
	},

	collapse: function(objects){

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

	mergeObjs: function(objects, explodeVectors, indices){
		if(objects.length != explodeVectors.length)
			return;

		if(indices.length == 0)
			return;

		//get the selected obj back to orignal positions
		for(var i = 0; i < indices.length; i++)
		{
			var objIndex = indices[i];
			var subVector = explodeVectors[objIndex];
			subVector.negate();
			objects[objIndex].translateX(subVector.x);
			objects[objIndex].translateY(subVector.y);
			objects[objIndex].translateZ(subVector.z);
		}

		//merge the selected objs into a single obj
		var geometry = new THREE.BufferGeometry();
		for(var i = 0; i < indices.length; i++)
		{
			var objIndex = indices[i];
			geometry.merge(objects[objIndex].geometry, 0);
		}
		var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 });
		var mergedObj = new THREE.Mesh(geometry, material);

		//delete old ones and add new ones
		indices.sort(function(a, b){ return b - a;});
		for(var i = 0; i < indices.length; i++)
		{
			var objIndex = indices[i];
			objects.splice(objIndex,1);
			explodeVectors.splice(objIndex,1);
		}

		//delete from scene

		var n_elmCenter = this.getCenterPoint(mergedObj);
		var n_subVector = new THREE.Vector3();
		n_subVector.subVectors(n_elmCenter, this.objCenter);
		n_subVector.multiplyScalar(15);
		explodeVectors.push(n_subVector.clone());

		mergedObj.translateX(n_subVector.x);
		mergedObj.translateY(n_subVector.y);
		mergedObj.translateZ(n_subVector.z);

		objects.push(mergedObj);
		this.scene.add(mergedObj);

	},

	//mouse events
	getIntersects: function(point, objects) {
		this.mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
		this.raycaster.setFromCamera( this.mouse, this.camera );
		return this.raycaster.intersectObjects( objects );
	},

	getMousePosition: function(dom, x, y)
	{
		var rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];
	},


	handleClick: function()
	{
		if ( this.onDownPosition.distanceTo( this.onUpPosition ) === 0 ) {
			var intersects = this.getIntersects( this.onUpPosition, this.objects );

			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;

				if ( object.userData.object !== undefined ) {
					this.select( object.userData.object );
				} else {
					this.select( object );
				}
			} else {
				this.select( null );
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
		var array = this.getMousePosition( this.container, event.clientX, event.clientY );
		this.onDoubleClickPosition.fromArray( array );

		var intersects = this.getIntersects( this.onDoubleClickPosition, this.objects );

		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];

			//focused

		}
	},

	onKeyDown: function(event) {
		var keyCode = event.which;
		if(event.ctrlKey && keyCode == 69 && this.onCtrlE == false){
			this.onCtrlE = true;

			//enable explosion sview
			this.explode(this.objects);
			
		}

		document.addEventListener( 'keyup', this.onKeyUp.bind(this), false );
	},

	onKeyUp: function(event) {

		if(this.onCtrlE == true)
		{
			this.onCtrlE = false;

			//disable explosion view 
			this.collapse(this.objects);

			if(this.selectionBoxes.length > 0)
			{
				for(var i = 0; i < this.selectionBoxes.length; i++)
				{
					this.removeFromScene(this.selectionBoxes[i]);
				}
			}

		}

		document.removeEventListener( 'keyup', this.onKeyUp.bind(this), false );
	}

};


document.addEventListener('DOMContentLoaded', function(event){
	let main = new Main();
	main.init();
	let ui = new Ui(main);
	ui.init();
	
})


