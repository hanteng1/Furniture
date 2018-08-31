"use strict;"

function MarkSize( main , TargetObj ){

	var Box 		= new THREE.Box3();
	var objCenter  	= new THREE.Vector3();
	var objSize		= new THREE.Vector3();
	var FuniBox 	= new THREE.Box3();
	var FuniCenter	= new THREE.Vector3();
	//store objects position array
	var PosArr		= [];

	//detect the funiture component
	for(var i = main.furnitures.length - 1; i > -1; i -- ){ 
		var object =  main.furnitures[i].getFurniture();
		
		if(object.isObject3D){
			//get object center
			Box.setFromObject(object);
			Box.getCenter(objCenter);

			PosArr.push(objCenter.x);
			PosArr.push(objCenter.y);
			PosArr.push(objCenter.z);
		}
	}
	for(var i = main.Sceneobjects.length - 1; i > -1; i -- ){
		var object =  main.Sceneobjects[i];
		//get object center
		Box.setFromObject(object);
		Box.getCenter(objCenter);

		PosArr.push(objCenter.x);
		PosArr.push(objCenter.y);
		PosArr.push(objCenter.z);
	}

	//set funiture bounding box , box center
	FuniBox.setFromArray( PosArr );
	FuniBox.getCenter(FuniCenter);
	
	//get object center
	Box.setFromObject(TargetObj);
	Box.getCenter(objCenter);
	Box.getSize(objSize);

	// face to the user
	if( objCenter.z >= FuniCenter.z ){
		//show size number
		loadText( 	main , 
					objSize.x ,
					new THREE.Vector3(objCenter.x ,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2 + 1), 
					0 );
		//show line
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x - objSize.x/2 ,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2 + 1) , 
					new THREE.Vector3(objCenter.x + objSize.x/2 ,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2 + 1) );
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x - objSize.x/2 ,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2 + 0.5) , 
					new THREE.Vector3(objCenter.x - objSize.x/2 ,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2 + 1.5) );
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x + objSize.x/2 ,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2 + 0.5) , 
					new THREE.Vector3(objCenter.x + objSize.x/2 ,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2 + 1.5) );
		//right to the user
		if ( objCenter.x > FuniCenter.x ){
			//show high
			loadText( 	main , 
						objSize.y ,
						new THREE.Vector3(objCenter.x + objSize.x/2 +1,
										  objCenter.y ,
										  objCenter.z + objSize.z/2 +1, ), 
						45 );
			//show line
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +1,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z + objSize.z/2 +1) , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +1,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z + objSize.z/2 +1) );
			//show line
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +0.5,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z + objSize.z/2 +0.5) , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +1.5,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z + objSize.z/2 +1.5) );
			//show line
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +0.5,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z + objSize.z/2 +0.5) , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +1.5,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z + objSize.z/2 +1.5) );
		}
		else{//left to the user
			//show high
			loadText( 	main , 
						objSize.y ,
						new THREE.Vector3(objCenter.x - objSize.x/2 -1,
										  objCenter.y ,
										  objCenter.z + objSize.z/2 +1, ), 
						-45 );
			//show line
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -1,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z + objSize.z/2 +1) , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -1,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z + objSize.z/2 +1) );
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -0.5,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z + objSize.z/2 +0.5) , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -1.5,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z + objSize.z/2 +1.5) );
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -0.5,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z + objSize.z/2 +0.5) , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -1.5,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z + objSize.z/2 +1.5) );
		}
	}

	else{// back to the user
		//show size number
		loadText( 	main , 
					objSize.x ,
					new THREE.Vector3(objCenter.x ,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2 - 1), 
					180 );
		//show line
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x - objSize.x/2,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2 - 1) , 
					new THREE.Vector3(objCenter.x + objSize.x/2,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2 - 1) );
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x - objSize.x/2,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2 - 0.5) , 
					new THREE.Vector3(objCenter.x - objSize.x/2,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2 - 1.5) );
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x + objSize.x/2,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2 - 0.5) , 
					new THREE.Vector3(objCenter.x + objSize.x/2,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2 - 1.5) );

		//right to the user
		if ( objCenter.x > FuniCenter.x ){
			//show high
			loadText( 	main , 
						objSize.y ,
						new THREE.Vector3(objCenter.x + objSize.x/2 +1,
										  objCenter.y ,
										  objCenter.z - objSize.z/2 -1 ), 
						135 );
			//show line
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +1,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z - objSize.z/2 -1) , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +1,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z - objSize.z/2 -1) );
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +0.5,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z - objSize.z/2 -0.5) , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +1.5,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z - objSize.z/2 -1.5) );
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +0.5,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z - objSize.z/2 -0.5) , 
						new THREE.Vector3(objCenter.x + objSize.x/2 +1.5,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z - objSize.z/2 -1.5) );
		}
		else{//left to the user
			//show high
			loadText( 	main , 
						objSize.y ,
						new THREE.Vector3(objCenter.x - objSize.x/2 -1,
										  objCenter.y ,
										  objCenter.z - objSize.z/2 -1, ), 
						225 );
			//show line
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -1,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z - objSize.z/2 -1) , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -1,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z - objSize.z/2 -1) );
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -0.5,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z - objSize.z/2 -0.5) , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -1.5,
										  objCenter.y - objSize.y/2 ,
										  objCenter.z - objSize.z/2 -1.5) );
			loadLine( 	main , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -0.5,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z - objSize.z/2 -0.5) , 
						new THREE.Vector3(objCenter.x - objSize.x/2 -1.5,
										  objCenter.y + objSize.y/2 ,
										  objCenter.z - objSize.z/2 -1.5) );
		}
	}


	//right to the user
	if ( objCenter.x > FuniCenter.x ){
		//show size number
		loadText( 	main , 
					objSize.z ,
					new THREE.Vector3(objCenter.x + objSize.x/2 +1,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z ), 
					90 );
		//show line
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x + objSize.x/2 +1,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2) , 
					new THREE.Vector3(objCenter.x + objSize.x/2 +1,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2) );
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x + objSize.x/2 +0.5,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2) , 
					new THREE.Vector3(objCenter.x + objSize.x/2 +1.5,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2) );
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x + objSize.x/2 +0.5,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2) , 
					new THREE.Vector3(objCenter.x + objSize.x/2 +1.5,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2) );
	}
	else{//left to the user
		//show size number
		loadText( 	main , 
					objSize.z ,
					new THREE.Vector3(objCenter.x - objSize.x/2 -1,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z ), 
					270 );
		//show line
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x - objSize.x/2 -1,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2) , 
					new THREE.Vector3(objCenter.x - objSize.x/2 -1,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2) );
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x - objSize.x/2 -0.5,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2) , 
					new THREE.Vector3(objCenter.x - objSize.x/2 -1.5,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z - objSize.z/2) );
		loadLine( 	main , 
					new THREE.Vector3(objCenter.x - objSize.x/2 -0.5,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2) , 
					new THREE.Vector3(objCenter.x - objSize.x/2 -1.5,
									  objCenter.y - objSize.y/2 ,
									  objCenter.z + objSize.z/2) );
	}

}
function loadText(main , num , position , rotat){
	var text = (Math.round(num*10)/100).toString();
	var loader = new THREE.FontLoader();
	var font = loader.load(
		// resource URL
		'three.js-master/examples/fonts/helvetiker_regular.typeface.json',

		// onLoad callback
		function ( font ) {
			var geometry = new THREE.TextGeometry( text , {
				font: font ,
				size: 0.3,
				height: 0.05,
				curveSegments: 12,
				bevelEnabled: false,
				bevelThickness: 5,
				bevelSize: 4,
				bevelSegments: 1
			} );

			var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
			var mesh = new THREE.Mesh( geometry, material );

			mesh.position.set( position.x , position.y +0.5 , position.z );
			mesh.rotateOnWorldAxis(new THREE.Vector3(0,1,0) , rotat * Math.PI/180);
			main.scene.add( mesh );
			main.SizeObj.push( mesh );
		}
	);

}
function loadLine( main , point1 , point2){

		var material = new THREE.LineBasicMaterial({
			color: 0x000000,
			linewidth: 10,
			linecap: 'round', //ignored by WebGLRenderer
			linejoin:  'round' //ignored by WebGLRenderer
		});

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( point1.x , point1.y , point1.z ),
			new THREE.Vector3( point2.x , point2.y , point2.z )
		);

		var line = new THREE.Line( geometry, material );
		main.scene.add( line );
		main.SizeObj.push(line);
}

module.exports = MarkSize;
