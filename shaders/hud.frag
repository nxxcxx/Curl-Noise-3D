uniform sampler2D tDiffuse;
varying vec2 vUv;

void main() {

	vec3 color = texture2D( tDiffuse, vUv ).xyz / 500.0;
	gl_FragColor = clamp( vec4( color, 1.0 ), 0.0, 1.0 );

}
