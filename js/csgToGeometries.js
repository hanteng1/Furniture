"use strict;"

const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')

function colorBytes (colorRGBA) {
  var result = [colorRGBA.r, colorRGBA.g, colorRGBA.b]
  if (colorRGBA.a !== undefined) result.push(colorRGBA.a)
  return result;
}

function csgToGeometries(initial_csg) {
    var csg = initial_csg.canonicalized()
    var geometry = new THREE.BufferGeometry();
    var geometries = [ ];

    var vertexTag2Index = {}
    var vertices = []
    var colors = []
    var triangles = []

    var triangleUVs = [];
    var uvs = [[0, 0], [1, 0], [0, 1], [1, 1]];
    // set to true if we want to use interpolated vertex normals
    // this creates nice round spheres but does not represent the shape of
    // the actual model
    var smoothlighting = false;
    var polygons = csg.toPolygons();
    var numpolygons = polygons.length;


    //iterate each polygons, after convertion
    for (var j = 0; j < numpolygons; j++) {
      var polygon = polygons[j]


      //each polygon may contain 3 or 4 vertices.. 
      //in case of 4... it is a quad...
      //in case of 3... it is just a triangle

      var color = colorBytes({r: 1.0, g: 0.4, b: 1.0, a: 1.0})  // default color

      if (polygon.shared && polygon.shared.color) {
        color = polygon.shared.color
      } else if (polygon.color) {
        color = polygon.color
      }

      if (color.length < 4) {
        color.push(1.0)
      } // opaque

      //console.log("");
      //console.log(j);
      //console.log(polygon.vertices);

      //get indices of the vertices array
      var indices = polygon.vertices.map(function (vertex) {
        var vertextag = vertex.getTag()

        //console.log(vertextag);

        var vertexindex = vertexTag2Index[vertextag]

        var prevcolor = colors[vertexindex]
        if (smoothlighting && (vertextag in vertexTag2Index) &&
           (prevcolor[0] === color[0]) &&
           (prevcolor[1] === color[1]) &&
           (prevcolor[2] === color[2])
          ) {
          vertexindex = vertexTag2Index[vertextag]
        } else {
          vertexindex = vertices.length

          vertexTag2Index[vertextag] = vertexindex
          //vertices.push([vertex.pos.x, vertex.pos.y, vertex.pos.z])
          vertices.push([vertex.pos.x, vertex.pos.y, vertex.pos.z]);
          //vertices.push([vertex.pos.x, vertex.pos.z, vertex.pos.y]);
          
          colors.push(color)
        }
        return vertexindex
      });

      //console.log(indices);

      for (var i = 2; i < indices.length; i++) {
        triangles.push([indices[0], indices[i - 1], indices[i]])
        //triangleUVs.push([0, i - 1, i]);
        //triangleUVs.push([0, 1, 2]);
      }

      // if too many vertices, start a new mesh;
      //this is only run if there are too many vertices.. otherwise .. it will keep accumulated
      /////////////////////////////////////////////////////////
       if (vertices.length > 65000) {
        var temp_vertices = [];
        for(var i = 0; i < triangles.length; i++)
        {
          var vertex_0 = vertices[triangles[i][0]];
          var vertex_1 = vertices[triangles[i][1]];
          var vertex_2 = vertices[triangles[i][2]];

          temp_vertices.push(vertex_0[0]);
          temp_vertices.push(vertex_0[1]);
          temp_vertices.push(vertex_0[2]);
          temp_vertices.push(vertex_1[0]);
          temp_vertices.push(vertex_1[1]);
          temp_vertices.push(vertex_1[2]);
          temp_vertices.push(vertex_2[0]);
          temp_vertices.push(vertex_2[1]);
          temp_vertices.push(vertex_2[2]);

        }
        var geo_vertices = new Float32Array(temp_vertices);
        geometry.addAttribute('position', new THREE.BufferAttribute(geo_vertices, 3));
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();

        if(geometry.getAttribute('position').count)
        {
          geometries.push(geometry);  
        }

        // start a new mesh
        geometry = new THREE.BufferGeometry();
        triangles = []
        colors = []
        vertices = []
      }

      ///////////////////////////////////////////////////////////

    }  //end of polygon loop  

    var temp_vertices = [];
    var temp_uvs = [];
    for(var i = 0; i < triangles.length; i++)
    {
      var vertex_0 = vertices[triangles[i][0]];
      var vertex_1 = vertices[triangles[i][1]];
      var vertex_2 = vertices[triangles[i][2]];

      //var uv_0 = uvs[triangleUVs[i][0]];
      //var uv_1 = uvs[triangleUVs[i][1]];
      //var uv_2 = uvs[triangleUVs[i][2]];

      temp_vertices.push(vertex_0[0]);
      temp_vertices.push(vertex_0[1]);
      temp_vertices.push(vertex_0[2]);
      temp_vertices.push(vertex_1[0]);
      temp_vertices.push(vertex_1[1]);
      temp_vertices.push(vertex_1[2]);
      temp_vertices.push(vertex_2[0]);
      temp_vertices.push(vertex_2[1]);
      temp_vertices.push(vertex_2[2]);

      // temp_uvs.push(uv_0[0]);
      // temp_uvs.push(uv_0[1]);
      // temp_uvs.push(uv_1[0]);
      // temp_uvs.push(uv_1[1]);
      // temp_uvs.push(uv_2[0]);
      // temp_uvs.push(uv_2[1]);

    }
    var geo_vertices = new Float32Array(temp_vertices);
    geometry.addAttribute('position', new THREE.BufferAttribute(geo_vertices, 3));
    //var geo_uvs = new Float32Array(temp_uvs);
    //geometry.addAttribute('uv', new THREE.BufferAttribute(geo_uvs, 2));

    geometry.computeBoundingBox();
    geometry.computeVertexNormals();
    if(geometry.getAttribute('position').count)
    {
      geometries.push(geometry);  
    }
    
    return geometries;
  
}


module.exports = csgToGeometries