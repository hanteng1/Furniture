"use strict;"

var GizmoMaterial = function ( parameters ) {

	THREE.MeshBasicMaterial.call( this );

	this.depthTest = false;
	this.depthWrite = false;
	this.fog = false;
	this.side = THREE.FrontSide;
	this.transparent = true;

	this.setValues( parameters );

	this.oldColor = this.color.clone();
	this.oldOpacity = this.opacity;

	this.highlight = function ( highlighted ) {

		if ( highlighted ) {

			this.color.setRGB( 1, 1, 0 );
			this.opacity = 1;

		} else {

			this.color.copy( this.oldColor );
			this.opacity = this.oldOpacity;

		}

	};

};

GizmoMaterial.prototype = Object.create( THREE.MeshBasicMaterial.prototype );
GizmoMaterial.prototype.constructor = GizmoMaterial;

var GizmoLineMaterial = function ( parameters ) {

	THREE.LineBasicMaterial.call( this );

	this.depthTest = false;
	this.depthWrite = false;
	this.fog = false;
	this.transparent = true;
	this.linewidth = 1;

	this.setValues( parameters );

	this.oldColor = this.color.clone();
	this.oldOpacity = this.opacity;

	this.highlight = function ( highlighted ) {

		if ( highlighted ) {

			this.color.setRGB( 1, 1, 0 );
			this.opacity = 1;

		} else {

			this.color.copy( this.oldColor );
			this.opacity = this.oldOpacity;

		}

	};

};

GizmoLineMaterial.prototype = Object.create( THREE.LineBasicMaterial.prototype );
GizmoLineMaterial.prototype.constructor = GizmoLineMaterial;

var pickerMaterial = new GizmoMaterial( { visible: false, transparent: false } );

var Gizmo = function () {

	this.init = function () {

		THREE.Object3D.call( this );

		this.handles = new THREE.Object3D();
		this.pickers = new THREE.Object3D();

		this.add( this.handles );
		this.add( this.pickers );

		//// HANDLES AND PICKERS
		var setupGizmos = function ( gizmoMap, parent ) {

			for ( var name in gizmoMap ) {

				for ( i = gizmoMap[ name ].length; i --; ) {

					var object = gizmoMap[ name ][ i ][ 0 ];
					var position = gizmoMap[ name ][ i ][ 1 ];
					var rotation = gizmoMap[ name ][ i ][ 2 ];

					object.name = name;

					object.renderOrder = Infinity; // avoid being hidden by other transparent objects

					if ( position ) object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
					if ( rotation ) object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );

					parent.add( object );

				}

			}

		};

		setupGizmos( this.handleGizmos, this.handles );
		setupGizmos( this.pickerGizmos, this.pickers );

		// reset Transformations

		this.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				child.updateMatrix();

				var tempGeometry = child.geometry.clone();
				tempGeometry.applyMatrix( child.matrix );
				child.geometry = tempGeometry;

				child.position.set( 0, 0, 0 );
				child.rotation.set( 0, 0, 0 );
				child.scale.set( 1, 1, 1 );

			}

		} );

	};

	this.highlight = function ( axis ) {

		this.traverse( function ( child ) {

			if ( child.material && child.material.highlight ) {

				if ( child.name === axis ) {

					child.material.highlight( true );

				} else {

					child.material.highlight( false );

				}

			}

		} );

	};

};

Gizmo.prototype = Object.create( THREE.Object3D.prototype );
Gizmo.prototype.constructor = Gizmo;

Gizmo.prototype.update = function ( rotation, eye ) {

	var vec1 = new THREE.Vector3( 0, 0, 0 );
	var vec2 = new THREE.Vector3( 0, 1, 0 );
	var lookAtMatrix = new THREE.Matrix4();

	this.traverse( function ( child ) {

		if ( child.name.search( "E" ) !== - 1 ) {

			child.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) );

		} else if ( child.name.search( "X" ) !== - 1 || child.name.search( "Y" ) !== - 1 || child.name.search( "Z" ) !== - 1 ) {

			child.quaternion.setFromEuler( rotation );

		}

	} );

};

var NormalAxis = function() {
	Gizmo.call(this);
	
	var arrowGeometry = new THREE.ConeBufferGeometry( 0.05, 0.2, 12, 1, false );
	arrowGeometry.translate( 0, 0.5, 0 );

	var lineXGeometry = new THREE.BufferGeometry();
	lineXGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0 ], 3 ) );

	var lineYGeometry = new THREE.BufferGeometry();
	lineYGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 1, 0 ], 3 ) );

	var lineZGeometry = new THREE.BufferGeometry();
	lineZGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, 1 ], 3 ) );

	this.handleGizmos = {

		X: [
			[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
			[ new THREE.Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
		],

		Y: [
			[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
			[	new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
		],

		Z: [
			[ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
			[ new THREE.Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
		]

	};

	this.pickerGizmos = {

		X: [
			[ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
		],

		Y: [
			[ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
		],

		Z: [
			[ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
		]

	};

	this.init();

}

NormalAxis.prototype = Object.create(Gizmo.prototype );
NormalAxis.prototype.constructor = NormalAxis;


var AddAxis = function(camera, domElement) {
	THREE.Object3D.call( this );

	domElement = ( domElement !== undefined ) ? domElement : document;

	this.object = undefined;
	this.furniture = undefined;

	this.visible = false;
	this.translationSnap = null;
	this.rotationSnap = null;
	this.space = "local";
	this.size = 1;
	this.axis = null;

	var scope = this;

	var _mode = "normal_axis";
	var _dragging = false;
	var _gizmo = {
		"normal_axis" : new NormalAxis()
	};

	for ( var type in _gizmo ) {

		var gizmoObj = _gizmo[ type ];

		gizmoObj.visible = ( type === _mode );
		this.add( gizmoObj );

	}

	var changeEvent = { type: "change" };
	var mouseDownEvent = { type: "mouseDown" };
	var mouseUpEvent = { type: "mouseUp", mode: _mode };
	var objectChangeEvent = { type: "objectChange" };

	//see what i need later
	var ray = new THREE.Raycaster();
	var pointerVector = new THREE.Vector2();

	var point = new THREE.Vector3();
	var offset = new THREE.Vector3();

	var rotation = new THREE.Vector3();
	var offsetRotation = new THREE.Vector3();
	var scale = 1;

	var lookAtMatrix = new THREE.Matrix4();
	var eye = new THREE.Vector3();

	var tempMatrix = new THREE.Matrix4();
	var tempVector = new THREE.Vector3();
	var tempQuaternion = new THREE.Quaternion();

	var unitX = new THREE.Vector3( 1, 0, 0 );
	var unitY = new THREE.Vector3( 0, 1, 0 );
	var unitZ = new THREE.Vector3( 0, 0, 1 );

	this.units = {
		X: unitX,
		Y: unitY,
		Z: unitZ
	};

	var quaternionXYZ = new THREE.Quaternion();
	var quaternionX = new THREE.Quaternion();
	var quaternionY = new THREE.Quaternion();
	var quaternionZ = new THREE.Quaternion();
	var quaternionE = new THREE.Quaternion();

	var oldPosition = new THREE.Vector3();
	var oldScale = new THREE.Vector3();
	var oldRotationMatrix = new THREE.Matrix4();

	var parentRotationMatrix = new THREE.Matrix4();
	var parentScale = new THREE.Vector3();

	var worldPosition = new THREE.Vector3();
	var centerPosition = new THREE.Vector3();
	var worldRotation = new THREE.Euler();
	var worldRotationMatrix = new THREE.Matrix4();
	var camPosition = new THREE.Vector3();
	var camRotation = new THREE.Euler();

	domElement.addEventListener( "mousedown", onPointerDown, false );
	domElement.addEventListener( "touchstart", onPointerDown, false );

	domElement.addEventListener( "mousemove", onPointerHover, false );
	domElement.addEventListener( "touchmove", onPointerHover, false );

	//domElement.addEventListener( "mousemove", onPointerMove, false );
	//domElement.addEventListener( "touchmove", onPointerMove, false );

	domElement.addEventListener( "mouseup", onPointerUp, false );
	domElement.addEventListener( "mouseout", onPointerUp, false );
	domElement.addEventListener( "touchend", onPointerUp, false );
	domElement.addEventListener( "touchcancel", onPointerUp, false );
	domElement.addEventListener( "touchleave", onPointerUp, false );


	this.dispose = function () {

		domElement.removeEventListener( "mousedown", onPointerDown );
		domElement.removeEventListener( "touchstart", onPointerDown );

		domElement.removeEventListener( "mousemove", onPointerHover );
		domElement.removeEventListener( "touchmove", onPointerHover );

		//domElement.removeEventListener( "mousemove", onPointerMove );
		//domElement.removeEventListener( "touchmove", onPointerMove );

		domElement.removeEventListener( "mouseup", onPointerUp );
		domElement.removeEventListener( "mouseout", onPointerUp );
		domElement.removeEventListener( "touchend", onPointerUp );
		domElement.removeEventListener( "touchcancel", onPointerUp );
		domElement.removeEventListener( "touchleave", onPointerUp );

	};


	this.attach = function (furniture, object ) {
		this.furniture = furniture;
		this.object = object;
		this.visible = true;
		this.update();

	};

	this.detach = function () {

		this.object = undefined;
		this.visible = false;
		this.axis = null;

	};

	this.getMode = function () {

		return _mode;

	};

	this.setMode = function ( mode ) {

		_mode = mode ? mode : _mode;

		for ( var type in _gizmo ) _gizmo[ type ].visible = ( type === _mode );

		this.update();
		scope.dispatchEvent( changeEvent );

	};

	this.update = function () {

		if ( scope.object === undefined ) return;

		scope.object.updateMatrixWorld();
		worldPosition.setFromMatrixPosition( scope.object.matrixWorld );

		//instead of using worldposition, using object's center
		var box = new THREE.Box3();
		box.setFromObject(scope.object);
		if(box.isEmpty() === false)
		{
			box.getCenter(centerPosition);
		}else{
			console.log("error on getting center point");
		}


		worldRotation.setFromRotationMatrix( tempMatrix.extractRotation( scope.object.matrixWorld ) );

		camera.updateMatrixWorld();
		camPosition.setFromMatrixPosition( camera.matrixWorld );
		camRotation.setFromRotationMatrix( tempMatrix.extractRotation( camera.matrixWorld ) );

		//these are to set the positions and scale
		scale = worldPosition.distanceTo( camPosition ) / 6 * scope.size;
		//this.position.copy( worldPosition );
		this.position.copy(centerPosition);
		this.scale.set( scale, scale, scale );

		//console.log(worldPosition);
		//console.log(worldRotation);
		//console.log(scale);

		//these are to set the initial rotations
		if ( camera instanceof THREE.PerspectiveCamera ) {

			eye.copy( camPosition ).sub( worldPosition ).normalize();

		} else if ( camera instanceof THREE.OrthographicCamera ) {

			eye.copy( camPosition ).normalize();

		}

		if ( scope.space === "local" ) {
			//alighed to the object
			_gizmo[ _mode ].update( worldRotation, eye );

		} else if ( scope.space === "world" ) {
			//aligned to the world
			_gizmo[ _mode ].update( new THREE.Euler(), eye );

		}

		_gizmo[ _mode ].highlight( scope.axis );

	};


	function onPointerHover( event ) {

		if ( scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

		var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

		var intersect = intersectObjects( pointer, _gizmo[ _mode ].pickers.children );

		var axis = null;

		if ( intersect ) {

			axis = intersect.object.name;

			event.preventDefault();

		}

		if ( scope.axis !== axis ) {

			scope.axis = axis;
			scope.update();
			scope.dispatchEvent( changeEvent );

		}

	}

	function intersectObjects( pointer, objects ) {

		var rect = domElement.getBoundingClientRect();
		var x = ( pointer.clientX - rect.left ) / rect.width;
		var y = ( pointer.clientY - rect.top ) / rect.height;

		pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1 );
		ray.setFromCamera( pointerVector, camera );

		var intersections = ray.intersectObjects( objects, true );
		return intersections[ 0 ] ? intersections[ 0 ] : false;

	}

	//to select the normal axis
	function onPointerDown( event ) {
		if ( scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

		var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

		if ( pointer.button === 0 || pointer.button === undefined ) {

			var intersect = intersectObjects( pointer, _gizmo[ _mode ].pickers.children );

			if ( intersect ) {
				event.preventDefault();
				event.stopPropagation();
				scope.axis = intersect.object.name;

				//console.log(scope.axis);

				scope.dispatchEvent( mouseDownEvent );

				scope.update();

			}
		}

	}


	function onPointerUp( event ) {
		event.preventDefault(); // Prevent MouseEvent on mobile

		if ( event.button !== undefined && event.button !== 0 ) return;

		if ( _dragging && ( scope.axis !== null ) ) {

			mouseUpEvent.mode = _mode;
			scope.dispatchEvent( mouseUpEvent );

		}

		_dragging = false;

		//make the selection
		
		if(scope.axis !== null) {
			//hide the others
			for(var i = 0; i < _gizmo[ _mode ].handles.children.length; i++) {
				var child = _gizmo[ _mode ].handles.children[i];
				if(child.name !== scope.axis) {
					child.visible = false;
				}
			}

			//send the vector info to the furniture
			scope.furniture.setNormalAxis(scope.object.name, scope.units[scope.axis]);
		}		
		


		if ( 'TouchEvent' in window && event instanceof TouchEvent ) {

			// Force "rollover"

			scope.axis = null;
			scope.update();
			scope.dispatchEvent( changeEvent );

		} else {

			onPointerHover( event );

		}
	}


}


AddAxis.prototype = Object.create(THREE.Object3D.prototype);
AddAxis.prototype.constructor = AddAxis;




