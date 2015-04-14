/*global THREE, Coordinates, $, document, window, dat*/

var camera, scene, renderer;
var cameraControls, effectController;

var clock = new THREE.Clock();

var gridX = false;
var gridY = false;
var gridZ = false;

var axes = false;
var ground = true;

var greenMaterial;
var isWire;

//Geometry for cactus
var tess; //Tesellation of cactus.
var radius; //Radius of cactus.
var cactusBase; //Parent object of cactus
var limbs;
var thornRows;

//Materials for cactus
var ka;
var materialFlat;
var materialPhong;

//Cactus settings.
var flat;

function init() 
{
    var canvasWidth = 846;
    var canvasHeight = 494;
    // For grading the window is fixed in size; here's general code:
    //var canvasWidth = window.innerWidth;
    //var canvasHeight = window.innerHeight;
    var canvasRatio = canvasWidth / canvasHeight;
        
    // RENDERER
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColorHex( 0xAAAAAA, 1.0 );

    // CAMERA
    camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 40000 );
    // CONTROLS
    cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);

    camera.position.set( 0, 300, -900);
    cameraControls.target.set(0,300,0);


    //Geometry for cactus
    radius = 20; //Default radius of cactus.
    tess = 3; //Default tessellation of cactus.
    limbs = 5;
    thornRows = 10;

    //Materials for cactus
    isWire = false;
    ka = 0.4;
    materialFlat = new THREE.MeshLambertMaterial( { color: 0x008000, shading: THREE.FlatShading } );
    materialFlat.ambient.setRGB( materialFlat.color.r * ka, materialFlat.color.g * ka, materialFlat.color.b * ka );
    materialPhong = new THREE.MeshLambertMaterial( { color: 0x008000} );
    materialPhong.ambient.setRGB( materialPhong.color.r * ka, materialPhong.color.g * ka, materialPhong.color.b * ka );
}

document.onkeydown = function(id) 
{
    var key = id.keyCode;
    
    if(key == 87) //w (Enable Wireframe)
    {
        if(isWire === false)
        {
        	isWire = true;
        	materialFlat.wireframe = true;
            materialPhong.wireframe = true;
        }
        else
        {
        	isWire = false;
        	materialFlat.wireframe = false;

			materialPhong.wireframe = false;        
		}
    }
};

function createBase()
{
    cactusBase = new THREE.Object3D();

    var material = flat ? materialFlat : materialPhong;
    
    var cylinder = new THREE.Mesh(new THREE.CylinderGeometry( radius/2, radius, radius*5, tess, thornRows ), material );
    cylinder.position.y = radius*2.5; //Height of cactus is radius times 5, therefore the proper offset is (radius*5)/2
    cylinder.castShadow = true;
	cylinder.recieveShadow = true;
    cactusBase.add( cylinder );
    createThorns(cylinder, radius);
    limbs--;

    var levels = Math.log(limbs)/Math.log(2);

    createLimbs(cactusBase, levels, radius);

    scene.add(cactusBase);
}

function createLimbs(parent, level, radiusInp)
{
    if (level <= 0)
    {
        return;
    }
    var newRadius = radiusInp*0.75;

    var material = flat ? materialFlat : materialPhong;

    var cylinder = new THREE.Mesh(new THREE.CylinderGeometry( newRadius/2, newRadius, newRadius*5, tess, thornRows ), material );
    cylinder.position.y = newRadius*2.5; //Height of cactus is radius times 5, therefore the proper offset is (radius*5)/2
	cylinder.castShadow = true;
	cylinder.recieveShadow = true;
    createThorns(cylinder);

    var cylinderRight = new THREE.Mesh(new THREE.CylinderGeometry( newRadius/2, newRadius, newRadius*5, tess, thornRows ), material );
    cylinderRight.position.y = newRadius*2.5; //Height of cactus is radius times 5, therefore the proper offset is (radius*5)/2
    cylinderRight.castShadow = true;
	cylinderRight.recieveShadow = true;

    var leftLimb = new THREE.Object3D();
    leftLimb.rotation.z = -30 * Math.PI/180;
    leftLimb.position.y =radiusInp*5*0.25;
    leftLimb.add(cylinder);
    createThorns(cylinder, newRadius);

    var rightLimb = new THREE.Object3D();
    rightLimb.rotation.z = 30 * Math.PI/180;
    rightLimb.position.y = radiusInp*5*0.75;
    rightLimb.add(cylinderRight);
    createThorns(cylinderRight, newRadius);

    level--;

    if (limbs > 0)
    {
    	parent.add(leftLimb);
    	//window.alert(limbs);
    	limbs--;
    }
    
    if (limbs > 0)
    {
    	parent.add(rightLimb);
    	//window.alert(limbs);
    	limbs--;
    }

    createLimbs(leftLimb, level, newRadius);
    createLimbs(rightLimb, level, newRadius);
}

function createCactus()
{
    createBase();

	var cactuses = [2];
	for (var i = 0; i < 2; i++)
	{
		cactuses[i] = cactusBase.clone();
		cactuses[i].position.x = 5*radius;
		
		cactusBase.add(cactuses[i]);
		//cactuses[i].rotation = Math.PI/180/5*i;
	}
	scene.add(cactusBase);
}

function createThorns(cactusMesh, radius)
{
	var thornGeo = new THREE.CylinderGeometry(0, radius/20, radius*6/20, tess);

	for (var i = 0; i < cactusMesh.geometry.faces.length; i++)
	{
		centroid =cactusMesh.geometry.faces[i].centroid;
		thorn = new THREE.Mesh(thornGeo, materialPhong);

		rotate1 = Math.sqrt((centroid.z*centroid.z) + (centroid.x*centroid.x));
		rotate2 = Math.acos(centroid.z / rotate1);

		if (centroid.x > 0)
		{
			thorn.rotation.z = -rotate2;
		}
		else 
		{
			thorn.rotation.z = rotate2;
		}

		//scene.add(thorn);
		cactusMesh.add(thorn);
		thorn.position = centroid;
		thorn.rotation.x = 90 * Math.PI/180
	}
}


function fillScene() 
{
    // SCENE
    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog( 0x808080, 3000, 6000 );
    // LIGHTS
    var ambientLight = new THREE.AmbientLight( 0x222222 );

    //var light = new THREE.PointLight( 0xFFFFFF, 1.0 );
    //light.position.set( -400, 200, -300 );

    scene.add(ambientLight);
    //scene.add(light);

    if (ground) 
    {
		var floor = new THREE.Mesh(new THREE.PlaneGeometry(radius*radius,radius*radius,100,32), new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide}));
		floor.rotation.x = Math.PI/2;
		floor.recieveShadow = true;
        //Coordinates.drawGround({size:1000});
		scene.add(floor);
    }
    if (gridX) 
    {
        Coordinates.drawGrid({size:1000,scale:0.01});
    }
    if (gridY) 
    {
        Coordinates.drawGrid({size:1000,scale:0.01, orientation:"y"});
    }
    if (gridZ) 
    {
        Coordinates.drawGrid({size:1000,scale:0.01, orientation:"z"});
    }
    if (axes) 
    {
        Coordinates.drawAllAxes({axisLength:300,axisRadius:2,axisTess:50});
    }
    
    createCactus();
	letThereBeLight();
}

function letThereBeLight()
{
	var discoBall = new THREE.Mesh(new THREE.SphereGeometry(radius), materialFlat);
	discoBall.position.y = 10*radius;
	
	
	light = new THREE.SpotLight( 0xFFFFFF, 0.75, 0, 15*Math.PI/180, 125);
	light.castShadow = true;
	light.position.set(0,0,0);
	//light.target.position.set(10,0,-100);
	
	discoLights =[5];
	for (var i = 0; i < 5; i++)
	{
		discoLights[i] = new THREE.SpotLight( 0xFFFFFF, 0.75, 0, 15*Math.PI/180, 125);
		discoLights[i].castShadow = true;
		discoLights[i].position.set(0,0,0);
		discoLights[i].target.position.set(10,0,-100);
		
		discoBall.add(discoLights[i]);
	}
	
	discoBall.add(light);
	
	scene.add(discoBall);
}

function addToDOM() 
{
    var container = document.getElementById('container');
    var canvas = container.getElementsByTagName('canvas');
    if (canvas.length>0) {
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
    var delta = clock.getDelta();
    cameraControls.update(delta);
    if ( effectController.newLimbs !== limbs || effectController.newRadius !== radius || effectController.newTess !== tess || effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes || effectController.newFlat !== flat )
    {
    	limbs = effectController.newLimbs;
    	radius = effectController.newRadius;
        tess = effectController.newTess;
        flat = effectController.newFlat;
        gridX = effectController.newGridX;
        gridY = effectController.newGridY;
        gridZ = effectController.newGridZ;
        ground = effectController.newGround;
        axes = effectController.newAxes;

        fillScene();
    }
	renderer.shadowMapEnabled = true;
    renderer.render(scene, camera);
}

function setupGui() 
{

    effectController = 
    {
    	newLimbs: limbs,
        newTess: tess,
        newRadius: radius,
        newFlat: false,
        newGridX: gridX,
        newGridY: gridY,
        newGridZ: gridZ,
        newGround: ground,
        newAxes: true
    };

    var gui = new dat.GUI();
    gui.add(effectController, "newLimbs" ).name("Number of Limbs");
    gui.add(effectController, "newTess" ).name("Tessellation Level");
    gui.add(effectController, "newRadius" ).name("Radius");
    gui.add( effectController, "newFlat" ).name("Flat Shading");
    gui.add(effectController, "newGridX").name("Show XZ grid");
    gui.add( effectController, "newGridY" ).name("Show YZ grid");
    gui.add( effectController, "newGridZ" ).name("Show XY grid");
    gui.add( effectController, "newGround" ).name("Show ground");
    gui.add( effectController, "newAxes" ).name("Show axes");
}

init();
setupGui();
addToDOM();
animate();

