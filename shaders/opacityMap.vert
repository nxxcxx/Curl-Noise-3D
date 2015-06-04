
uniform float size;
uniform sampler2D positionBuffer;
uniform sampler2D velocityBuffer;

attribute vec3 here;
varying float vLife;


void main() {

   vLife = texture2D( positionBuffer, here.xy ).a;

	vec3 newPosition = texture2D( positionBuffer, here.xy ).rgb;

   gl_PointSize = size;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}
