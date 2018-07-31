function Ui(main)
{

	this.main = main;

	Number.prototype.format = function (){
		return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	};

}


Ui.prototype = {
	init: function(){

		var scope = this;

		$('.ui.dropdown').dropdown({
			action: 'hide',
			onChange: function(value, text, $selectedItem) {
				switch(parseInt(value))
				{
					case 1:
						//new
						break;
					case 2:
						//open
						scope.fileLoader();
						break;
					case 3:
						//save
						break;

				}
			}
		});

		$('.ui.compact.vertical.labeled.icon.menu').hide();

		$( ".item.m_group" ).click(function() {
			//group function
			scope.main.mergeObjs();
		});


	},

	fileLoader: function(){
		
		var scope = this;

		var form = document.createElement( 'form' );
		form.style.display = 'none';
		document.body.appendChild( form );

		var fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.addEventListener( 'change', function ( event ) {

			scope.loadFile( fileInput.files[ 0 ] );
			form.reset();

		} );
		form.appendChild( fileInput );
		fileInput.click();
	},

	loadFile: function(file)
	{
		var scope = this;

		var filename = file.name;
		var extension = filename.split( '.' ).pop().toLowerCase();

		var reader = new FileReader();
		reader.addEventListener( 'progress', function ( event ) {

			var size = '(' + Math.floor( event.total / 1000 ).format() + ' KB)';
			var progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';
			console.log( 'Loading', filename, size, progress );

		} );

		switch(extension){
			case 'obj':
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var object = new THREE.OBJLoader().parse( contents );
					object.name = filename;
					//add to the scene
					scope.main.addObject(object);  //this.main becomes undefined
				}, false );
				reader.readAsText( file );

			break;


			case 'dae':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.ColladaLoader();
					var collada = loader.parse( contents );

					collada.scene.name = filename;
					scope.main.addObject(collada.scene ); 

				}, false );
				reader.readAsText( file );
			break;
		}
	}

}







