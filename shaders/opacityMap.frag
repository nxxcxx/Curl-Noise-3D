
uniform sampler2D particleTexture;
uniform float luminance;

varying float vLife;


void main() {


	float distanceFromCenter = distance( gl_PointCoord.xy, vec2( 0.5, 0.5 ) );
	if ( distanceFromCenter > 0.5 ) discard;
	float alpha = clamp( distanceFromCenter * 2.0, 0.0, 1.0 );

	vec4 pColor = vec4( 0.01 );

	gl_FragColor = pColor.rgba;

}
