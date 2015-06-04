uniform sampler2D tDiffuse;
varying vec2 vUv;

void main() {

	vec3 color = 1.0 - texture2D( tDiffuse, vUv ).aaa;
	gl_FragColor = vec4( color, 1.0 );

}
