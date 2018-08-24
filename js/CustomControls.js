"use strict;"

//this is the controller to comine first person and orbit
//naviation while users still can operate the object

THREE.CustomControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;


	//////////////////////////////target rotating view

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	//siwch betwen first person rotate and target centered rotate
	this.targetFocused = false;

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons, rotate includes frist person rotate and object centered rotate
	this.mouseButtons = { ROTATE: THREE.MOUSE.LEFT, PAN: THREE.MOUSE.RIGHT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;



	//////////////////////////////first person view
	this.movementSpeed = 1.0;
	this.lookSpeed = 0.0005;

	this.lookVertical = true;
	this.autoForward = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = 0;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;

	this.mouseDragOn = false;
	this.mouseDragStartX = 0;
	this.mouseDragStartY = 0;

	this.viewHalfX = 0;
	this.viewHalfY = 0;




	//public class
	this.getPolarAngle = function () {

		return spherical.phi;

	};

	this.getAzimuthalAngle = function () {

		return spherical.theta;

	};

	this.saveState = function () {

		scope.target0.copy( scope.target );
		scope.position0.copy( scope.object.position );
		scope.zoom0 = scope.object.zoom;

	};

	//take care of reset later
	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.tg_update();

		state = STATE.NONE;

	};

	this.tg_update = function () {
		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().inverse();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function update() {

			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis
			spherical.setFromVector3( offset );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			// restrict theta to be between desired limits
			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

			// restrict phi to be between desired limits
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

			spherical.makeSafe();


			spherical.radius *= scale;

			// restrict radius to be between desired limits
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			// move target to panned location
			//scope.target.add( panOffset );

			offset.setFromSpherical( spherical );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );

				//panOffset.multiplyScalar( 1 - scope.dampingFactor );

			} else {

				sphericalDelta.set( 0, 0, 0 );

				//panOffset.set( 0, 0, 0 );

			}

			scale = 1;

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( //zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				//zoomChanged = false;

				return true;

			}

			return false;

		};
	}();


	this.fp_update = function() {

		if ( this.enabled === false ) return;

		if ( this.heightSpeed ) {

			var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;

			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

		} else {

			this.autoSpeedFactor = 0.0;

		}

		var actualMoveSpeed = this.movementSpeed;

		if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
		if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );

		if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
		if ( this.moveRight ) this.object.translateX( actualMoveSpeed );

		if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
		if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

		var actualLookSpeed = this.lookSpeed;

		if ( ! this.activeLook ) {

			actualLookSpeed = 0;

		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		this.lon += this.mouseX * actualLookSpeed;

		if ( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;


		//console.log(this.lon + " , " + this.lat);


		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );

		this.theta = THREE.Math.degToRad( this.lon );



		if ( this.constrainVertical ) {

			this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

		}

		var targetPosition = this.target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );

		this.object.lookAt( targetPosition );

	};


	this.dispose = function () {

		//scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		//scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );

		//scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		//scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		//scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		//window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};


	//internal methods

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE: - 1, FPROTATE: 0, TGROTATE: 1 };

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	var scale = 1;
	//var panOffset = new THREE.Vector3();
	//var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	// var panStart = new THREE.Vector2();
	// var panEnd = new THREE.Vector2();
	// var panDelta = new THREE.Vector2();

	// var dollyStart = new THREE.Vector2();
	// var dollyEnd = new THREE.Vector2();
	// var dollyDelta = new THREE.Vector2();



	/////////////////////////////////////////////////////////////
	//tgrotate functions

	function tGRotateLeft( angle ) {

		sphericalDelta.theta -= angle;

	}

	function tGRotateUp( angle ) {

		sphericalDelta.phi -= angle;

	}


	function handleMouseDownTGRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveTGRotate( event ) {

		//console.log( 'handleMouseMoveRotate' );

		rotateEnd.set( event.clientX, event.clientY );

		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		tGRotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height

		tGRotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

		rotateStart.copy( rotateEnd );

		scope.tg_update();

	}


	///////////////////////////////////////////////////////
	//fprotate functions

	function handleMouseDownFPRotate (event) {
		//this.mouseDragOn = true; 
		scope.mouseDragStartX = event.pageX;
		scope.mouseDragStartY = event.pageY;
	}


	function handleMouseMoveFPRotate (event) {
		scope.mouseX = scope.mouseDragStartX - event.pageX;
		scope.mouseY = scope.mouseDragStartY - event.pageY ;

		scope.mouseDragStartX = event.pageX;
		scope.mouseDragStartY = event.pageY;

		scope.fp_update();
	}



	function handleMouseUp( event ) {

		// console.log( 'handleMouseUp' );

		//this.mouseDragOn = false; 
		scope.mouseX = 0;
		scope.mouseY = 0;

	}


	///////////////////////////////////////////////////////



	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( event.button ) {

			case scope.mouseButtons.ROTATE:

				if(scope.targetFocused) {

					handleMouseDownTGRotate( event );
					state = STATE.TGROTATE;
				
				}else {
					handleMouseDownFPRotate( event );
					state = STATE.FPROTATE;
				}

				break;

			// case scope.mouseButtons.ZOOM:

			// 	if ( scope.enableZoom === false ) return;

			// 	handleMouseDownDolly( event );

			// 	state = STATE.DOLLY;

			// 	break;

			// case scope.mouseButtons.PAN:

			// 	if ( scope.enablePan === false ) return;

			// 	handleMouseDownPan( event );

			// 	state = STATE.PAN;

			// 	break;

		}

		console.log(state);

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );

			scope.dispatchEvent( startEvent );

		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		switch ( state ) {

			case STATE.TGROTATE:
				handleMouseMoveTGRotate( event );
				break;

			case STATE.FPROTATE:
				handleMouseMoveFPRotate( event );
				break;

			// case STATE.DOLLY:

			// 	if ( scope.enableZoom === false ) return;

			// 	handleMouseMoveDolly( event );

			// 	break;

			// case STATE.PAN:

			// 	if ( scope.enablePan === false ) return;

			// 	handleMouseMovePan( event );

			// 	break;

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		handleMouseUp( event );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	//scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	//scope.domElement.addEventListener( 'wheel', onMouseWheel, false );

	//scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	//scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	//scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	//window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start
	//this.tg_update();



};


THREE.CustomControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.CustomControls.prototype.constructor = THREE.CustomControls;





