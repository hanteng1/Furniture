
//modules
const scadApi = requrie('@jscad/scad-api')
const {difference} = scadApi.booleanOps
const {scale} = scadApi.transformations

// var container = null
// var camera = null
// var scene = null
// var renderer = null
// var stats = null

function jscadLogo (size = 10) {
  return union(
      difference(
         cube({size: 3, center: true}),
         sphere({r: 2, center: true})
      ),
      intersection(
          sphere({r: 1.3, center: true}),
          cube({size: 2.1, center: true})
      )
   ).translate([0, 0, 1.5]).scale(size)
}

function coneWithCutouts () {
  return intersection(
    difference(
      union(
        cube({size: [30, 30, 30], center: true}),
        translate([0, 0, -25],
        cube({size: [15, 15, 50], center: true}))
      ),
      union(
        cube({size: [50, 10, 10], center: true}),
        cube({size: [10, 50, 10], center: true}),
        cube({size: [10, 10, 50], center: true})
      )
    ),
    translate([0, 0, 5], cylinder({h: 50, r1: 20, r2: 5, center: true})))
}

// window.onload = function()
// {
// 	if(!Detector.webgl) Detector.addGetWebGLMessage()

// 	init()
// 	animate()

	

// 	function onWindowResize() {
// 		camera.aspect = window.innerWidth / window.innerHeight
// 		camera.updateProjectionMatrix()
// 		renderer.setSize( window.innerWidth, window.innerHeight )
// 	}

// 	function animate(){
// 		requestAnimationFrame(animate)
// 		render()
// 		stats.update()
// 	}

// 	function render()
// 	{
// 		renderer.render(scene, camera)
// 	}

// 	var center = new THREE.Vector3()

// 	//load model function
// 	function loadModel ()
// 	{
// 		var material = new THREE.MeshLambertMaterial()


// 		var loader = new THREE.OBJLoader()
// 		loader.load('../models/Polantis_Stickley_Chair_01.obj', function(object){
// 			object.traverse( function ( child ) {
// 				if ( child instanceof THREE.Mesh ) {
// 					child.material = material
// 				}
// 			})
// 			//object.position.y = - 95;
// 			object.scale.set(0.2, 0.2, 0.2)
// 			scene.add( object )

// 		})



// 	}

// }


// function init(){

// 	container = document.getElementById('container')

// 	camera = new THREE.PerspectiveCamera (45, window.innerWidth / window.innerHeight, 1, 10000)
// 	camera.position.set( 250, 400, 650 )
// 	camera.lookAt(new THREE.Vector3())

// 	scene = new THREE.Scene()
// 	scene.background = new THREE.Color(0xf0f0f0)

// 	var ambientLight = new THREE.AmbientLight( 0xccccc, 0.4)
// 	scene.add(ambientLight)

// 	var pointLight = new THREE.PointLight(0xffffff, 0.8)
// 	camera.add(pointLight)
// 	scene.add(camera)

// 	var gridHelper = new THREE.GridHelper( 1000, 20 ) //size, divisions
// 	scene.add( gridHelper )

// 	renderer = new THREE.WebGLRenderer( { antialias: true } )
// 	renderer.setPixelRatio( window.devicePixelRatio )
// 	renderer.setSize( window.innerWidth, window.innerHeight )
// 	container.appendChild( renderer.domElement )
	
// 	stats = new Stats()
// 	//container.appendChild( stats.dom )
// 	window.addEventListener( 'resize', onWindowResize, false )

// 	var controls = new THREE.OrbitControls( camera, renderer.domElement )
// 	controls.addEventListener( 'change', render )
// 	controls.minDistance = 1
// 	controls.maxDistance = 10000
// 	controls.enablePan = true

// 	loadModel()
		
// }

module.exports = {
  jscadLogo,
  coneWithCutouts
}