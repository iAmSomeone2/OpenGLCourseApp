/**
 * Simple class used to keep a reference to a WebGL2 context
 */
export class GL2Object {
    protected gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }
}