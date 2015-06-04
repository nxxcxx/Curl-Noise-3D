/* exported run */


function update() {

	uniformsInput.time.value = clock.getElapsedTime();


	sortUniforms.lookAt.value.set( 0, 0, 1 );
	sortUniforms.lookAt.value.applyQuaternion( camera.quaternion );
	sortUniforms.lookAt.value.normalize();

	sortUniforms.halfAngle.value.set( 0, 0, -1 );
	sortUniforms.halfAngle.value.applyQuaternion( camera.quaternion );
	// flip?
	sortUniforms.halfAngle.value.multiplyScalar( -1 );

	sortUniforms.halfAngle.value.normalize();
	sortUniforms.halfAngle.value.y += 1; // light vector
	sortUniforms.halfAngle.value.normalize();


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
