import { clamp } from "../utils";
import { GL2Object } from "./abstractions";

export interface LightUniforms {
    intensity: WebGLUniformLocation;
    color: WebGLUniformLocation;
    diffuseIntensity?: WebGLUniformLocation;
    direction?: WebGLUniformLocation;
}

interface Light {
    use(uniforms: LightUniforms): void;
}

class BasicLight extends GL2Object {
    protected color: number[];
    protected intensity: number;

    constructor(gl: WebGL2RenderingContext, r: number = 1, g: number = 1, b: number = 1, intensity: number = 1) {
        super(gl);

        const red = clamp(r, 0, 1);
        const green = clamp(g, 0, 1);
        const blue = clamp(b, 0, 1);

        this.color = [red, green, blue];
        this.intensity = intensity;
    }

    public setColor(r: number, g: number, b: number) {
        const red = clamp(r, 0, 1);
        const green = clamp(g, 0, 1);
        const blue = clamp(b, 0, 1);

        this.color = [red, green, blue];
    }

    public setIntensity(value: number) {
        this.intensity = value;
    }
}

export class AmbientLight extends BasicLight implements Light {
    constructor(gl: WebGL2RenderingContext, r: number = 1, g: number = 1, b: number = 1, intensity: number = 1) {
        super(gl, r, g, b, intensity);
    }

    public use(uniforms: LightUniforms): void {
        this.gl.uniform3f(uniforms.color, this.color[0], this.color[1], this.color[2]);
        this.gl.uniform1f(uniforms.intensity, this.intensity);
    }
}

export class DirectionalLight extends BasicLight implements Light {
    private direction: number[];
    private diffuseIntensity: number;

    constructor(gl: WebGL2RenderingContext) {
        super(gl);
        this.direction = [0, -1, 0];
        this.diffuseIntensity = 0;
    }

    public setDirection(xDir: number, yDir: number, zDir: number): void {
        this.direction = [xDir, yDir, zDir];
    }

    public setDiffuseIntensity(intensity: number): void {
        this.diffuseIntensity = intensity;
    }

    public use(uniforms: LightUniforms): void {
        this.gl.uniform3f(uniforms.color, this.color[0], this.color[1], this.color[2]);
        this.gl.uniform1f(uniforms.intensity, this.intensity);
        this.gl.uniform3f(uniforms.direction!, this.direction[0], this.direction[1], this.direction[2]);
        this.gl.uniform1f(uniforms.diffuseIntensity!, this.diffuseIntensity);
    }
}
