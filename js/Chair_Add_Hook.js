

function Chair_Add_Hook (main){
	this.main = main;
	this.furnitures = main.furnitures;
} 


Chair_Add_Hook.prototype = {

	changeParameterValue: function(pname, value) {
		this.parameters[pname] = value;
		this.execute();
	},

	createHook: function(scene, child, hook, position, offset){		
		var pos = new THREE.Vector3(position.x + offset, position.y, position.z + 10);
		var raycaster = new THREE.Raycaster();
		raycaster.set(pos, new THREE.Vector3(0,0,-1));
		var intersects = raycaster.intersectObject(child);
		if(intersects.length > 0){
			var hook_clone = hook.clone();

			var child_matrix_inverse = new THREE.Matrix4();
			child_matrix_inverse.getInverse(child.matrixWorld, true);
			hook_clone.applyMatrix(child_matrix_inverse);

			hook_clone.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
			child.worldToLocal(hook_clone.position);

			child.add( hook_clone );
		}
	},

	createColumnHook: function(scene, child, hook){
		//get hook size
		var box = new THREE.Box3();
		box.setFromObject(hook);
		var size_hook = new THREE.Vector3();
		box.getSize(size_hook);

		//get back size
		var center_child = new THREE.Vector3();
		box.setFromObject(child);
		box.getCenter(center_child);

		this.createHook(scene, child, hook, center_child, size_hook.x * (-3) );
		this.createHook(scene, child, hook, center_child, size_hook.x * 0 );
		this.createHook(scene, child, hook, center_child, size_hook.x * 3);		
	},

	hookLoader: function(back){
		var hook;

		// loading manager
		var scene = this.main.scene;
		var chair_add = this;
		var loadingManager = new THREE.LoadingManager( function() {
			for (var i = 0; i < back.children.length; i++) {
				chair_add.createColumnHook(scene, back.children[i], hook);
			}		
		} );

		// collada
		var loader = new THREE.ColladaLoader( loadingManager );
		loader.load( "./models/hook/source/B01020/B01020.dae", function ( collada ) {
			hook = collada.scene;
			hook.name = "hook";			
			hook.scale.x = 0.025; hook.scale.y = 0.025; hook.scale.z = 0.025;
		} );
	},

	computeNumber: function (value) {		
		if (value < 0)
	        return Math.ceil(value);
	    else
	    	return Math.floor(value);
	},	

	remove: function(group, name){
		for (var i = group.children.length - 1; i >= 0 ; i--) {				
			var str = group.children[i].name;
			if (str != name) {
				group.remove(group.children[i]);
			}	
		}
	},

	hasChildren: function(obj){
		if (obj.children.length != 0)
			return true;
		return false;
		
	},

	findAllChildren: function(array, obj){
	  if(obj.children.length > 0){
	    for (var i = 0; i < obj.children.length; i++) {
	      this.findAllChildren(array, obj.children[i]);
	    }
	  }
	  else
	    array.push(obj);		
	},

	updateBack: function(back){
		back.updateMatrix();
		back.updateMatrixWorld(true);
	},

	getPartSize: function(obj){
		var box = new THREE.Box3();
		box.setFromObject(obj);
		var box_size = new THREE.Vector3();
		box.getSize(box_size);

		//this includes width, height, depth
		return box_size;
	},

	getPartCenter: function(part){
		var box = new THREE.Box3();
		box.setFromObject(part);
		var box_center = new THREE.Vector3();
		box.getCenter (box_center);

		return box_center;
	},

	addHook: function(furniture_clone){
		var moveTo = new THREE.Vector3(125, 25, 0);
		//remove other part
		var group = furniture_clone;		
		this.remove(group, 'back');
		//update chair back transfrom Matrix
		var back = group.getObjectByName ('back');		
		this.updateBack(back);

		group.position.set(moveTo.x, moveTo.y, moveTo.z);

		this.hookLoader(back);
			
	},

	execute: function(){
		var hasHook = false;
		if(!this.hasHook){
			var furniture_clone_hook = new THREE.Object3D();
			furniture_clone_hook = this.furnitures[0].getFurniture().clone();
			furniture_clone_hook.name = "add_hook";

			this.addHook(furniture_clone_hook);

			this.main.scene.add(furniture_clone_hook);
			this.hasHook = true;

		}
		else{
			var add_hook = this.main.scene.getObjectByName("add_hook");
			var back = add_hook.getObjectByName("back");
			var part = back.children[0];
			var box = new THREE.Box3();
			box.setFromObject(part);

			var helper = new THREE.Box3Helper( box, 0xffff00 );
			this.main.scene.add(helper);
			// add_hook(back) --> part --> hook			
		}
	}
}

module.exports = Chair_Add_Hook