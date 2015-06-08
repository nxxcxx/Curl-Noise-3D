/* exported  main */
/* global FBOC, uniformsInput, sortUniforms, SHADER_CONTAINER, ParticleSystem, psys, FBOCompositor, HUD, renderer */

'use strict';

function main() {

	window.uniformsInput = {
		time     : { type: 'f', value: 0.0 },
		timeMult : { type: 'f', value: 0.2 },
		noiseFreq: { type: 'f', value: 1.3 },
		speed    : { type: 'f', value: 23.2 }
	};

	var numParSq = 256;
	window.FBOC = new FBOCompositor( renderer, numParSq, SHADER_CONTAINER.passVert );
	FBOC.addPass( 'velocityPass', SHADER_CONTAINER.velocity, { positionBuffer: 'positionPass' } );
	FBOC.addPass( 'positionPass', SHADER_CONTAINER.position, { velocityBuffer: 'velocityPass' } );

	window.sortUniforms = {
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

	window.psys = new ParticleSystem( numParSq );
	psys.init();

	var initialPositionDataTexture = psys.generatePositionTexture();
	FBOC.renderInitialBuffer( initialPositionDataTexture, 'positionPass' );


	// window.bgMesh = new THREE.Mesh(
	// 	// new THREE.BoxGeometry( 1500, 1500, 1500 ),
	// 	new THREE.SphereGeometry( 1000, 64, 64 ),
	// 	new THREE.MeshBasicMaterial( {
	// 		side: THREE.BackSide,
	// 		color: 0x101010
	// 	} )
	// );

	// scene.add( bgMesh );

	// test quad Background
	window.bgGeo = new THREE.PlaneBufferGeometry( 2, 2 );
	window.bgMat = new THREE.MeshBasicMaterial( {

		color: 0x757575,
		side: THREE.DoubleSide,
		transparent: true,

		blending: THREE.CustomBlending,
		blendEquation: THREE.AddEquation,
		blendSrc: THREE.OneMinusDstAlphaFactor,
		blendDst: THREE.OneFactor

	} );
	window.bgMesh = new THREE.Mesh( bgGeo, bgMat );
	window.bgScene = new THREE.Scene();
	window.bgCam = new THREE.Camera();
	bgScene.add( bgMesh );



	window.hud = new HUD( renderer );

	initGui();

}
