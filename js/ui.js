function ui(main)
{

	Number.prototype.format = function (){
				return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	};

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
					fileLoader();
					break;
				case 3:
					//save
					break;

			}
		}
	});


	function fileLoader()
	{
		var form = document.createElement( 'form' );
		form.style.display = 'none';
		document.body.appendChild( form );

		var fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.addEventListener( 'change', function ( event ) {

			loadFile( fileInput.files[ 0 ] );
			form.reset();

		} );
		form.appendChild( fileInput );

		fileInput.click();

	}

	function loadFile(file)
	{
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
						main.addObject(object);

					}, false );
				reader.readAsText( file );

			break;
		}
	}
}







