export default class Mesh {
    private gl: WebGL2RenderingContext;

    /** Vertex Array Object */
    private vao: WebGLVertexArrayObject | null;
    /** Vertex Buffer Object */
    private vbo: WebGLBuffer | null;
    /** Index buffer */
    private ibo: WebGLBuffer | null;

    /** Number of indices in mesh */
    private indexCount: number;

    constructor(glCtx: WebGL2RenderingContext, vertices: number[], indices: number[]) {
        this.gl = glCtx;
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

                this.gl.enableVertexAttribArray(0);
                this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
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
            this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_INT, 0);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        }
        this.gl.bindVertexArray(null);
    }

    public clear(): void {
        if (this.ibo != 0) {
            this.gl.deleteBuffer(this.ibo);
            this.ibo = 0;
        }
        if (this.vbo != 0) {
            this.gl.deleteBuffer(this.vbo);
            this.vbo = 0;
        }
        if (this.vao != 0) {
            this.gl.deleteVertexArray(this.vao);
            this.vao = 0;
        }

        this.indexCount = 0;
    }
}