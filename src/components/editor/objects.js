import { NOTE_SIZE } from "./config.js";
import { state } from "@/state.js";

/**
 * An object in the editor.
 */
export class EditorObject {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.height = 0;
    this.width = 0;
  }

  /**
   * Updates the sprite in some way.
   */
  update(vm) {
    // left to implementations
  }

  /**
   * Determines if this object intersects a point.
   * If both `a` and `b` are provided, the point to be tested is (a, b)
   * If only `a` is provided, the point to be tested is (a.x, a.y)
   */
  intersectsPoint(a, b) {
    if (!b) {
      var x2 = a.x;
      var y2 = a.y;
    } else {
      var x2 = a;
      var y2 = b;
    }
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    return x2 >= x && x2 <= x + w && y2 >= y && y2 <= y + h;
  }

  /**
   * Render this object on a 2d canvas.
   */
  render(ctx) {
    throw new Error("EditorObject did not implement `render(ctx) { ... }`");
  }

  /**
   * Attempt to begin an interaction with this object.
   * `true` indicates that the interaction has successfully started, `false` indicates that it has not.
   * `false` does not mean an error has occurred, just that this object does not want to be interacted with.
   */
  interact(vm) {
    return false;
  }

  /**
   * The object has been dragged after the interaction has started.
   * Is given the delta x and delta y (movement in x and y direction)
   */
  dragged(vm, dx, dy) {
    // left to implementations
  }

  /**
   * Indicates the object is no longer being interacted with.
   */
  interactEnd(vm, button) {
    // left to implementations
  }

  get centerX() {
    return this.x + (this.width / 2);
  }
}

/**
 * A horizontal scrollbar for the song.
 */
export class Scrollbar extends EditorObject {
  constructor() {
    super();
    this.color = "black";
    this.height = 16;
    this.mouseHover = false;
    this.active = false;
    this.visible = true;
  }

  update(vm) {
    this.width = Math.max((vm.editor.viewport.width / vm.song.size) * vm.canvas.width, 12);
    this.x = vm.editor.viewport.firstTick / vm.song.size * vm.ctx.canvas.width;
    this.y = vm.canvas.height - this.height;
    this.visible = vm.song.size > vm.editor.viewport.width;

    if (this.active) {
      this.color = "#555";
    } else if (this.intersectsPoint(vm.mouse)) {
      this.color = "#666";
    } else {
      this.color = "#777";
    }
  }

  render(ctx) {
    if (this.visible) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  interact(vm, button) {
    if (button === 0) {
      this.active = true;
      return true;
    }
    return false;
  }

  interactEnd(vm) {
    this.active = false;
  }

  dragged(vm, dx, dy) {
    const ticksMoved = dx / vm.canvas.width * vm.song.size;
    const newTick = vm.song.currentTick + ticksMoved;
    vm.song.currentTick = newTick;
    vm.editor.viewport.firstTick = Math.floor(newTick) - 1;
    vm.song.pause();
  }
}

/**
 * A vertical line in the editor.
 */
export class EditorLine extends EditorObject {
  constructor() {
    super();
    /**
     * The tick that this line will display at.
     */
    this.value = 0;
    /**
     * The thickness of the line visually. Does not affect hitbox.
     */
    this.visualWidth = 2;
    /**
     * The real width of the line used in collision detection with the mouse. Does not affect visual appearance.
     */
    this.width = 4;
    /**
     * Is this line draggable?
     */
    this.draggable = false;
    /**
     * Is this line currently being dragged?
     */
    this.dragging = false;
    /**
     * The color of the line.
     */
    this.color = "black";
  }

  update(vm) {
    // Note to children: you **must** call super.update
    this.x = (this.value - vm.editor.viewport.firstTick) * NOTE_SIZE - (this.width / 2);
    this.height = vm.ctx.canvas.height;
    if (this.draggable && (this.dragging || this.intersectsPoint(vm.mouse))) {
      vm.cursor = "ew-resize";
    }
  }

  render(ctx) {
    // Note to children: you **must** call super.render
    const x = this.centerX - this.visualWidth / 2;
    if (x + this.width < 0 || x > ctx.canvas.width) {
      return;
    }
    ctx.fillStyle = this.color;
    ctx.fillRect(x, 0, this.visualWidth, this.height);
  }

  interact(vm, button) {
    if (button === 0 && this.draggable) {
      this.dragging = true;
      return true;
    }
    return false;
  }

  interactEnd(vm) {
    // Note to children: you **must** call super.interactEnd
    this.dragging = false;
  }
}

/**
 * The "seeker line", shows the current position in the song and allows you to seek to different parts.
 */
export class SeekerLine extends EditorLine {
  update(vm) {
    this.value = vm.song.currentTick;
    this.draggable = true;
    super.update(vm);
  }

  dragged(vm, dx, dy) {
    const ticksMoved = dx / NOTE_SIZE;
    vm.song.currentTick += ticksMoved;
    vm.song.pause();
  }

  render(ctx) {
    super.render(ctx);
    ctx.beginPath();
    ctx.moveTo(this.centerX - 8, 0);
    ctx.lineTo(this.centerX + 8, 0);
    ctx.lineTo(this.centerX, 8);
    ctx.fill();
  }
}

/**
 * Shows the start of the song.
 */
export class SongStartLine extends EditorLine {
  constructor() {
    super();
    this.value = 0;
    this.visualWidth = 1;
    this.color = "#999";
  }
}

/**
 * Shows the end of the song.
 */
export class SongEndLine extends EditorLine {
  constructor() {
    super();
    this.visualWidth = 1;
    this.color = "#999";
    this.draggable = true;
  }

  update(vm) {
    if (!this.dragging) {
      this.value = vm.song.size;
    }
    super.update(vm);
  }

  dragged(vm, dx, dy) {
    this.value += dx / NOTE_SIZE;
  }

  interactEnd(vm) {
    this.value = Math.round(this.value);
    vm.song.size = this.value;
    super.interactEnd(vm);
  }
}

export class EditorWrapper extends EditorObject {
  constructor() {
    super();
    this.reset();
  }

  intersectsPoint() {
    // we are everywhere.
    return true;
  }

  render() {
    // do nothing
  }

  reset() {
    this.button = 0;
    this.moved = false;
  }

  interact(vm, button) {
    this.button = button;
    const tick = Math.floor(vm.mouse.x / NOTE_SIZE) + vm.editor.viewport.firstTick;
    const layer = Math.floor(vm.mouse.y / NOTE_SIZE) - 1;
    if (this.button === 0) {
      const note = vm.editor.placeNote(layer, tick);
      state.playNote(note);
    } else if (button === 1) {
      const note = vm.editor.getNote(layer, tick);
      if (note) {
        vm.editor.pickNote(note);
      }
    } else if (button === 2) {
      vm.editor.deleteNote(layer, tick);
    }
    return true;
  }
}
