var camera, scene, renderer;

var _sphere;
var _sphereMaterial;
var _sphereRadius;
var _xPos;
var _zPos;

var _phongMaterial;
var _gouraudMaterial;

var gridX = false;
var gridY = false;
var gridZ = false;
var axes = true;
var ground = true;

function fillScene()
{
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( 2, 2, 2 );

	scene.add(light);
    
	var _color1 = new THREE.Color();
	_color1.setHSL(0, 1, 0);
	var _color2 = new THREE.Color();
	_color2.setHSL(1, 0, 0);
	var _color3 = new THREE.Color();
	_color3.setHSL(0, 0, 1);

	_geometry = new THREE.Geometry();
	_geometry.vertices.push(new THREE.Vector3(100, 0, 0));
	_geometry.vertices.push(new THREE.Vector3(0, 100, 0));
	_geometry.vertices.push(new THREE.Vector3(0, 0, 100));
	_geometry.faces.push(new THREE.Face3());


	scene.add(_geometry);
	drawSphere();
}

function drawSphere()
{
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(_sphereRadius, 25, 25), _sphereMaterial);

    sphere.position.y = _sphereRadius;
    sphere.position.x = _xPos;
    sphere.position.z = _zPos;
    
    scene.add(sphere);
}

function drawHelpers() {
	if (ground) {
		Coordinates.drawGround({size:10000});
	}
	if (gridX) {
		Coordinates.drawGrid({size:10000,scale:0.01});
	}
	if (gridY) {
		Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
	}
	if (gridZ) {
		Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});
	}
	if (axes) {
		Coordinates.drawAllAxes({axisLength:200,axisRadius:1,axisTess:50});
	}
}

function onDocumentKeyDown(event)
{
    // Get the key code of the pressed key  
    var keyCode = event.which;

    // 'F' - Toggle through the texture filters 
    if (keyCode == 107 && _sphereRadius < 8) //+ (Scale up)
    {
        _sphereRadius++;
    }
    else if (keyCode == 109 && _sphereRadius > 2) //- (Scale down)
    {
        _sphereRadius--;
    }
    else if (keyCode == 39) //right arrow (Move right)
    {
        _xPos++;
    }
    else if (keyCode == 37) //left arrow (Move left)
    {
        _xPos--;
    }
    else if (keyCode == 38) //up arrow (Move forward)
    {
        _zPos--;
    }
    else if (keyCode == 40) //down arrow (Move backward)
    {
        _zPos++;
    }
    else if (keyCode == 83) //s (Toggle shader)
    {
        if (_sphereMaterial.shading == THREE.FlatShading)
        {
            _sphereMaterial.shading = THREE.SmoothShading;
        }
        else
        {
            _sphereMaterial.shading = THREE.FlatShading;
        }
    }
    else if (keyCode == 81) //q (Change to Phong material)
    {
        _sphereMaterial = _phongMaterial;
    }
    else if (keyCode == 71) //g (Change to Gouraud material)
    {
        _sphereMaterial = _gouraudMaterial;
    }

}

function init()
{
	//var canvasWidth = 846;
	//var canvasHeight = 494;
	// For grading the window is fixed in size; here's general code:
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 30, canvasRatio, 1, 10000 );
	camera.position.set(0, 30, 200);

	_sphereRadius = 2;
	_xPos = 0;
	_zPos = 0;

	_phongMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFF00, specular: 0xFFFFFF });
	_gouraudMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00, specular: 0xFFFFFF });

	_sphereMaterial = _phongMaterial;

	fillScene();
    document.addEventListener("keydown", onDocumentKeyDown, false);
}

function addToDOM()
{
	var container = document.getElementById('container');
	var canvas = container.getElementsByTagName('canvas');
	if (canvas.length > 0)
	{
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}

function animate()
{
	window.requestAnimationFrame(animate);
	render();
}

function render()
{
    drawHelpers();
    renderer.render(scene, camera);
    fillScene();
}

function setupGui() {

	effectController = {

		newGridX: gridX,
		newGridY: gridY,
		newGridZ: gridZ,
		newGround: ground,
		newAxes: axes
	};

	var gui = new dat.GUI();
	gui.add( effectController, "newGridX").name("Show XZ grid");
	gui.add( effectController, "newGridY" ).name("Show YZ grid");
	gui.add( effectController, "newGridZ" ).name("Show XY grid");
	gui.add( effectController, "newGround" ).name("Show ground");
	gui.add( effectController, "newAxes" ).name("Show axes");
}


try {
	init();
	setupGui();
	drawHelpers();
	addToDOM();
	animate();
} catch(e) {
	var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
	$('#container').append(errorReport+e);
}

