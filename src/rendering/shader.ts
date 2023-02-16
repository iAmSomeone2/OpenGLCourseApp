import { GL2Object } from "./abstractions";
import { LightUniforms } from "./light";

export default class Shader extends GL2Object {
    private glShader: WebGLProgram;
    private uniformProjection: WebGLUniformLocation;
    private uniformModel: WebGLUniformLocation;
    private uniformView: WebGLUniformLocation;
    private lightUniforms: LightUniforms;

    protected constructor(gl: WebGL2RenderingContext, program: WebGLProgram, projectionLoc: WebGLUniformLocation, modelLoc: WebGLUniformLocation, viewLoc: WebGLUniformLocation, lightUniforms: LightUniforms) {
        super(gl);
        this.glShader = program;
        this.uniformProjection = projectionLoc;
        this.uniformModel = modelLoc;
        this.uniformView = viewLoc;
        this.lightUniforms = lightUniforms;
    }

    private static getLightUniformLocations(gl: WebGL2RenderingContext, shaderProgram: WebGLProgram): LightUniforms {
        const intensity = gl.getUniformLocation(shaderProgram, "directionalLight.intensity");
        if (!intensity) {
            throw Error("Failed to get uniform location for 'directionalLight.intensity'");
        }
        const color = gl.getUniformLocation(shaderProgram, "directionalLight.color");
        if (!color) {
            throw Error("Failed to get uniform location for 'directionalLight.color'");
        }
        const diffuseIntensity = gl.getUniformLocation(shaderProgram, "directionalLight.diffuseIntensity");
        if (!diffuseIntensity) {
            throw Error("Failed to get uniform location for 'directionalLight.diffuseIntensity'");
        }
        const direction = gl.getUniformLocation(shaderProgram, "directionalLight.direction");
        if (!direction) {
            throw Error("Failed to get uniform location for 'directionalLight.direction'");
        }

        return {
            intensity,
            color,
            direction,
            diffuseIntensity
        }
    }

    public static createFromStrings(gl: WebGL2RenderingContext, vertexSrc: string, fragmentSrc: string): Shader {
        const vertexShader = Shader.compileShader(gl, vertexSrc, gl.VERTEX_SHADER);
        const fragmentShader = Shader.compileShader(gl, fragmentSrc, gl.FRAGMENT_SHADER);

        const shaderProgram = Shader.linkShaderProgram(gl, [vertexShader, fragmentShader]);
        const uniformModel = gl.getUniformLocation(shaderProgram, "model");
        if (!uniformModel) {
            throw Error("Failed to get uniform location for 'model'");
        }
        const projectionModel = gl.getUniformLocation(shaderProgram, "projection");
        if (!projectionModel) {
            throw Error("Failed to get uniform location for 'projection'");
        }
        const viewModel = gl.getUniformLocation(shaderProgram, "view");
        if (!viewModel) {
            throw Error("Failed to get uniform location for 'view'");
        }
        const lightUniforms = Shader.getLightUniformLocations(gl, shaderProgram);

        return new Shader(gl, shaderProgram, projectionModel, uniformModel, viewModel, lightUniforms);
    }

    private static compileShader(gl: WebGL2RenderingContext, src: string, type: number): WebGLShader {
        const shader = gl.createShader(type);
        if (!shader) {
            throw Error("Failed to allocate shader.");
        }

        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            gl.deleteShader(shader);
            const infoLog = gl.getShaderInfoLog(shader) ?? "Unknown shader compilation error";
            throw Error(infoLog);
        }

        return shader;
    }

    private static linkShaderProgram(gl: WebGL2RenderingContext, shaders: WebGLShader[]): WebGLProgram {
        const program = gl.createProgram();
        if (!program) {
            throw Error("Failed to allocate shader program");
        }

        for (const shader of shaders) {
            gl.attachShader(program, shader);
        }
        gl.linkProgram(program);

        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            gl.deleteProgram(program);
            const errorLog = gl.getProgramInfoLog(program) ?? "Unknown shader linking error";
            throw Error(errorLog);
        }

        return program;
    }

    public getUniformProjection(): WebGLUniformLocation {
        return this.uniformProjection;
    }

    public getUniformModel(): WebGLUniformLocation {
        return this.uniformModel;
    }

    public getViewModel(): WebGLUniformLocation {
        return this.uniformView;
    }

    public getLightUniforms(): LightUniforms {
        return this.lightUniforms;
    }

    public use(): void {
        this.gl.useProgram(this.glShader);
    }

    public clear(): void {
        this.gl.deleteProgram(this.glShader);
    }
}