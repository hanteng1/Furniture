
const {log, status} = require('./log')
const csgToGeometries =  require('./csgToGeometries')
const geometryToCsg = require('./geometryToCsg')
const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate} = scadApi.transformations

// NOTE : all the functions below are taken from the official examples of OpenJSCAD.org

/**
 * jscadLogo - description
 * function that generate the openjscad logo
 * @param  {type} size=10 description
 * @return {type}         description
 */
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

var mGeometries = [];
var scene = null;

function setCsg(){
  var mConeWithCutouts = new coneWithCutouts();

  if(isCAG(mConeWithCutouts) || isCSG (mConeWithCutouts)) {
    if(0 && mConeWithCutouts.length){
      for(var i=0; i < mConeWithCutouts.length; i++){
        mGeometries.concat(csgToGeometries(mConeWithCutouts[i]));
      }
    }else {
      mGeometries = csgToGeometries(mConeWithCutouts);
    }  
  }

  var material = new THREE.MeshLambertMaterial();
  //add geometries to scene
  for(var i = 0; i < mGeometries.length; i++)
  {
    var mesh = new THREE.Mesh( mGeometries[i], material );
    scene.add(mesh);
  }

}


function init(){
  let a = 1;
  if(!Detector.webgl) Detector.addGetWebGLMessage();

  var container = document.getElementById('container');

  var camera = new THREE.PerspectiveCamera (45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set( 250, 400, 650 );
  camera.lookAt(new THREE.Vector3());

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  var ambientLight = new THREE.AmbientLight( 0xccccc, 0.4);
  scene.add(ambientLight);

  var pointLight = new THREE.PointLight(0xffffff, 0.8);
  camera.add(pointLight);
  scene.add(camera);

  var gridHelper = new THREE.GridHelper( 1000, 20 ) ;//size, divisions
  scene.add( gridHelper );

  var renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );
    
  var stats = new Stats();
   //container.appendChild( stats.dom )
  window.addEventListener( 'resize', onWindowResize, false );

  var controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render );
  controls.minDistance = 1;
  controls.maxDistance = 10000;
  controls.enablePan = true;

  loadModel();
  animate();

  setCsg();

  function animate(){
    requestAnimationFrame(animate);
    render();
    stats.update();
  }

  function render()
  {
    renderer.render(scene, camera);
  }

  function loadModel(){
    var material = new THREE.MeshLambertMaterial()
    var loader = new THREE.OBJLoader()
    loader.load('../models/Polantis_Stickley_Chair_01.obj', function(object){
      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.material = material;
          
          //var childCsg = geometryToCsg(child.geometry).scale(20);
          //child.geometry = csgToGeometries(childCsg)[0];

        }
      });
     //object.position.y = - 95;
    object.scale.set(0.2, 0.2, 0.2);
    scene.add( object );

    });
  }


  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }
}


document.addEventListener('DOMContentLoaded', function(event){
  init();
})






// now any other project can re-use these
// module.exports = {
//   jscadLogo,
//   coneWithCutouts
// }