import { vec3 } from "gl-matrix";
import { clamp } from "../utils";
import { GL2Object } from "./abstractions";

// Uniform interfaces

interface LightUniforms {
    color: WebGLUniformLocation;
    intensity: WebGLUniformLocation;
    diffuseIntensity: WebGLUniformLocation;
}

export interface DirectionalLightUniforms extends LightUniforms {
    direction: WebGLUniformLocation;
}

export interface PointLightUniforms extends LightUniforms {
    position: WebGLUniformLocation;
    constant: WebGLUniformLocation;
    linear: WebGLUniformLocation;
    exponent: WebGLUniformLocation;
}

interface Light {
    use(uniforms: LightUniforms): void;
}

class BasicLight extends GL2Object {
    protected color: vec3;
    protected intensity: number;
    protected diffuseIntensity: number;

    constructor(gl: WebGL2RenderingContext, r: number = 1, g: number = 1, b: number = 1, intensity: number = 1) {
        super(gl);

        const red = clamp(r, 0, 1);
        const green = clamp(g, 0, 1);
        const blue = clamp(b, 0, 1);

        this.color = vec3.fromValues(red, green, blue);
        this.intensity = intensity;
        this.diffuseIntensity = 0;
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

    public setDiffuseIntensity(intensity: number): void {
        this.diffuseIntensity = intensity;
    }
}

export class DirectionalLight extends BasicLight implements Light {
    private direction: number[];


    constructor(gl: WebGL2RenderingContext) {
        super(gl);
        this.direction = [0, -1, 0];
    }

    public setDirection(xDir: number, yDir: number, zDir: number): void {
        this.direction = [xDir, yDir, zDir];
    }

    public use(uniforms: DirectionalLightUniforms): void {
        this.gl.uniform3f(uniforms.color, this.color[0], this.color[1], this.color[2]);
        this.gl.uniform1f(uniforms.intensity, this.intensity);
        this.gl.uniform3f(uniforms.direction, this.direction[0], this.direction[1], this.direction[2]);
        this.gl.uniform1f(uniforms.diffuseIntensity, this.diffuseIntensity);
    }
}

export class PointLight extends BasicLight implements Light {
    private position: vec3;
    private constant: number;
    private linear: number;
    private exponent: number;

    constructor(gl: WebGL2RenderingContext, con: number = 1.0, lin: number = 0.0, exp: number = 0.0) {
        super(gl);
        this.position = vec3.fromValues(0, 0, 0);
        this.constant = con;
        this.linear = lin;
        this.exponent = exp;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
    }

    public setConstant(val: number): void {
        this.constant = val;
    }

    public setLinear(val: number): void {
        this.linear = val;
    }

    public setExponent(val: number): void {
        this.exponent = val;
    }

    public use(uniforms: PointLightUniforms): void {
        this.gl.uniform3f(uniforms.color, this.color[0], this.color[1], this.color[2]);
        this.gl.uniform1f(uniforms.intensity, this.intensity);
        this.gl.uniform1f(uniforms.diffuseIntensity, this.diffuseIntensity);

        this.gl.uniform3f(uniforms.position, this.position[0], this.position[1], this.position[2]);
        this.gl.uniform1f(uniforms.constant, this.constant);
        this.gl.uniform1f(uniforms.linear, this.linear);
        this.gl.uniform1f(uniforms.exponent, this.exponent);
    }
}
