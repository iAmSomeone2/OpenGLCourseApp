import { mat4 } from "gl-matrix";
import { GL2Object } from "./abstractions";

const TO_RADIANS = Math.PI / 180;

export default class RenderNode extends GL2Object {
    private scale: number[] = [1, 1, 1];
    private translation: number[] = [0, 0, 0];
    private rotation: number[] = [0, 0, 0];

    constructor(gl: WebGL2RenderingContext) {
        super(gl);
    }

    public setScale(x: number, y: number, z: number): void {
        this.scale = [x, y, z];
    }

    public setTranslation(x: number, y: number, z: number): void {
        this.translation = [x, y, z];
    }

    public setRotation(x: number, y: number, z: number): void {
        this.rotation = [x, y, z];
    }

    public scaleBy(x: number = 0, y: number = 0, z: number = 0): void {
        this.scale[0] += x;
        this.scale[1] += y;
        this.scale[2] += z;
    }

    public translateBy(x: number = 0, y: number = 0, z: number = 0): void {
        this.translation[0] += x;
        this.translation[1] += y;
        this.translation[2] += z;
    }

    public rotateBy(x: number = 0, y: number = 0, z: number = 0): void {
        this.rotation[0] += x;
        if (this.rotation[0] >= 360) {
            this.rotation[0] -= 360;
        }

        this.rotation[1] += y;
        if (this.rotation[1] >= 360) {
            this.rotation[1] -= 360;
        }

        this.rotation[2] += z;
        if (this.rotation[2] >= 360) {
            this.rotation[2] -= 360;
        }
    }

    public modelMatrix(): mat4 {
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [this.translation[0], this.translation[1], this.translation[2]]);
        mat4.rotateX(modelMatrix, modelMatrix, this.rotation[0] * TO_RADIANS);
        mat4.rotateY(modelMatrix, modelMatrix, this.rotation[1] * TO_RADIANS);
        mat4.rotateZ(modelMatrix, modelMatrix, this.rotation[2] * TO_RADIANS);
        mat4.scale(modelMatrix, modelMatrix, [this.scale[0], this.scale[1], this.scale[2]])

        return modelMatrix;
    }
}