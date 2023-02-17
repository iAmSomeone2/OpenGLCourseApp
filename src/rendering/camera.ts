import { glMatrix, mat4, vec3 } from "gl-matrix";
import { PointerPosition } from "../input";

export default class Camera {
    private position: vec3;
    private front: vec3;
    private up: vec3;
    private right: vec3;
    private worldUp: vec3;

    private yaw: number;
    private pitch: number;

    private movementSpeed: number;
    private turnSpeed: number;

    constructor(initalPosition: vec3 = [0, 0, 0], initalUp: vec3 = [0, 1, 0], initalYaw: number = -90, initalPitch: number = 0, initialMoveSpeed: number = 5, initialTurnSpeed: number = 100) {
        this.position = initalPosition;
        this.up = vec3.create();
        this.yaw = initalYaw;
        this.pitch = initalPitch;

        this.movementSpeed = initialMoveSpeed;
        this.turnSpeed = initialTurnSpeed;

        this.front = vec3.fromValues(0, 0, -1);
        this.right = vec3.fromValues(0, 0, 0);
        this.worldUp = initalUp;

        this.update();
    }

    private update(): void {
        // Front vector
        this.front[0] = Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
        this.front[1] = Math.sin(glMatrix.toRadian(this.pitch));
        this.front[2] = Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
        vec3.normalize(this.front, this.front);

        // Right vector
        let tmp = vec3.create();
        vec3.cross(tmp, this.front, this.worldUp);
        vec3.normalize(this.right, tmp);

        // Up vector
        tmp = vec3.create();
        vec3.cross(tmp, this.right, this.front);
        vec3.normalize(this.up, tmp);
    }

    public keyControl(keyEvents: KeyboardEvent[], deltaTime: number): void {
        const movementStep = this.movementSpeed * deltaTime;
        for (const keyEvent of keyEvents) {
            // Forward
            if (keyEvent.code === "KeyW") {
                const tmp = vec3.create();
                vec3.mul(tmp, this.front, [movementStep, movementStep, movementStep]);
                vec3.add(this.position, this.position, tmp);
                // console.log(`Moving camera forward by ${movementStep}...`);
            }
            // Back
            if (keyEvent.code === "KeyS") {
                const tmp = vec3.create();
                vec3.mul(tmp, this.front, [movementStep, movementStep, movementStep]);
                vec3.sub(this.position, this.position, tmp);
                // console.log(`Moving camera backward by ${movementStep}...`);
            }
            // Left
            if (keyEvent.code === "KeyA") {
                const tmp = vec3.create();
                vec3.mul(tmp, this.right, [movementStep, movementStep, movementStep]);
                vec3.sub(this.position, this.position, tmp);
                // console.log(`Moving camera left by ${movementStep}...`);
            }
            // Right
            if (keyEvent.code === "KeyD") {
                const tmp = vec3.create();
                vec3.mul(tmp, this.right, [movementStep, movementStep, movementStep]);
                vec3.add(this.position, this.position, tmp);
                // console.log(`Moving camera right by ${movementStep}...`);
            }
        }
    }

    public mouseControl(mouseChange: PointerPosition, deltaTime: number): void {
        const turnAmt = this.turnSpeed * deltaTime;
        const xChange = mouseChange.x * turnAmt;
        const yChange = mouseChange.y * turnAmt;

        this.yaw += xChange;
        this.pitch += yChange;

        if (this.pitch > 89.0) {
            this.pitch = 89.0
        }
        if (this.pitch < -89.0) {
            this.pitch = -89.0
        }

        this.update();
    }

    public getViewMatrix(): mat4 {
        const viewMatrix = mat4.create();
        const center = vec3.create();
        vec3.add(center, this.position, this.front);
        mat4.lookAt(viewMatrix, this.position, center, this.up);

        return viewMatrix;
    }

    public getPosition(): vec3 {
        return this.position;
    }
}