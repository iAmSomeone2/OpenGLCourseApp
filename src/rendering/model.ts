import { mat4 } from "gl-matrix";
import Mesh from "./mesh";
import RenderNode from "./render-node";
import Shader from "./shader";
import Texture from "./texture";

export default class Model extends RenderNode {
    private gl: WebGL2RenderingContext;
    private mesh: Mesh;
    private shader: Shader;
    private albedoTexture: Texture;

    constructor(gl: WebGL2RenderingContext, mesh: Mesh, shader: Shader) {
        super();
        this.gl = gl;
        this.mesh = mesh;
        this.shader = shader;
        this.albedoTexture = Texture.createPlaceholder(gl);
    }

    public setAlbedo(texture: Texture): void {
        this.albedoTexture = texture;
    }

    public render(projectionMatrix: mat4, viewMatrix: mat4) {
        this.shader.use(this.gl);
        {
            this.gl.uniformMatrix4fv(this.shader.getUniformModel(), false, new Float32Array(this.modelMatrix()));
            this.gl.uniformMatrix4fv(this.shader.getUniformProjection(), false, new Float32Array(projectionMatrix));
            this.gl.uniformMatrix4fv(this.shader.getViewModel(), false, new Float32Array(viewMatrix));

            this.albedoTexture.useTexture();
            this.mesh.render();
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
        this.gl.useProgram(null);
    }
}