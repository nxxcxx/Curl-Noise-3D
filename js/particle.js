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

			vertexHere.push( [ normalizedSpacing * c + normalizedHalfPixel, normalizedSpacing * r + normalizedHalfPixel, 0 ] );
			// vertexHere.push( [ 1.0 - normalizedSpacing * c + normalizedHalfPixel, 1.0 - normalizedSpacing * r + normalizedHalfPixel, 0 ] );

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
			size           : { type: 'f' , value : 10.0 },
			luminance      : { type: 'f' , value : 50.0 },
			particleTexture: { type: 't' , value : TEXTURES.electric },
			positionBuffer : { type: 't' , value : null },
			velocityBuffer : { type: 't' , value : null },
			opacityMap     : { type: 't' , value : null },
			lightMatrix    : { type: 'm4', value : null }
		},

		vertexShader: SHADER_CONTAINER.particleVert,
		fragmentShader: SHADER_CONTAINER.particleFrag,

		transparent: true,
		depthTest: false,
		depthWrite: false,
		// blending: THREE.AdditiveBlending,

		////
		// blending: THREE.CustomBlending,
		// blendEquation: THREE.AddEquation,
		// blendSrc: THREE.SrcAlphaFactor,
		// blendDst: THREE.OneMinusSrcAlphaFactor,

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
		data[ i + 3 ] = THREE.Math.randFloat( 50, 250 ); // initial particle life, todo: move to separate texture

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

	this.lightCamHelper = new THREE.CameraHelper( this.lightCam );
	scene.add( this.lightCamHelper );

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

	var downSample = 1.0;
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
		// blending: THREE.AdditiveBlending,

		////
		blending: THREE.CustomBlending,
		blendEquation: THREE.AddEquation,
		blendSrc: THREE.SrcAlphaFactor,
		blendDst: THREE.OneMinusSrcAlphaFactor,

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
