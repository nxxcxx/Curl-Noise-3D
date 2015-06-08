'use strict';

function ParticleSystem( _bufferSize ) {

	this.bufferSize = _bufferSize;
	this.halfSize = this.bufferSize * 0.5;

	this.geom = new THREE.BufferGeometry();

	this.position = new Float32Array( this.bufferSize * this.bufferSize * 3 );
	this.ndUV = ndarray( new Float32Array( this.bufferSize * this.bufferSize * 3 ), [ this.bufferSize, this.bufferSize, 3 ] );

	var normalizedSpacing = 1.0 / this.bufferSize;
	var normalizedHalfPixel = 0.5 / this.bufferSize;
	for ( let r = 0; r < this.bufferSize; r++ ) {
		for ( let c = 0; c < this.bufferSize; c++ ) {

			this.ndUV.set( r, c, 0, 1.0 - normalizedSpacing * c + normalizedHalfPixel );
			this.ndUV.set( r, c, 1, 1.0 - normalizedSpacing * r + normalizedHalfPixel );
			this.ndUV.set( r, c, 2, 0.0 );

		}
	}

	this.geom.addAttribute( 'here', new THREE.BufferAttribute( this.ndUV.data, 3 ) );
	this.geom.addAttribute( 'position', new THREE.BufferAttribute( this.position, 3 ) );

	delete this.ndUV;
	delete this.position;

	this.material = new THREE.ShaderMaterial( {

		attributes: {
			here: {
				type: 'v3',
				value: null
			}
		},

		uniforms: {
			size: {
				type: 'f',
				value: 3.0
			},
			luminance: {
				type: 'f',
				value: 50.0
			},
			particleTexture: {
				type: 't',
				value: TEXTURES.electric
			},
			positionBuffer: {
				type: 't',
				value: null
			},
			velocityBuffer: {
				type: 't',
				value: null
			},
			opacityMap: {
				type: 't',
				value: null
			},
			lightMatrix: {
				type: 'm4',
				value: null
			},
			sortOrder: {
				type: 'f',
				value: -1
			}
		},

		vertexShader: SHADER_CONTAINER.particleVert,
		fragmentShader: SHADER_CONTAINER.particleFrag,

		transparent: true,
		depthTest: false,
		depthWrite: false,

		////
		blending: THREE.CustomBlending,
		blendEquation: THREE.AddEquation,

		// blend modes override in run time
		blendSrc: null,
		blendDst: null,

		/*
			back to front
			THREE.OneFactor,
			THREE.OneMinusSrcAlphaFactor,

			front to back
			THREE.OneMinusDstAlphaFactor,
			THREE.OneFactor,
		*/

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
	this.lightCam = new THREE.OrthographicCamera( -600, 1000, 500, -500, 10, 1000 );
	this.lightCam.position.set( 500, 500, 0 );
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

	var downSample = 1.0;
	this.opacityMap = new THREE.WebGLRenderTarget( this.bufferSize * downSample, this.bufferSize * downSample, {

		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type: THREE.FloatType,
		stencilBuffer: false,
		depthBuffer: false,

	} );

	this.numSlices = 32;
	this.pCount = this.bufferSize * this.bufferSize;
	this.pPerSlice = this.pCount / this.numSlices;
	console.log( this.pCount, this.pPerSlice );

	this.material.uniforms.lightMatrix.value = this.lightMatrix;
	this.material.uniforms.opacityMap.value = this.opacityMap;

	this.opacityMaterial = new THREE.ShaderMaterial( {

		attributes: {
			here: {
				type: 'v3',
				value: null
			}
		},

		uniforms: {
			size: {
				type: 'f',
				value: 3.0
			},
			luminance: {
				type: 'f',
				value: 50.0
			},
			particleTexture: {
				type: 't',
				value: TEXTURES.electric
			},
			positionBuffer: {
				type: 't',
				value: null
			},
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

	scene.add( this.particleMesh );

};

ParticleSystem.prototype.render = function ( renderer ) {

	// clear opacityMap buffer
	renderer.setClearColor( 0.0, 1.0 );
	renderer.clearTarget( this.opacityMap );
	renderer.setClearColor( sceneSettings.bgColor, 1.0 );


	// set position buffer
	for ( let i = 0; i < this.numSlices; i++ ) {

		// set geometry draw calls
		this.geom.drawcalls[ 0 ] = {
			start: 0,
			count: this.pPerSlice,
			index: i * this.pPerSlice
		};

		// render to screen

		this.particleMesh.material = this.material;
		// !todo: adding or removing to scene is slow, use visible = false
		// scene.add( this.particleMesh );
		renderer.render( scene, camera );


		// render opacityMap

		this.opacityMaterial.uniforms = this.material.uniforms;

		this.particleMesh.material = this.opacityMaterial;

		// this.lightScene.add( this.particleMesh );
		// renderer.render( this.lightScene, this.lightCam, this.opacityMap );
		renderer.render( scene, this.lightCam, this.opacityMap );

	}

	// need to reset render target
	renderer.setRenderTarget( this.dummyRenderTarget );

};
