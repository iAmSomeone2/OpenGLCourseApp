import { mat4 } from "gl-matrix";
import Mesh from "./mesh";
import RenderNode from "./render-node";
import Shader from "./shader";

export default class Model extends RenderNode {
    private mesh: Mesh;
    private shader: Shader;

    constructor(mesh: Mesh, shader: Shader) {
        super();
        this.mesh = mesh;
        this.shader = shader;
    }

    public render(gl: WebGL2RenderingContext, projectionMatrix: mat4) {
        this.shader.use(gl);
        {
            gl.uniformMatrix4fv(this.shader.getUniformModel(), false, new Float32Array(this.modelMatrix()));
            gl.uniformMatrix4fv(this.shader.getUniformProjection(), false, new Float32Array(projectionMatrix));

            this.mesh.render();
        }
        gl.useProgram(null);
    }
}