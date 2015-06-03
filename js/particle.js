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
			size           : { type: 'f', value: 2.0 },
			luminance      : { type: 'f', value: 2.0 },
			particleTexture: { type: 't', value: TEXTURES.electric },
			positionBuffer : { type: 't', value: null },
			velocityBuffer : { type: 't', value: null }
		},

		vertexShader: SHADER_CONTAINER.particleVert,
		fragmentShader: SHADER_CONTAINER.particleFrag,

		transparent: true,
		depthTest: false,
		depthWrite: false,
		blending: THREE.AdditiveBlending

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
		data[ i + 3 ] = THREE.Math.randFloat( 150, 300 ); // initial particle life, todo: move to separate texture

	}

	var texture = new THREE.DataTexture( data, this.bufferSize, this.bufferSize, THREE.RGBAFormat, THREE.FloatType );
	texture.minFilter = THREE.NearestFilter;
	texture.magFilter = THREE.NearestFilter;
	texture.needsUpdate = true;

	return texture;

};
