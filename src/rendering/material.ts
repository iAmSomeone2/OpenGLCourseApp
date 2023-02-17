import { GL2Object } from "./abstractions";

export interface MaterialUniforms {
    specularIntensity: WebGLUniformLocation;
    shininess: WebGLUniformLocation;
}

export default class Material extends GL2Object {
    private specularIntensity: number;
    private shininess: number;

    constructor(gl: WebGL2RenderingContext, sIntensity: number = 0, shine: number = 0) {
        super(gl);
        this.specularIntensity = sIntensity;
        this.shininess = shine;
    }

    public use(uniforms: MaterialUniforms): void {
        this.gl.uniform1f(uniforms.specularIntensity, this.specularIntensity);
        this.gl.uniform1f(uniforms.shininess, this.shininess);
    }
}