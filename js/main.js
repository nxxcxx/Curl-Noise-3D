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
