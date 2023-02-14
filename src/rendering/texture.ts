export default class Texture {
    private gl: WebGL2RenderingContext;
    private glTexture: WebGLTexture;
    private width: number;
    private height: number;

    protected constructor(gl: WebGL2RenderingContext, tex: WebGLTexture, width: number, height: number) {
        this.gl = gl;
        this.glTexture = tex;
        this.width = width;
        this.height = height;
    }

    public static createPlaceholder(gl: WebGL2RenderingContext): Texture {
        const glTexture = gl.createTexture();
        if (!glTexture) {
            throw Error("Failed to allocate texture buffer");
        }

        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([255, 0, 255, 255]); // Opaque pink

        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);

        return new Texture(gl, glTexture, width, height);
    }

    public static async createFromUrl(gl: WebGL2RenderingContext, imgUrl: string): Promise<Texture> {
        const glTexture = gl.createTexture();
        if (!glTexture) {
            return Promise.reject("Failed to allocate texture buffer");
        }

        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const image = new Image();

        return new Promise((resolve, reject) => {
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, glTexture);
                {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, srcFormat, srcType, image);
                    gl.generateMipmap(gl.TEXTURE_2D);
                }
                gl.bindTexture(gl.TEXTURE_2D, null);
                resolve(new Texture(gl, glTexture, image.width, image.height))
            };
            image.onerror = (_event, _source, _lineno, _colno, error) => {
                reject(error);
            }
            image.src = imgUrl;
        });
    }

    public useTexture(): void {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
    }

    public clearTexture(): void {
        this.gl.deleteTexture(this.glTexture);
    }
}