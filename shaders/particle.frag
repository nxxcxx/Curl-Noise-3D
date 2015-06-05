
uniform sampler2D particleTexture;
uniform float luminance;
uniform float sortOrder;

varying vec3 vVel;
varying float vLife;
varying float vDepth;
varying float vOpacity;


float square(float s) { return s * s; }
vec3 square(vec3 s) { return s * s; }
vec3 electricGradient(float t) {
	return clamp( vec3(t * 8.0 - 6.3, square(smoothstep(0.6, 0.9, t)), pow(abs(t), 3.0) * 1.7), 0.0, 1.0);
}
vec3 heatmapGradient(float t) {
	return clamp((pow(abs(t), 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
}
vec3 neonGradient(float t) {
	return clamp(vec3(t * 1.3 + 0.1, square(abs(0.43 - t) * 1.7), (1.0 - t) * 1.7), 0.0, 1.0);
}

float easeOutQuint( float t ) {
	return (t=t-1.0)*t*t*t*t + 1.0;
}
float easeOutQuad( float t ) {
	return -t*(t-2.0);
}
float easeOutCirc( float t ) {
	return sqrt( 1.0 - (t-1.0)*(t-1.0) );
}

// vec3 luminanceCoef = vec3( 0.299, 0.587, 0.114 );
// float textureLuminance = clamp( dot( color.rgb, luminanceCoef ), 0.0, 1.0 );
// color.rgb = heatmapGradient( easeOutQuint( nVel ) ) * luminance;

void main() {

	float distanceFromCenter = distance( gl_PointCoord.xy, vec2( 0.5, 0.5 ) );
	if ( distanceFromCenter > 0.5 ) discard;

	vec4 color = vec4( 1.0, 0.0, 0.0, 1.0 );
	float alphaScale = 1.0;

	float alpha = ( 1.0 - vOpacity ) * alphaScale;

	color.rgb *= alpha;
	color.a = 1.0 * ( vLife * 0.0025 );

	color.a *= 1.0 - distance( gl_PointCoord.xy, vec2( 0.5, 0.5 ) );

	gl_FragColor = color.rgba;

}
