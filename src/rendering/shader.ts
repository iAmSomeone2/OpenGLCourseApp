import { GL2Object } from "./abstractions";
import { DirectionalLight, DirectionalLightUniforms, PointLight, PointLightUniforms } from "./light";
import { MaterialUniforms } from "./material";

export const MAX_POINT_LIGHTS = 3;

interface ShaderConstructionParams {
    program: WebGLProgram;
    projectionLocation: WebGLUniformLocation;
    modelLocation: WebGLUniformLocation;
    viewLocation: WebGLUniformLocation;
    eyeLocation: WebGLUniformLocation;
    directionalLightUniforms: DirectionalLightUniforms;
    pointLightUniformList: PointLightUniforms[];
    pointLightCountLocation: WebGLUniformLocation;
    materialUniforms: MaterialUniforms;
}

export default class Shader extends GL2Object {
    private glShader: WebGLProgram;
    private uniformProjection: WebGLUniformLocation;
    private uniformModel: WebGLUniformLocation;
    private uniformView: WebGLUniformLocation;
    private eyePos: WebGLUniformLocation;

    private materialUniforms: MaterialUniforms;

    private directionalLightUniforms: DirectionalLightUniforms;
    private pointLightUniformList: PointLightUniforms[];
    private pointLightCountUniform: WebGLUniformLocation;


    protected constructor(gl: WebGL2RenderingContext, params: ShaderConstructionParams) {
        super(gl);
        this.glShader = params.program;
        this.uniformProjection = params.projectionLocation;
        this.uniformModel = params.modelLocation;
        this.uniformView = params.viewLocation;
        this.eyePos = params.eyeLocation;
        this.directionalLightUniforms = params.directionalLightUniforms;
        this.pointLightUniformList = params.pointLightUniformList;
        this.pointLightCountUniform = params.pointLightCountLocation;
        this.materialUniforms = params.materialUniforms;
    }

    private static getDirectionalLightUniformLocations(gl: WebGL2RenderingContext, shaderProgram: WebGLProgram): DirectionalLightUniforms {
        const intensity = gl.getUniformLocation(shaderProgram, "directionalLight.base.intensity");
        if (!intensity) {
            throw Error("Failed to get uniform location for 'directionalLight.base.intensity'");
        }
        const color = gl.getUniformLocation(shaderProgram, "directionalLight.base.color");
        if (!color) {
            throw Error("Failed to get uniform location for 'directionalLight.base.color'");
        }
        const diffuseIntensity = gl.getUniformLocation(shaderProgram, "directionalLight.base.diffuseIntensity");
        if (!diffuseIntensity) {
            throw Error("Failed to get uniform location for 'directionalLight.base.diffuseIntensity'");
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

    public static getMaterialUniformLocations(gl: WebGL2RenderingContext, shaderProgram: WebGLProgram): MaterialUniforms {
        const specularIntensity = gl.getUniformLocation(shaderProgram, "material.specularIntensity");
        if (!specularIntensity) {
            throw Error("Failed to get uniform location for 'material.specularIntensity'");
        }
        const shininess = gl.getUniformLocation(shaderProgram, "material.shininess");
        if (!shininess) {
            throw Error("Failed to get uniform location for 'material.shininess'");
        }

        return {
            specularIntensity,
            shininess
        }
    }

    public static getPointLightUniformLocations(gl: WebGL2RenderingContext, shaderProgram: WebGLProgram, index: number): PointLightUniforms {
        const locBuff = `pointLights[${index}]`;

        const intensity = gl.getUniformLocation(shaderProgram, `${locBuff}.base.intensity`);
        if (!intensity) {
            throw Error(`Failed to get uniform location for '${locBuff}.base.intensity'`);
        }
        const color = gl.getUniformLocation(shaderProgram, `${locBuff}.base.color`);
        if (!color) {
            throw Error(`Failed to get uniform location for '${locBuff}.base.color'`);
        }
        const diffuseIntensity = gl.getUniformLocation(shaderProgram, `${locBuff}.base.diffuseIntensity`);
        if (!diffuseIntensity) {
            throw Error(`Failed to get uniform location for '${locBuff}.base.diffuseIntensity'`);
        }
        const position = gl.getUniformLocation(shaderProgram, `${locBuff}.position`);
        if (!position) {
            throw Error(`Failed to get uniform location for '${locBuff}.position'`);
        }
        const constant = gl.getUniformLocation(shaderProgram, `${locBuff}.constant`);
        if (!constant) {
            throw Error(`Failed to get uniform location for '${locBuff}.constant'`);
        }
        const linear = gl.getUniformLocation(shaderProgram, `${locBuff}.linear`);
        if (!linear) {
            throw Error(`Failed to get uniform location for '${locBuff}.linear'`);
        }
        const exponent = gl.getUniformLocation(shaderProgram, `${locBuff}.exponent`);
        if (!exponent) {
            throw Error(`Failed to get uniform location for '${locBuff}.exponent'`);
        }

        return {
            intensity,
            color,
            diffuseIntensity,
            position,
            constant,
            linear,
            exponent,
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
        const eyePos = gl.getUniformLocation(shaderProgram, "eyePos");
        if (!eyePos) {
            throw Error("Failed to get uniform location for 'eyePos'");
        }
        const directionalLightUniforms = Shader.getDirectionalLightUniformLocations(gl, shaderProgram);

        const pointLightCountLocation = gl.getUniformLocation(shaderProgram, "pointLightCount");
        if (!pointLightCountLocation) {
            throw Error("Failed to get uniform location for 'pointLightCount'");
        }

        const pointLightUniformList: PointLightUniforms[] = [];
        for (let i = 0; i < MAX_POINT_LIGHTS; i++) {
            pointLightUniformList.push(Shader.getPointLightUniformLocations(gl, shaderProgram, i));
        }

        const materialUniforms = Shader.getMaterialUniformLocations(gl, shaderProgram);

        return new Shader(gl, {
            program: shaderProgram,
            projectionLocation: projectionModel,
            modelLocation: uniformModel,
            viewLocation: viewModel,
            eyeLocation: eyePos,
            directionalLightUniforms: directionalLightUniforms,
            pointLightUniformList,
            pointLightCountLocation,
            materialUniforms
        });
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

    public setDirectionalLight(dLight: DirectionalLight): void {
        dLight.use(this.directionalLightUniforms);
    }

    public setPointLights(pLights: PointLight[]): void {
        const lightCount = Math.min(pLights.length, MAX_POINT_LIGHTS);

        this.gl.uniform1ui(this.pointLightCountUniform, lightCount);
        for (let i = 0; i < lightCount; i++) {
            pLights[i].use(this.pointLightUniformList[i]);
        }
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

    public getEyePosition(): WebGLUniformLocation {
        return this.eyePos;
    }

    public getLightUniforms(): DirectionalLightUniforms {
        return this.directionalLightUniforms;
    }

    public getMaterialUniforms(): MaterialUniforms {
        return this.materialUniforms;
    }

    public use(): void {
        this.gl.useProgram(this.glShader);
    }

    public clear(): void {
        this.gl.deleteProgram(this.glShader);
    }
}