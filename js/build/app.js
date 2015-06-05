// Source: js/loaders.js
var loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = function () {

	main();
	run();

};

loadingManager.onProgress = function ( item, loaded, total ) {

	console.log( loaded + '/' + total, item );

};

var shaderLoader = new THREE.XHRLoader( loadingManager );
shaderLoader.setResponseType( 'text' );
shaderLoader.showStatus = true;

shaderLoader.loadMultiple = function ( SHADER_CONTAINER, urlObj ) {

	Object.keys( urlObj ).forEach( function ( key ) {

		shaderLoader.load( urlObj[ key ], function ( shader ) {

			SHADER_CONTAINER[ key ] = shader;

		} );

	} );

};

var SHADER_CONTAINER = {};
shaderLoader.loadMultiple( SHADER_CONTAINER, {

	passVert: 'shaders/pass.vert',
	passFrag: 'shaders/pass.frag',

	hudVert: 'shaders/hud.vert',
	hudFrag: 'shaders/hud.frag',

	particleVert: 'shaders/particle.vert',
	particleFrag: 'shaders/particle.frag',

	velocity: 'shaders/velocity.frag',
	position: 'shaders/position.frag',

	sort: 'shaders/mergeSort.frag',

	opacityMapVert: 'shaders/opacityMap.vert',
	opacityMapFrag: 'shaders/opacityMap.frag',


} );

var TEXTURES = {};
var textureLoader = new THREE.TextureLoader( loadingManager );
textureLoader.load( 'sprites/electric.png', function ( tex ) {

	TEXTURES.electric = tex;

} );

// Source: js/scene.js
/* exported updateHelpers */

if ( !Detector.webgl ){
	Detector.addGetWebGLMessage();
}

var container, stats;
var scene, light, camera, cameraCtrl, renderer;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var pixelRatio = window.devicePixelRatio || 1;
var screenRatio = WIDTH / HEIGHT;
var clock = new THREE.Clock();

// ---- Settings
var sceneSettings = {

	bgColor: 0x757575,
	enableGridHelper: false,
	enableAxisHelper: true,
	pause: false,
	showFrameBuffer: true

};

// ---- Scene
	container = document.getElementById( 'canvas-container' );
	scene = new THREE.Scene();

// ---- Camera
	camera = new THREE.PerspectiveCamera( 70, screenRatio, 10, 100000 );
	// camera orbit control
	cameraCtrl = new THREE.OrbitControls( camera, container );

	camera.position.set( -321.5847028300089, 215.28711637817776, 881.9719256352606 );
	camera.quaternion.set( -0.12170374143462927, -0.340052864691943, 0.04443202001754455, 0.9314386960684689 );
	cameraCtrl.center.set( 243.27711348462407, -17.799729328901254, 211.47633089038425 );

	cameraCtrl.update();

// ---- Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true , alpha: true } );
	renderer.setSize( WIDTH, HEIGHT );
	renderer.setPixelRatio( pixelRatio );
	renderer.setClearColor( sceneSettings.bgColor, 1.0 );
	renderer.autoClear = false;

	container.appendChild( renderer.domElement );

// ---- Stats
	stats = new Stats();
	container.appendChild( stats.domElement );

// ---- grid & axis helper
	var gridHelper = new THREE.GridHelper( 600, 50 );
	gridHelper.setColors( 0 );
	gridHelper.material.opacity = 0.5;
	gridHelper.material.transparent = true;
	gridHelper.position.y = -300;
	scene.add( gridHelper );

	var axisHelper = new THREE.AxisHelper( 1000 );
	scene.add( axisHelper );

	function updateHelpers() {
		axisHelper.visible = sceneSettings.enableAxisHelper;
		gridHelper.visible = sceneSettings.enableGridHelper;
	}
	updateHelpers();

// ---- Lights
	// top light
		// renderer.shadowMapEnabled = true;
		// light = new THREE.DirectionalLight( 0xffffff, 1.0 );
		// light.position.set( 0, 500, 0 );
		// light.castShadow = true;
		// light.shadowCameraVisible = true;
		// light.shadowCameraNear = 10;
		// light.shadowCameraFar = 1000;
		// light.shadowMapWidth = 512;
		// light.shadowMapHeight = 512;
		//
		// scene.add( light );

// Source: js/gui.js
/* exported gui, gui_display, gui_settings, initGui, updateGuiDisplay */

var gui, gui_display, gui_settings;

function initGui() {

	// gui_settings.add( Object, property, min, max, step ).name( 'name' );

	gui = new dat.GUI();
	gui.width = 300;

	gui_display = gui.addFolder( 'Display' );
		gui_display.autoListen = false;

	gui_settings = gui.addFolder( 'Settings' );
		gui_settings.addColor( sceneSettings, 'bgColor' ).name( 'Background' );
		gui_settings.add( camera, 'fov', 25, 120, 1 ).name( 'FOV' );

		gui_settings.add( uniformsInput.timeMult, 'value', 0.0, 0.5, 0.01 ).name( 'Time Multiplier' );
		gui_settings.add( uniformsInput.noiseFreq, 'value', 0.0, 20.0, 0.01 ).name( 'Frequency' );
		gui_settings.add( uniformsInput.speed, 'value', 0.0, 200.0, 0.01 ).name( 'Speed' );
		gui_settings.add( psys.material.uniforms.size, 'value', 1.0, 20.0, 0.01 ).name( 'Size' );
		gui_settings.add( psys.material.uniforms.luminance, 'value', 0.0, 100.0, 0.01 ).name( 'Luminance' );
		gui_settings.add( sceneSettings, 'showFrameBuffer' ).name( 'Show Frame Buffer' );


	gui_display.open();
	gui_settings.open();

	gui_settings.__controllers.forEach( function ( controller ) {
		controller.onChange( updateSettings );
	} );

}

function updateSettings() {

	camera.updateProjectionMatrix();
	renderer.setClearColor( sceneSettings.bgColor , 1.0 );

}

function updateGuiDisplay() {

	gui_display.__controllers.forEach( function ( controller ) {
		controller.updateDisplay();
	} );

}

// Source: js/FBOCompositor.js

function FBOCompositor( renderer, bufferSize, passThruVertexShader ) {

	this.renderer = renderer;

	this._getWebGLExtensions();
	this.bufferSize = bufferSize;
	this.passThruVertexShader = passThruVertexShader;
	var halfBufferSize = bufferSize * 0.5;
	this.camera = new THREE.OrthographicCamera( -halfBufferSize, halfBufferSize, halfBufferSize, -halfBufferSize, 1, 10 );
	this.camera.position.z = 5;
	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene = new THREE.Scene();
	this.scene.add( this.quad );
	this.dummyRenderTarget = new THREE.WebGLRenderTarget( 2, 2 );

	this.passThruShader = new THREE.ShaderMaterial( {

		uniforms: {
			resolution: {
				type: 'v2',
				value: new THREE.Vector2( this.bufferSize, this.bufferSize )
			},
			passTexture: {
				type: 't',
				value: null
			}
		},
		vertexShader: SHADER_CONTAINER.passVert,
		fragmentShader: SHADER_CONTAINER.passFrag,
		blending: THREE.NoBlending

	} );

	this.passes = [];

	// sorting
	this.currentStep = 0;
	this.totalSortStep = ( Math.log2( this.bufferSize*this.bufferSize ) * ( Math.log2( this.bufferSize * this.bufferSize ) + 1 ) ) / 2;
	this.sortPass = -1;
	this.sortStage = -1;

}

FBOCompositor.prototype = {

	_getWebGLExtensions: function () {

		var gl = this.renderer.getContext();
		if ( !gl.getExtension( "OES_texture_float" ) ) {
			console.error( "No support for float textures!" );
		}

		if ( gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) === 0 ) {
			console.error( "No support for vertex shader textures!" );
		}

	},

	getPass: function ( name ) {
		/* todo: update to ECMA6 Array.find() */
		var pass = null;
		this.passes.some( function ( currPass ) {

			var test = currPass.name === name;
			if ( test ) pass = currPass;
			return test;

		} );

		return pass;

	},

	addPass: function ( name, fragmentShader, inputTargets ) {

		var pass = new FBOPass( name, this.passThruVertexShader, fragmentShader, this.bufferSize );
		pass.inputTargetList = inputTargets  || {};
		this.passes.push( pass );
		return pass;

	},

	updatePassDependencies: function () {

		var self = this;
		this.passes.forEach( function ( currPass ) {

			Object.keys( currPass.inputTargetList ).forEach( function ( shaderInputName ) {

				var targetPass = currPass.inputTargetList[ shaderInputName ];
				currPass.setInputTarget( shaderInputName, self.getPass( targetPass ).getRenderTarget() );

			} );

		} );

	},

	_renderPass: function ( shader, passTarget ) {

		this.quad.material = shader;
		this.renderer.render( this.scene, this.camera, passTarget, true );

	},

	renderInitialBuffer: function ( dataTexture, toPass ) {

		var pass = this.getPass( toPass );
		this.passThruShader.uniforms.passTexture.value = dataTexture;
		this._renderPass( this.passThruShader, pass.doubleBuffer[ 1 ] ); // render to secondary buffer which is already set as input to first buffer.
		this._renderPass( this.passThruShader, pass.doubleBuffer[ 0 ] ); // or just render to both
		/*!
		 *	dont call renderer.clear() before updating the simulation it will clear current active buffer which is the render target that we previously rendered to.
		 *	or just set active target to dummy target.
		 */
		this.renderer.setRenderTarget( this.dummyRenderTarget );

	},

	step: function () {

		for ( var i = 0; i < this.passes.length; i++ ) {

			this.updatePassDependencies();
			var currPass = this.passes[ i ];

			if ( currPass.name === 'sortPass' ) {

				// copy position buffer to sort buffer
				this.renderInitialBuffer( this.getPass( 'positionPass' ).getRenderTarget(), currPass.name );

				// sortPass
				for ( var s = 0; s <= this.totalSortStep; s ++ ) {

					this.sortPass --;
			      if ( this.sortPass  < 0 ) {
						this.sortStage ++;
						this.sortPass = this.sortStage;
			      }

					currPass.uniforms.pass.value  = 1 << this.sortPass;
					currPass.uniforms.stage.value = 1 << this.sortStage;

					// console.log( 'Stage:', this.sortStage, 1 << this.sortStage );
					// console.log( 'Pass:', this.sortPass, 1 << this.sortPass );
					// console.log( '------------------------------------------' );

					this._renderPass( currPass.getShader(), currPass.getRenderTarget() );
					currPass.swapBuffer();

					this.currentStep ++;

				}

				// if ( this.currentStep >= this.totalSortStep ) {
					this.currentStep = 0;
					this.sortPass = -1;
					this.sortStage = -1;
				// }

			} else {

				// other passes
				this._renderPass( currPass.getShader(), currPass.getRenderTarget() );
				currPass.swapBuffer();

			}

		} // end loop

	}

};


function FBOPass( name, vertexShader, fragmentShader, bufferSize ) {

	this.name = name;
	this.vertexShader = vertexShader;
	this.fragmentShader = fragmentShader;
	this.bufferSize = bufferSize;

	this.currentBuffer = 0;
	this.doubleBuffer = []; //  single FBO cannot act as input (texture) and output (render target) at the same time, we take the double-buffer approach
	this.doubleBuffer[ 0 ] = this.generateRenderTarget();
	this.doubleBuffer[ 1 ] = this.generateRenderTarget();

	this.inputTargetList = {};

	this.uniforms = {
		resolution: {
			type: 'v2',
			value: new THREE.Vector2( this.bufferSize, this.bufferSize )
		},
		mirrorBuffer: {
			type: 't',
			value: this.doubleBuffer[ 1 ]
		}
	};

	this.shader = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: this.vertexShader,
		fragmentShader: this.fragmentShader,
		blending: THREE.NoBlending

	} );

}

FBOPass.prototype = {

	getShader: function () {
		return this.shader;
	},
	getRenderTarget: function () {
		return this.doubleBuffer[ this.currentBuffer ];
	},
	setInputTarget: function ( shaderInputName, inputTarget ) {
		this.uniforms[ shaderInputName ] = {
			type: 't',
			value: inputTarget
		};
	},
	swapBuffer: function () {

		this.uniforms.mirrorBuffer.value = this.doubleBuffer[ this.currentBuffer ];
		this.currentBuffer ^= 1; // toggle between 0 and 1

	},
	generateRenderTarget: function () {

		var target = new THREE.WebGLRenderTarget( this.bufferSize, this.bufferSize, {

			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			stencilBuffer: false,
			depthBuffer: false,

		} );

		return target;

	},
	attachUniform: function ( uniformsInput ) {

		var self = this;
		Object.keys( uniformsInput ).forEach( function ( key ) {

			self.uniforms[ key ] = uniformsInput[ key ];

		} );

	}

};

// Source: js/hud.js

function HUD( renderer ) {

	this.renderer = renderer;
	this.HUDMargin = 0.05;
	var hudHeight = 2.0 / 3.0; // 2.0 = full screen size
	var hudWidth = hudHeight;

	this.HUDCam = new THREE.OrthographicCamera( -screenRatio, screenRatio, 1, -1, 1, 10 );
	this.HUDCam.position.z = 5;

	this.hudMaterial = new THREE.ShaderMaterial( {

		uniforms: {
			tDiffuse: {
				type: "t",
				value: this.tTarget
			}
		},
		vertexShader: SHADER_CONTAINER.hudVert,
		fragmentShader: SHADER_CONTAINER.hudFrag

	} );


	this.hudGeo = new THREE.PlaneBufferGeometry( hudWidth, hudHeight );
	this.hudGeo.applyMatrix( new THREE.Matrix4().makeTranslation( hudWidth / 2, hudHeight / 2, 0 ) );

	this.HUDMesh = new THREE.Mesh( this.hudGeo, this.hudMaterial );
	this.HUDMesh.position.x = this.HUDCam.left + this.HUDMargin;
	this.HUDMesh.position.y = this.HUDCam.bottom + this.HUDMargin;

	this.HUDScene = new THREE.Scene();
	this.HUDScene.add( this.HUDMesh );

}



HUD.prototype = {

	setInputTexture: function ( target ) {

		this.hudMaterial.uniforms.tDiffuse.value = target;

	},

	render: function () {

		this.renderer.clearDepth();
		this.renderer.render( this.HUDScene, this.HUDCam );

	},

	update: function () { // call on window resize

		// match aspect ratio to prevent distortion
		this.HUDCam.left = -screenRatio;
		this.HUDCam.right = screenRatio;

		this.HUDMesh.position.x = this.HUDCam.left + this.HUDMargin;
		this.HUDMesh.position.y = this.HUDCam.bottom + this.HUDMargin;

		this.HUDCam.updateProjectionMatrix();

	}

};

// Source: js/particle.js
function ParticleSystem( _bufferSize ) {

	this.bufferSize = _bufferSize;
	this.halfSize = this.bufferSize * 0.5;

	this.geom = new THREE.BufferGeometry();

	this.position = new Float32Array( this.bufferSize * this.bufferSize * 3 );

	var vertexHere = [];
	var normalizedSpacing = 1.0 / this.bufferSize;
	var normalizedHalfPixel = 0.5 / this.bufferSize;
	for ( r = 0; r < this.bufferSize; r++ ) {

		for ( c = 0; c < this.bufferSize; c++ ) {

			// vertexHere.push( [ normalizedSpacing * c + normalizedHalfPixel, normalizedSpacing * r + normalizedHalfPixel, 0 ] );
			vertexHere.push( [ 1.0 - normalizedSpacing * c + normalizedHalfPixel, 1.0 - normalizedSpacing * r + normalizedHalfPixel, 0 ] );

		}

	}

	// transfer to typed array
	var buffHere = new Float32Array( vertexHere.length * 3 );

	for ( i = 0; i < vertexHere.length; i++ ) {

		buffHere[ i * 3 + 0 ] = vertexHere[ i ][ 0 ];
		buffHere[ i * 3 + 1 ] = vertexHere[ i ][ 1 ];
		buffHere[ i * 3 + 2 ] = vertexHere[ i ][ 2 ];

	}

	this.geom.addAttribute( 'here', new THREE.BufferAttribute( buffHere, 3 ) );
	this.geom.addAttribute( 'position', new THREE.BufferAttribute( this.position, 3 ) );

	this.material = new THREE.ShaderMaterial( {

		attributes: {
			here: { type: 'v3', value: null }
		},

		uniforms: {
			size           : { type: 'f' , value: 5.0 },
			luminance      : { type: 'f' , value: 50.0 },
			particleTexture: { type: 't' , value: TEXTURES.electric },
			positionBuffer : { type: 't' , value: null },
			velocityBuffer : { type: 't' , value: null },
			opacityMap     : { type: 't' , value: null },
			lightMatrix    : { type: 'm4', value: null },
			sortOrder      : { type: 'f' , value: -1 }
		},

		vertexShader: SHADER_CONTAINER.particleVert,
		fragmentShader: SHADER_CONTAINER.particleFrag,

		transparent: true,
		depthTest: false,
		depthWrite: false,

		////
		blending: THREE.CustomBlending,
		blendEquation: THREE.AddEquation,

		// front to back
		blendSrc: THREE.OneFactor,
		blendDst: THREE.OneMinusSrcAlphaFactor,

		// back to front
		// blendSrc: THREE.OneMinusDstAlphaFactor,
		// blendDst: THREE.OneFactor,

	} );

	this.particleMesh = new THREE.PointCloud( this.geom, this.material );
	this.particleMesh.frustumCulled = false;
	scene.add( this.particleMesh );

}

ParticleSystem.prototype.setPositionBuffer = function ( inputBuffer ) {

	this.material.uniforms.positionBuffer.value = inputBuffer;

};

ParticleSystem.prototype.generatePositionTexture = function () {

	var data = new Float32Array( this.bufferSize * this.bufferSize * 4 );

	var fieldSize = 25.0;

	for ( var i = 0; i < data.length; i += 4 ) {

		data[ i + 0 ] = THREE.Math.randFloat( -fieldSize, fieldSize );
		data[ i + 1 ] = THREE.Math.randFloat( -fieldSize, fieldSize );
		data[ i + 2 ] = THREE.Math.randFloat( -fieldSize, fieldSize );
		data[ i + 3 ] = THREE.Math.randFloat( 0, 50 ); // initial particle life, todo: move to separate texture

	}

	var texture = new THREE.DataTexture( data, this.bufferSize, this.bufferSize, THREE.RGBAFormat, THREE.FloatType );
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	texture.needsUpdate = true;

	return texture;

};


// opacity map stuff

ParticleSystem.prototype.init = function () {

	// cam
	this.lightCam = new THREE.OrthographicCamera( -500, 500, 500, -500, 10, 1000 );
	this.lightCam.position.set( 400, 500, 0 );
	this.lightCam.rotateX( -Math.PI * 0.5 );
	this.lightCam.updateMatrixWorld();
	this.lightCam.matrixWorldInverse.getInverse( this.lightCam.matrixWorld );
	this.lightCam.updateProjectionMatrix();

	// this.lightCamHelper = new THREE.CameraHelper( this.lightCam );
	// scene.add( this.lightCamHelper );

	// uniform -> lightMatrix
	this.lightMatrix = new THREE.Matrix4();
	this.lightMatrix.set(
		0.5, 0.0, 0.0, 0.5,
		0.0, 0.5, 0.0, 0.5,
		0.0, 0.0, 0.5, 0.5,
		0.0, 0.0, 0.0, 1.0
	);
	this.lightMatrix.multiply( this.lightCam.projectionMatrix );
	this.lightMatrix.multiply( this.lightCam.matrixWorldInverse );

	this.lightScene = new THREE.Scene();
	this.lightScene.add( this.particleMesh );

	var downSample = 0.5;
	this.opacityMap = new THREE.WebGLRenderTarget( this.bufferSize*downSample, this.bufferSize*downSample, {

		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType,
		stencilBuffer: false,
		depthBuffer: false,

	} );

	this.numSlices = 64;
	this.pCount = this.bufferSize * this.bufferSize;
	this.pPerSlice = this.pCount / this.numSlices;
	console.log( this.pCount, this.pPerSlice );

	this.material.uniforms.lightMatrix.value = this.lightMatrix;
	this.material.uniforms.opacityMap.value = this.opacityMap;

	this.opacityMaterial = new THREE.ShaderMaterial( {

		attributes: {
			here: { type: 'v3', value: null }
		},

		uniforms: {
			size           : { type: 'f' , value : 7.0 },
			luminance      : { type: 'f' , value : 50.0 },
			particleTexture: { type: 't' , value : TEXTURES.electric },
			positionBuffer : { type: 't' , value : null },
		},

		vertexShader: SHADER_CONTAINER.opacityMapVert,
		fragmentShader: SHADER_CONTAINER.opacityMapFrag,

		transparent: true,
		depthTest: false,
		depthWrite: false,

		////
		blending: THREE.CustomBlending,
		blendEquation: THREE.AddEquation,

		blendSrcAlpha: THREE.SrcAlphaFactor,
		blendDstAlpha: THREE.OneMinusSrcAlphaFactor

	} );

};

ParticleSystem.prototype.render = function ( renderer ) {

	// clear opacityMap buffer
	renderer.setClearColor( 0.0, 1.0 );
	renderer.clearTarget( this.opacityMap );
	renderer.setClearColor( sceneSettings.bgColor, 1.0 );


	// set position buffer
	for ( var i = 0; i < this.numSlices; i ++ ) {

		// set geometry draw calls
		this.geom.drawcalls[0] = { start: 0, count: this.pPerSlice, index: i * this.pPerSlice };

		// render to screen

		this.particleMesh.material = this.material;

		scene.add( this.particleMesh );
		renderer.render( scene, camera );


		// render opacityMap

		this.opacityMaterial.uniforms = this.material.uniforms;

		this.particleMesh.material = this.opacityMaterial;

		this.lightScene.add( this.particleMesh );
		renderer.render( this.lightScene, this.lightCam, this.opacityMap );

	}

	// don't know why need to reset render target??
	renderer.setRenderTarget( this.dummyRenderTarget );

};

// Source: js/main.js
/* exported main */

function main() {

	uniformsInput = {
		time     : { type: 'f', value: 0.0 },
		timeMult : { type: 'f', value: 0.01 },
		noiseFreq: { type: 'f', value: 1.25 },
		speed    : { type: 'f', value: 9.0 }
	};

	var numParSq = 256;
	FBOC = new FBOCompositor( renderer, numParSq, SHADER_CONTAINER.passVert );
	FBOC.addPass( 'velocityPass', SHADER_CONTAINER.velocity, { positionBuffer: 'positionPass' } );
	FBOC.addPass( 'positionPass', SHADER_CONTAINER.position, { velocityBuffer: 'velocityPass' } );

	sortUniforms = {
		pass: { type: 'f', value: -1 },
		stage: { type: 'f', value: -1 },
		lookAt: { type: 'v3', value: new THREE.Vector3( 0, 0, -1 ) },
		halfAngle: { type: 'v3', value: new THREE.Vector3() },
		sortOrder: { type: 'f', value: 1 }
	};
	FBOC.addPass( 'sortPass', SHADER_CONTAINER.sort );
	FBOC.getPass( 'sortPass' ).attachUniform( sortUniforms );



	FBOC.getPass( 'velocityPass' ).attachUniform( uniformsInput );
	FBOC.getPass( 'positionPass' ).attachUniform( uniformsInput );

	psys = new ParticleSystem( numParSq );
	psys.init();

	var initialPositionDataTexture = psys.generatePositionTexture();
	FBOC.renderInitialBuffer( initialPositionDataTexture, 'positionPass' );


	// var boxMesh = new THREE.Mesh( new THREE.BoxGeometry( 1500, 1500, 1500 ), null );
	// cube = new THREE.BoxHelper( boxMesh );
	// cube.material.color.set( 0xffffff );
	// scene.add( cube );

	bgMesh = new THREE.Mesh(
		// new THREE.BoxGeometry( 1500, 1500, 1500 ),
		new THREE.SphereGeometry( 1000, 64, 64 ),
		new THREE.MeshBasicMaterial( {
			side: THREE.BackSide,
			color: 0x101010
		} )
	);

	// scene.add( bgMesh );



	hud = new HUD( renderer );
	initGui();

}

// Source: js/run.js
/* exported run */

var eyeHelper = new THREE.ArrowHelper(
	new THREE.Vector3( 1, 1, 0 ).normalize(),
	new THREE.Vector3( 0, 0, 0 ),
	500,
	0x0
);

scene.add( eyeHelper );

var lightHelper = new THREE.ArrowHelper(
	new THREE.Vector3( 1, 1, 0 ).normalize(),
	new THREE.Vector3( 0, 0, 0 ),
	500,
	0xff00ff
);
scene.add( lightHelper );

var halfVectorHelper = new THREE.ArrowHelper(
	new THREE.Vector3( 1, 1, 0 ).normalize(),
	new THREE.Vector3( 0, 0, 0 ),
	500,
	0xff8800
);
scene.add( halfVectorHelper );


function update() {

	uniformsInput.time.value = clock.getElapsedTime();


	var eye = new THREE.Vector3( 0, 0, -1 );
	eye.applyQuaternion( camera.quaternion );
	eye.normalize();

	var light = new THREE.Vector3( 0, -1, 0 );
	light.normalize();

	var hf = new THREE.Vector3();

	if ( eye.dot( light ) > 0.0 ) {

		hf.addVectors( eye, light );
		psys.material.blendSrc = THREE.OneFactor
		psys.material.blendDst = THREE.OneMinusSrcAlphaFactor

	} else {

		eye.multiplyScalar( - 1 );
		hf.addVectors( eye, light );
		psys.material.blendSrc = THREE.OneMinusDstAlphaFactor
		psys.material.blendDst = THREE.OneFactor

	}

	hf.normalize();
	sortUniforms.halfAngle.value = hf;


	// eyeHelper.position.copy( camera.position );
	eyeHelper.setDirection( eye );
	lightHelper.setDirection( light );
	halfVectorHelper.setDirection( hf );



	FBOC.step();

	// psys.setPositionBuffer( FBOC.getPass( 'positionPass' ).getRenderTarget() );

	// sortPass = sorted position
	psys.setPositionBuffer( FBOC.getPass( 'sortPass' ).getRenderTarget() );

	psys.opacityMaterial.uniforms.positionBuffer.value = FBOC.getPass( 'sortPass' ).getRenderTarget() ;


	// renderer.render( psys.lightScene, psys.lightCam, psys.opacityMap );

	// !todo: fix bug particle flickering because velocity buffer not sync with sorted position buffer
	// psys.material.uniforms.velocityBuffer.value = FBOC.getPass( 'velocityPass' ).getRenderTarget();

	// !todo: when rotate mesh, sorted axis is wrong

	// psys.particleMesh.rotateY( clock.getDelta() );

	updateGuiDisplay();

}


// ----  draw loop
function run() {

	requestAnimationFrame( run );

	renderer.setClearColor( sceneSettings.bgColor, 0.0 );
	renderer.clear();

	// !todo: fix particle stop sorting when pause and changing camera angle
	if ( !sceneSettings.pause ) {
		update();
	}

	// renderer.render( scene, camera );

	psys.render( renderer, scene, camera );



	if ( sceneSettings.showFrameBuffer ) {
		// hud.setInputTexture( FBOC.getPass( 'sortPass' ).getRenderTarget() );
		hud.setInputTexture( psys.opacityMap );
		hud.render();
	}

	stats.update();

}

// Source: js/events.js

window.addEventListener( 'keypress', function ( event ) {

	var key = event.keyCode;

	switch( key ) {

		case 32: sceneSettings.pause = !sceneSettings.pause;
		break;

		case 65:/*A*/
		case 97:/*a*/ sceneSettings.enableGridHelper = !sceneSettings.enableGridHelper; updateHelpers();
		break;

		case 83 :/*S*/
		case 115:/*s*/ sceneSettings.enableAxisHelper = !sceneSettings.enableAxisHelper; updateHelpers();
		break;

	}

} );


( function () {

	var timerID;
	window.addEventListener( 'resize', function () {

		clearTimeout( timerID );
		timerID = setTimeout( function () {
			onWindowResize();
		}, 100 );

	} );

} )();


function onWindowResize() {

	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	pixelRatio = window.devicePixelRatio || 1;
	screenRatio = WIDTH / HEIGHT;

	camera.aspect = screenRatio;
	camera.updateProjectionMatrix();

	renderer.setSize( WIDTH, HEIGHT );
	renderer.setPixelRatio( pixelRatio );

	hud.update();

}

//# sourceMappingURL=app.js.map