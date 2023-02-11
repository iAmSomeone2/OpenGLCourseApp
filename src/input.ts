export interface PointerPosition {
    x: number,
    y: number,
}

export default class InputHandler {
    private canvas: HTMLCanvasElement;
    private lastPolledPointerPosition: PointerPosition;
    private currentPointerPosition: PointerPosition;

    private keyEvents: Array<KeyboardEvent>;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.keyEvents = new Array<KeyboardEvent>();

        this.canvas.onpointerdown = (e: PointerEvent) => {
            InputHandler.beginMouseCapture(e, this);
        }
        this.canvas.onpointerup = (e: PointerEvent) => {
            InputHandler.endMouseCapture(e, this);
        }

        this.lastPolledPointerPosition = {
            x: 0,
            y: 0
        };
        this.currentPointerPosition = this.lastPolledPointerPosition;
    }
    private static beginMouseCapture(e: PointerEvent, inputHandler: InputHandler): void {
        inputHandler.canvas.onpointermove = (e: PointerEvent) => {
            InputHandler.handleMouseMovement(e, inputHandler);
        }
        inputHandler.canvas.setPointerCapture(e.pointerId);
    }

    private static endMouseCapture(e: PointerEvent, inputHandler: InputHandler): void {
        inputHandler.canvas.onpointermove = null;
        inputHandler.canvas.releasePointerCapture(e.pointerId);
    }

    private static handleMouseMovement(e: PointerEvent, inputHandler: InputHandler): void {
        inputHandler.currentPointerPosition = {
            x: e.clientX,
            y: e.clientY
        };
    }

    /**
     * Returns the position of the pointer relative to the last poll
     */
    public pollRelativePointerPosition(): PointerPosition {
        const relativePosition = {
            x: this.currentPointerPosition.x - this.lastPolledPointerPosition.x,
            y: this.currentPointerPosition.y - this.lastPolledPointerPosition.y,
        }

        this.lastPolledPointerPosition = this.currentPointerPosition;

        return relativePosition;
    }
}