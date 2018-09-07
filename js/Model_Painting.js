"use strict;"


function Model_Painting( main ){

    this.main = main;
    this.furnitures = main.furnitures;

    this.paint_mode = false;
}

Model_Painting.prototype = {

    execute: function( name ){
        
        var main = this;
        var manager = new THREE.LoadingManager();
        var textureLoader = new THREE.TextureLoader( manager );

        $( ".item.ui.image.label.paint1" ).click(function() {
            var texture = textureLoader.load( '../images/material/material1.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            main.ChangeTexture( newmaterial );
            
        });
        $( ".item.ui.image.label.paint2" ).click(function() {
            var texture = textureLoader.load( '../images/material/material2.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            main.ChangeTexture( newmaterial );
            
        });
        $( ".item.ui.image.label.paint3" ).click(function() {
            var texture = textureLoader.load( '../images/material/material3.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            main.ChangeTexture( newmaterial );
            
        });
        $( ".item.ui.image.label.paint4" ).click(function() {
            var texture = textureLoader.load( '../images/material/material4.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            main.ChangeTexture( newmaterial );
            
        });
        $( ".item.ui.image.label.paint5" ).click(function() {
            var texture = textureLoader.load( '../images/material/material5.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            main.ChangeTexture( newmaterial );
            
        });
        $( ".item.ui.image.label.paint7" ).click(function() {
            var texture = textureLoader.load( '../images/material/material7.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            main.ChangeTexture( newmaterial );
            
        });
        $( ".item.ui.image.label.paint9" ).click(function() {
            var texture = textureLoader.load( '../images/material/material9.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            main.ChangeTexture( newmaterial );
            
        });

        if(this.paint_mode == false){
            $('#parameter_control_tool_painting').show();
            this.paint_mode = true;
        }
        else if(this.paint_mode == true){
            $('#parameter_control_tool_painting').hide();
            this.paint_mode = false;
        }
        $('#parameter_control_tool_wrap').hide();
        $('#parameter_control_tool_rotation').hide();
        $('#parameter_control_tool_align').hide();

    },

    ChangeTexture( newmaterial ){

        for(var i=0 ; i<this.main.GetSizeObj.length ; i++ ){
            
            var model = this.main.GetSizeObj[i];
            var ChangeTextureObj = [];
            this.getAllChildren(model , ChangeTextureObj);

            for(var j=0 ; j < ChangeTextureObj.length ; j++ ){

                if( ChangeTextureObj[j].geometry.isBufferGeometry ){
                    ChangeTextureObj[j].geometry = new THREE.Geometry().fromBufferGeometry( ChangeTextureObj[j].geometry );
                    assignUVs( ChangeTextureObj[j].geometry );
                }
                
                ChangeTextureObj[j].material = newmaterial;
            }
        }
        
    },

    getAllChildren: function(obj, array) {
        if (obj.children.length > 0) {
            for (var i = 0; i < obj.children.length; i++) {
                if(obj.children[i].type == "Mesh" || obj.children[i].type == "Object3D"){
                    this.getAllChildren(obj.children[i], array);
                }   
            }
        }
        else{
            array.push(obj);    
        }

    }

}


function assignUVs(geometry) {

    geometry.faceVertexUvs[0] = [];

    geometry.faces.forEach(function(face) {

        var components = ['x', 'y', 'z'].sort(function(a, b) {
            return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
        });

        var v1 = geometry.vertices[face.a];
        var v2 = geometry.vertices[face.b];
        var v3 = geometry.vertices[face.c];

        geometry.faceVertexUvs[0].push([
            new THREE.Vector2(v1[components[0]], v1[components[1]]),
            new THREE.Vector2(v2[components[0]], v2[components[1]]),
            new THREE.Vector2(v3[components[0]], v3[components[1]])
        ]);

    });

    geometry.uvsNeedUpdate = true;
}

module.exports = Model_Painting