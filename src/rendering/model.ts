import { mat4, vec3 } from "gl-matrix";
import { AmbientLight as Light } from "./light";
import Material from "./material";
import Mesh from "./mesh";
import RenderNode from "./render-node";
import Shader from "./shader";
import Texture from "./texture";

export default class Model extends RenderNode {
    private mesh: Mesh;
    private shader: Shader;
    private albedoTexture: Texture;
    private material: Material;

    constructor(gl: WebGL2RenderingContext, mesh: Mesh, shader: Shader) {
        super(gl);
        this.gl = gl;
        this.mesh = mesh;
        this.shader = shader;
        this.albedoTexture = Texture.createPlaceholder(gl);
        this.material = new Material(gl);
    }

    public setAlbedo(texture: Texture): void {
        this.albedoTexture = texture;
    }

    public setMaterial(material: Material): void {
        this.material = material;
    }

    public render(projectionMatrix: mat4, viewMatrix: mat4, eyePos: vec3, light?: Light | null) {
        this.shader.use();
        {
            this.gl.uniformMatrix4fv(this.shader.getUniformModel(), false, new Float32Array(this.modelMatrix()));
            this.gl.uniformMatrix4fv(this.shader.getUniformProjection(), false, new Float32Array(projectionMatrix));
            this.gl.uniformMatrix4fv(this.shader.getViewModel(), false, new Float32Array(viewMatrix));

            this.gl.uniform3f(this.shader.getEyePosition(), eyePos[0], eyePos[1], eyePos[2]);

            light?.use(this.shader.getLightUniforms());
            this.material?.use(this.shader.getMaterialUniforms());
            this.albedoTexture.useTexture();
            this.mesh.render();
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
        this.gl.useProgram(null);
    }
}