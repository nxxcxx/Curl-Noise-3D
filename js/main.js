/* exported main */

function main() {

	uniformsInput = {
		time     : { type: 'f', value: 0.0 },
		timeMult : { type: 'f', value: 0.2 },
		noiseFreq: { type: 'f', value: 1.6 },
		speed    : { type: 'f', value: 40.0 }
	};

	var numParSq = 512;
	FBOC = new FBOCompositor( renderer, numParSq, SHADER_CONTAINER.passVert );
	FBOC.addPass( 'velocityPass', SHADER_CONTAINER.velocity, { positionBuffer: 'positionPass' } );
	FBOC.addPass( 'positionPass', SHADER_CONTAINER.position, { velocityBuffer: 'velocityPass' } );

	FBOC.getPass( 'velocityPass' ).attachUniform( uniformsInput );

	psys = new ParticleSystem( numParSq );
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

	scene.add( bgMesh );



	hud = new HUD( renderer );
	initGui();

}
