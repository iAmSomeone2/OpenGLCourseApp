import { clamp } from "../utils";

export default class Light {
    private gl: WebGL2RenderingContext;
    private color: number[];
    private intensity: number;

    constructor(gl: WebGL2RenderingContext, r: number = 1, g: number = 1, b: number = 1, intensity: number = 1) {
        this.gl = gl;

        const red = clamp(r, 0, 1);
        const green = clamp(g, 0, 1);
        const blue = clamp(b, 0, 1);

        this.color = [red, green, blue];
        this.intensity = clamp(intensity, 0, 1);
    }

    public setColor(r: number, g: number, b: number) {
        const red = clamp(r, 0, 1);
        const green = clamp(g, 0, 1);
        const blue = clamp(b, 0, 1);

        this.color = [red, green, blue];
    }

    public setIntensity(value: number) {
        this.intensity = clamp(value, 0, 1);
    }

    public use(intensityLocation: WebGLUniformLocation, colorLocation: WebGLUniformLocation): void {
        this.gl.uniform3f(colorLocation, this.color[0], this.color[1], this.color[2]);
        this.gl.uniform1f(intensityLocation, this.intensity);
    }
}