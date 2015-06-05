/* exported run */


function update() {

	uniformsInput.time.value = clock.getElapsedTime();


	var eye = new THREE.Vector3( 0, 0, 1 );
	eye.applyQuaternion( camera.quaternion );

	var light = new THREE.Vector3( 0, -1, 0 );

	var hf = new THREE.Vector3();

	// if ( eye.dot( light ) < 0.0 ) {
		hf.subVectors( eye, light );
		sortUniforms.sortOrder.value = 1;
		psys.material.uniforms.sortOrder.value = -1;
	// } else {
	// 	eye.multiplyScalar( -1 );
	// 	hf.subVectors( eye, light );
	// 	sortUniforms.sortOrder.value = -1;
	// 	psys.material.uniforms.sortOrder.value = 1;
	// }


	sortUniforms.halfAngle.value = hf.normalize();







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

	renderer.setClearColor( sceneSettings.bgColor, 1.0 );
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
