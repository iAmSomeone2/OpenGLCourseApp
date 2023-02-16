import { GL_FLOAT_SIZE } from "../utils";
import { GL2Object } from "./abstractions";

export default class Mesh extends GL2Object {
    /** Vertex Array Object */
    private vao: WebGLVertexArrayObject | null;
    /** Vertex Buffer Object */
    private vbo: WebGLBuffer | null;
    /** Index buffer */
    private ibo: WebGLBuffer | null;

    /** Number of indices in mesh */
    private indexCount: number;

    constructor(glCtx: WebGL2RenderingContext, vertices: number[], indices: number[]) {
        super(glCtx);
        this.indexCount = indices.length;

        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        {
            this.ibo = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), this.gl.STATIC_DRAW);

            this.vbo = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
            {
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
                // Vertices
                this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 8 * GL_FLOAT_SIZE, 0);
                // Texture coords
                this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 8 * GL_FLOAT_SIZE, 3 * GL_FLOAT_SIZE);
                // Normals
                this.gl.vertexAttribPointer(2, 3, this.gl.FLOAT, false, 8 * GL_FLOAT_SIZE, 5 * GL_FLOAT_SIZE);
            }
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        }
        this.gl.bindVertexArray(null);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    /** Render mesh */
    public render(): void {
        this.gl.bindVertexArray(this.vao);
        {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
            this.gl.enableVertexAttribArray(0);
            this.gl.enableVertexAttribArray(1);
            this.gl.enableVertexAttribArray(2);
            this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_INT, 0);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        }
        this.gl.bindVertexArray(null);
    }

    public clear(): void {
        if (this.ibo != null) {
            this.gl.deleteBuffer(this.ibo);
            this.ibo = null;
        }
        if (this.vbo != null) {
            this.gl.deleteBuffer(this.vbo);
            this.vbo = null;
        }
        if (this.vao != null) {
            this.gl.deleteVertexArray(this.vao);
            this.vao = null;
        }

        this.indexCount = 0;
    }
}