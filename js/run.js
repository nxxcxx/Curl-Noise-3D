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
