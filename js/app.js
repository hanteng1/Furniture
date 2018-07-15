window.onload = function()
{
	
	if(!Detector.webgl) Detector.addGetWebGLMessage();

	var camera, scene, renderer, stats;
	var plane;


	init();
	animate();

	function init(){

		var container = document.getElementById('container');

		camera = new THREE.PerspectiveCamera (45, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.set( 500, 800, 1300 );
		camera.lookAt(new THREE.Vector3());

		scene = new THREE.Scene();
		scene.background = new THREE.Color(0xf0f0f0);

		var ambientLight = new THREE.AmbientLight( 0xccccc, 0.4);
		scene.add(ambientLight);

		var pointLight = new THREE.PointLight(0xffffff, 0.8);
		camera.add(pointLight)
		scene.add(camera);


		var gridHelper = new THREE.GridHelper( 1000, 20 );
		scene.add( gridHelper );

		var map = new THREE.TextureLoader().load('../three.js-master/examples/textures/roughness_map.jpg');
		map.wrapS = map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 16;

		var material = new THREE.MeshPhongMaterial({map: map, side: THREE.DoubleSide});

		var geometry, object;  //get an object from geometry

		geometry = new THREE.ParametricBufferGeometry(THREE.ParametricGeometries.klein, 10, 10);
		geometry.center();
		object = new THREE.Mesh(geometry, material);
		object.position.set(0, 0, 0);
		scene.add(object);

		//



		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( renderer.domElement );
		stats = new Stats();
		container.appendChild( stats.dom );
		window.addEventListener( 'resize', onWindowResize, false );

		var controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.addEventListener( 'change', render );
		controls.minDistance = 20;
		controls.maxDistance = 500;
		controls.enablePan = false;

		
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function animate(){
		requestAnimationFrame(animate);
		render();
		stats.update();
	}

	function render()
	{
		renderer.render(scene, camera);
	}

}