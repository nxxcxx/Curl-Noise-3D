/* exported run */

function update() {

	uniformsInput.time.value = clock.getElapsedTime();

	FBOC.step();

	// psys.setPositionBuffer( FBOC.getPass( 'positionPass' ).getRenderTarget() );

	// sortPass = sorted position
	psys.setPositionBuffer( FBOC.getPass( 'sortPass' ).getRenderTarget() );

	// !todo: fix bug particle flickering because velocity buffer not sync with sorted position buffer
	psys.material.uniforms.velocityBuffer.value = FBOC.getPass( 'velocityPass' ).getRenderTarget();

	updateGuiDisplay();

}


// ----  draw loop
function run() {

	requestAnimationFrame( run );
	renderer.clear();

	if ( !sceneSettings.pause ) {
		update();
	}

	renderer.render( scene, camera );

	if ( sceneSettings.showFrameBuffer ) {
		hud.setInputTexture( FBOC.getPass( 'sortPass' ).getRenderTarget() );
		hud.render();
	}

	stats.update();

}
