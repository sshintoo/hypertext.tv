varying vec2 vUv;
varying float vDistortion;
uniform float uTime;
uniform float uExposure;

// Simple signed random function from LYGIA
float srandom(vec3 p) {
    return -1.0 + 2.0 * fract(sin(dot(p.xyz, vec3(70.9898, 78.233, 32.4355))) * 43758.5453123);
}

void main() {
    float waveGradient = vDistortion * 0.5 + 0.5;
    
    // Define colors - two RGB rings in black
    vec3 black = vec3(0.0, 0.0, 0.0);
    vec3 red = vec3(0.15, 0.0, 0.0);
    vec3 green = vec3(0.0, 0.15, 0.0);
    vec3 blue = vec3(0.0, 0.0, 0.15);
    
    // Create multi-stop gradient with concentrated RGB rings
    vec3 baseColor;
    if(waveGradient < 0.3) {
        // First black section
        baseColor = black;
    } else if(waveGradient < 0.4) {
        // First RGB ring with four transitions
        if(waveGradient < 0.325) {
            baseColor = mix(black, red, (waveGradient - 0.3) * 40.0);
        } else if(waveGradient < 0.35) {
            baseColor = mix(red, green, (waveGradient - 0.325) * 40.0);
        } else if(waveGradient < 0.375) {
            baseColor = mix(green, blue, (waveGradient - 0.35) * 40.0);
        } else {
            baseColor = mix(blue, black, (waveGradient - 0.375) * 40.0);
        }
    } else if(waveGradient < 0.6) {
        // Middle black section
        baseColor = black;
    } else if(waveGradient < 0.7) {
        // Second RGB ring with four transitions
        if(waveGradient < 0.625) {
            baseColor = mix(black, red, (waveGradient - 0.6) * 40.0);
        } else if(waveGradient < 0.65) {
            baseColor = mix(red, green, (waveGradient - 0.625) * 40.0);
        } else if(waveGradient < 0.675) {
            baseColor = mix(green, blue, (waveGradient - 0.65) * 40.0);
        } else {
            baseColor = mix(blue, black, (waveGradient - 0.675) * 40.0);
        }
    } else {
        // Final black section
        baseColor = black;
    }
    
    vec3 finalColor = baseColor;
    
    // Create more irregular noise
    vec2 nCoord = gl_FragCoord.xy;
    float t = floor(uTime * 60.0);
    
    // Add variation to coordinates
    nCoord.x += sin(nCoord.y * 0.07 + t * 0.1) * 2.0;
    nCoord.y += cos(nCoord.x * 0.05 - t * 0.1) * 2.0;
    
    // Create primary noise
    float noise = srandom(vec3(nCoord, t));
    noise = noise * 0.5 + 0.5;
    
    // Create brightness variation using a second noise with different coordinates
    vec2 brightnessCoord = nCoord * 1.7 + vec2(t * 0.2, -t * 0.15);
    float brightnessNoise = srandom(vec3(brightnessCoord, t * 0.5));
    brightnessNoise = brightnessNoise * 0.5 + 0.5;
    
    // Vary the noise intensity based on brightness noise
    noise *= mix(0.0, 0.15, brightnessNoise);
    
    // Apply screen blend
    vec3 noiseColor = vec3(noise);
    finalColor = 1.0 - (1.0 - finalColor) * (1.0 - noiseColor);
    finalColor = pow(finalColor, vec3(1.4));
    
    // Apply exposure
    finalColor *= uExposure;
    
    gl_FragColor = vec4(finalColor, 1.0);
} 