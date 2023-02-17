export interface PointerPosition {
    x: number,
    y: number,
}

export default class InputHandler {
    private canvas: HTMLCanvasElement;
    private lastPolledPointerPosition: PointerPosition;
    private lastMovement: PointerPosition;

    private keyEvents: Array<KeyboardEvent>;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.keyEvents = new Array<KeyboardEvent>();

        this.canvas.onpointerdown = (e: PointerEvent) => {
            InputHandler.beginInputCapture(e, this);
        }
        this.canvas.onpointerup = (e: PointerEvent) => {
            InputHandler.endInputCapture(e, this);
        }

        this.lastPolledPointerPosition = {
            x: 0,
            y: 0
        };
        this.lastMovement = this.lastPolledPointerPosition;
    }

    private static beginInputCapture(_e: PointerEvent, inputHandler: InputHandler): void {
        inputHandler.canvas.onpointermove = (e: PointerEvent) => {
            InputHandler.handleMouseMovement(e, inputHandler);
        }
        document.onkeydown = (e: KeyboardEvent) => {
            InputHandler.handleKeypress(e, inputHandler);
        };
        document.onkeyup = (e: KeyboardEvent) => {
            InputHandler.handleKeypress(e, inputHandler);
        };
        // inputHandler.canvas.setPointerCapture(e.pointerId);
        inputHandler.canvas.requestPointerLock();
    }

    private static endInputCapture(_e: PointerEvent, inputHandler: InputHandler): void {
        inputHandler.canvas.onpointermove = null;
        document.onkeydown = null;
        document.onkeyup = null;
        // inputHandler.canvas.releasePointerCapture(e.pointerId);
        document.exitPointerLock();
    }

    private static handleMouseMovement(e: PointerEvent, inputHandler: InputHandler): void {
        inputHandler.lastMovement = {
            x: inputHandler.lastMovement.x + e.movementX,
            y: inputHandler.lastMovement.y + e.movementY
        };
    }

    private static handleKeypress(e: KeyboardEvent, inputHandler: InputHandler): void {
        inputHandler.keyEvents.push(e);
    }

    /**
     * Returns the position of the pointer relative to the last poll
     */
    public pollPointerPositionDelta(): PointerPosition {
        const relativePosition = {
            x: this.lastMovement.x - this.lastPolledPointerPosition.x,
            y: this.lastPolledPointerPosition.y - this.lastMovement.y,
        }

        this.lastPolledPointerPosition = this.lastMovement;

        return relativePosition;
    }

    /**
     * Returns the array of keyboard events that occurred since the last poll
     */
    public pollKeyboardEvents(): KeyboardEvent[] {
        const keyEventsCopy = new Array<KeyboardEvent>(this.keyEvents.length);
        for (let i = 0; i < this.keyEvents.length; i++) {
            keyEventsCopy[i] = this.keyEvents[i];
        }

        this.keyEvents = [];

        return keyEventsCopy;
    }
}