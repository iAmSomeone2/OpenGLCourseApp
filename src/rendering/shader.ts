export default class Shader {
    private glShader: WebGLProgram;
    private uniformProjection: WebGLUniformLocation;
    private uniformModel: WebGLUniformLocation;
    private uniformView: WebGLUniformLocation;

    protected constructor(program: WebGLProgram, projectionLoc: WebGLUniformLocation, modelLoc: WebGLUniformLocation, viewLoc: WebGLUniformLocation) {
        this.glShader = program;
        this.uniformProjection = projectionLoc;
        this.uniformModel = modelLoc;
        this.uniformView = viewLoc;
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

        return new Shader(shaderProgram, projectionModel, uniformModel, viewModel);
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

    public use(gl: WebGL2RenderingContext): void {
        gl.useProgram(this.glShader);
    }

    public clear(gl: WebGL2RenderingContext): void {
        gl.deleteProgram(this.glShader);
    }
}