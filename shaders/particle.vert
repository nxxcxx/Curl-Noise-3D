
uniform float size;
uniform sampler2D positionBuffer;
uniform sampler2D velocityBuffer;
uniform sampler2D opacityMap;

uniform mat4 lightMatrix;

attribute vec3 here;

varying float vLife;
varying float vOpacity;


float rand( vec2 p ){
    return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {

   vLife = texture2D( positionBuffer, here.xy ).a / 150.0;

	vec3 newPosition = texture2D( positionBuffer, here.xy ).rgb;

   vec2 opacityTexCoord = vec2( lightMatrix * vec4( newPosition, 1.0 ) );  // use newPosition not position
   vOpacity = texture2D( opacityMap, opacityTexCoord ).a;

	gl_PointSize = size;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );


}
