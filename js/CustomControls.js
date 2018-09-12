"use strict;"

//this is the controller to comine first person and orbit
//naviation while users still can operate the object

THREE.CustomControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	this.transiting = false;
	this.lerpIndex = 0;

	this.lerpStartPos;
	this.lerpStartLookatDir;

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


	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.panSpeed = 1.0;
	this.screenSpacePanning = false; // if true, pan in screen-space
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push


	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons, rotate includes frist person rotate and object centered rotate
	this.mouseButtons = { ROTATE: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;
	this.lookatDir0 = new THREE.Vector3(0, -3.55067, -87.86557);

	//////////////////////////////first person view

	//attention, this is different from target
	this.fp_target = new THREE.Vector3( 0, 0, 0 );

	this.movementSpeed = 20.0;
	this.lookSpeed = 0.05;

	this.lookVertical = true;
	this.autoForward = false;

	this.activeLook = true;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = true;
	this.verticalMin = 1.0;
	this.verticalMax = 2.0;//Math.PI;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = -50;
	this.lon = -90;
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

		this.target0.copy( this.target );
		this.position0.copy( this.object.position );
		this.zoom0 = this.object.zoom;
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


	//switch views
	this.switchView2TG = function() {
		// console.log("switchView2TG");
		if(scope.targetFocused == false) {
			scope.targetFocused = true;
			// console.log("targetFocused = true");
			//copy target position
			//scope.target

			scope.target.copy(scope.fp_target);


			//problem
			//it will make a sudden jump
			scope.tg_update();

			scope.target.copy(new THREE.Vector3(0, 0, -30));
		}

		
	};


	this.switchView2FP = function() {

		if(scope.targetFocused == true) {
			scope.targetFocused = false;

			//switch back to the original position
			//target lookatDir
			this.lon = -90;
			if ( this.lookVertical ) this.lat = -50;

			this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
			

			//update the fp_target
			this.phi = THREE.Math.degToRad( 90 - this.lat );
			this.theta = THREE.Math.degToRad( this.lon );

			if ( this.constrainVertical ) {

				this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );

			}

			var targetPosition = this.fp_target,
				position = scope.position0; //this.object.position;

			targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
			targetPosition.y = position.y + 100 * Math.cos( this.phi );
			targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
			//console.log(targetPosition);


			scope.lerpIndex = 0;

			//position
			scope.lerpStartPos = new THREE.Vector3();
			scope.lerpStartPos.copy(scope.object.position);

			//look at, problem. this is normalize

			//this is where the problem is
			//direction is not the lookatdir

			scope.lerpStartLookatDir = new THREE.Vector3();
			scope.object.getWorldDirection( scope.lerpStartLookatDir );
			scope.lerpStartLookatDir.multiplyScalar(90);

			//console.log(scope.lerpStartLookatDir);

			scope.transiting = true;
		}
		
	};


	//this is run in render loop
	this.applyTransition = function() {
		
		if(scope.transiting == true) {
			scope.transiteCamera(scope.lerpStartPos, scope.lerpStartLookatDir, scope.position0, scope.lookatDir0);
		}

	}


	this.transiteCamera = function(startPos, startLookatDir, targetPos, targetLookatDir) {

		scope.lerpIndex += 0.02;


		var curLookatDir = new THREE.Vector3();
		curLookatDir.copy(startLookatDir);
		curLookatDir.lerp(targetLookatDir, scope.lerpIndex);

		
		var curPos = new THREE.Vector3();
		curPos.copy(startPos);
		curPos.lerp(targetPos, scope.lerpIndex);


		//set position
		scope.object.position.copy(curPos);
		//set lookat
		scope.object.lookAt( curLookatDir );

		//console.log(scope.lerpIndex);
		//console.log(curLookatDir);

		if(scope.lerpIndex >= 1.0) {
			
			scope.transiting = false;
		}

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
			scope.target.add( panOffset );

			offset.setFromSpherical( spherical );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );

				panOffset.multiplyScalar( 1 - scope.dampingFactor );

			} else {

				sphericalDelta.set( 0, 0, 0 );

				panOffset.set( 0, 0, 0 );

			}

			scale = 1;

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

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

		var targetPosition = this.fp_target,
			position = this.object.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
		//console.log(targetPosition);

		this.object.lookAt( targetPosition );

	};


	this.dispose = function () {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );

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

	var STATE = { NONE: - 1, FPROTATE: 0, TGROTATE: 1, FPPAN: 2, TGPAN: 3, TGDOLLY: 4};

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();



	/////////////////////////////////////////////////////////////
	//tgrotate functions

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function tGRotateLeft( angle ) {

		sphericalDelta.theta -= angle;

	}

	function tGRotateUp( angle ) {

		sphericalDelta.phi -= angle;

	}

	var panLeft = function () {

		var v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}();

	var panUp = function () {

		var v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			if ( scope.screenSpacePanning === true ) {

				v.setFromMatrixColumn( objectMatrix, 1 );

			} else {

				v.setFromMatrixColumn( objectMatrix, 0 );
				v.crossVectors( scope.object.up, v );

			}

			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function () {

		var offset = new THREE.Vector3();

		return function pan( deltaX, deltaY ) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if ( scope.object.isPerspectiveCamera ) {

				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we use only clientHeight here so aspect ratio does not distort speed
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

			} else if ( scope.object.isOrthographicCamera ) {

				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

			} else {

				// camera neither orthographic nor perspective
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;

			}

		};

	}();


	function dollyIn( dollyScale ) {

		if ( scope.object.isPerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object.isOrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	function dollyOut( dollyScale ) {

		if ( scope.object.isPerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object.isOrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}


	function handleMouseDownTGRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownTGDolly( event ) {

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set( event.clientX, event.clientY );

	}


	function handleMouseDownTGPan( event ) {

		//console.log( 'handleMouseDownPan' );

		panStart.set( event.clientX, event.clientY );

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

	function handleMouseMoveTGDolly( event ) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyIn( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyOut( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.tg_update();

	}

	function handleMouseMoveTGPan( event ) {

		//console.log( 'handleMouseMovePan' );

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.tg_update();

	}

	function handleMouseTGWheel( event ) {

		// console.log( 'handleMouseWheel' );

		if ( event.deltaY < 0 ) {

			dollyOut( getZoomScale() );

		} else if ( event.deltaY > 0 ) {

			dollyIn( getZoomScale() );

		}

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

			case scope.mouseButtons.ZOOM:
				if(scope.targetFocused) {
					handleMouseDownTGDolly( event );
					state = STATE.TGDOLLY;
				}else {

				}
				

				break;

			case scope.mouseButtons.PAN:

				if(scope.targetFocused) {
					handleMouseDownTGPan( event );
					state = STATE.TGPAN;
				}else {
					
				}

				break;

		}

		//console.log(state);

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

			case STATE.TGDOLLY:
				handleMouseMoveTGDolly( event );
				break;

			case STATE.TGPAN:
				handleMouseMoveTGPan( event );
				break;

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


	function onMouseWheel( event ) {
		// console.log("onMouseWheel");
		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

		event.preventDefault();
		event.stopPropagation();

		scope.dispatchEvent( startEvent );


		if(scope.targetFocused) {
			// console.log("targetFocused");
			handleMouseTGWheel( event );
		}else{
			//make a first person view move forward or backward
			// console.log("scope.targetFocused");
			// console.log(scope.targetFocused);
		}


		scope.dispatchEvent( endEvent );

	}

	function onContextMenu( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

	}


	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'wheel', onMouseWheel, false );

	//scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	//scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	//scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	//window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start
	this.fp_update();


};


THREE.CustomControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.CustomControls.prototype.constructor = THREE.CustomControls;





