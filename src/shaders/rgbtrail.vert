out vec2 xy;

void main() {
  xy = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
} 