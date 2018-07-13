window.onload = function()
{
	document.addEventListener('keydown', function(event) {
		if (event.code == 'KeyE') {
	    	location.reload(true);
	  	}
	});


	/*testing cloth simulation*/
	var pinsFormation = [];
	var pins = [6];
	pinsFormation.push(pins);

	pins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	pinsFormation.push(pins);

	pins = [0];
	pinsFormation.push(pins);

	pins = [];
	pinsFormation.push(pins);

	//pins= [0, cloth.w];
	//pinsFormation.push(pins);

	pins = pinsFormation[1];

	if(! Detector.webgl){
		Detector.addGetWebGLMessage();
	}

	var container, stats;
	var camera, scene, renderer;

	var clothGeometry;
	var sphere;
	var object;

	init();
	animate();

	function init()
	{
		
	}

	function onWindowResize()
	{

	}

	function animate()
	{

	}

	function render()
	{

	}

}