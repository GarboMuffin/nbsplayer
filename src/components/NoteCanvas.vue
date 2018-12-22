<template>
  <canvas
    ref="canvas"
    @mousedown.prevent="handleMouse"
    @mouseup.prevent="handleMouse"
    @mousemove="handleMouse"
  ></canvas>
</template>

<script>
import * as NBS from "../NBS.js";

const ROW_HEIGHT = 32;
const NOTE_SIZE = 32;

const SEEKER_SIZE = 2;
const SEEKER_SELECT = SEEKER_SIZE * 2;

const SCROLLBAR_HEIGHT = 16;
const SCROLLBAR_MIN_WIDTH = 12;
const SCROLLBAR_INACTIVE_COLOR = "#777";
const SCROLLBAR_ACTIVE_COLOR = "#555";
const SCROLLBAR_HOVER_COLOR = "#666";

const KEY_TEXT = [
  "A#", "B-", "C-", "C#", "D-", "D#", "E-", "F-", "F#", "G-", "G#", "A-",
];

export default {
  props: {
    song: NBS.Song,
  },
  data() {
    return {
      /**
       * The canvas used for rendering
       */
      canvas: null,
      /**
       * The canvas rendering context.
       */
      ctx: null,
      /**
       * Cache for note textures. Maps a texture ID to the texture.
       */
      textureCache: new Map(),
      /**
       * The cursor to display on the canvas. Updated every frame.
       */
      cursor: "",
      /**
       * The mouse's position and state.
       */
      mouse: {
        x: 0,
        y: 0,
        right: false,
        left: false,
        middle: false,
      },
      /**
       * The start of the current page. In ticks, should never have decimals.
       */
      pageStart: 0,
      /**
       * The bounding rect of the canvas element.
       * Updated every frame.
       */
      boundingRects: {
        x: 0,
        y: 0,
        height: 0,
        width: 0,
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
      },
      /**
       * Whether or not the seeker is being dragged.
       */
      draggingSeeker: false,
      /**
       * Whether or not the scrollbar is being dragged.
       */
      draggingScrollbar: false,
    };
  },

  computed: {
    /**
     * The end of the current page, in ticks. May have decimals.
     */
    pageEnd: {
      cache: false,
      get() {
        return this.pageStart + this.canvas.width / NOTE_SIZE;
      }
    },
    /**
     * The amount of ticks that are visible on the canvas.
     */
    visibleTicks() {
      return Math.ceil(this.canvas.width / NOTE_SIZE);
    },
    /**
     * The amount of layers that are visible on the canvas.
     */
    visibleLayers() {
      const maxVisibleLayers = Math.ceil(this.canvas.height / ROW_HEIGHT);
      return Math.min(this.song.layers.length, maxVisibleLayers);
    },
  },

  mounted() {
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d");
    // TODO: WebGL?
  },

  methods: {
    /**
     * Handles mouse movements and events.
     */
    handleMouse(e) {
      if (e.type === "mouseup" || e.type === "mousedown") {
        const isDown = e.type === "mousedown";
        if (e.button === 0) {
          this.mouse.left = isDown;
        } else if (e.button === 1) {
          this.mouse.middle = isDown;
        } else if (e.button === 2) {
          this.mouse.right = isDown;
        }
      } else if (e.type === "mousemove") {
        const prevX = this.mouse.x;
        const prevY = this.mouse.y;

        this.mouse.x = e.clientX - this.boundingRects.left;
        this.mouse.y = e.clientY - this.boundingRects.top;

        // Scrollbar movements are prioritized over seeker movements, etc.
        if (this.draggingScrollbar) {
          this.dragScrollbar(prevX, this.mouse.x);
        } else if (this.draggingSeeker) {
          this.dragSeeker(prevX, this.mouse.x);
        }
      }
    },

    /**
     * Determines if the mouse intersects a rectangle with a given x coordinate, y coordinate, width, and height.
     */
    mouseIntersects(x, y, w, h) {
      const mx = this.mouse.x;
      const my = this.mouse.y;
      return mx >= x && mx <= x + w && my >= y && my <= y + h;
    },

    /**
     * Drags the seeker from one coordinate (x1) to another coordinate (x2) on the screen.
     */
    dragSeeker(x1, x2) {
      const movement = x2 - x1;
      const ticksMoved = movement / NOTE_SIZE;
      this.song.currentTick += ticksMoved;
      this.song.paused = true;
    },

    /**
     * Drags the scrollbar from one coordinate (x1) to another coordinate (x2) on the screen.
     */
    dragScrollbar(x1, x2) {
      const movement = x2 - x1;
      const percentMoved = movement / this.canvas.width;
      const ticksMoved = percentMoved * this.song.size;
      const newTick = this.song.currentTick + ticksMoved;
      this.song.currentTick = newTick;
      // pageStart cannot have decimals, and start the page 1 before the new current tick.
      this.pageStart = Math.floor(newTick) - 1;
      this.song.paused = true;
    },

    /**
     * Draws the "seeker", the bar that shows the current time.
     * It can be dragged to "seek" around the song.
     */
    drawSeeker() {
      // the current tick, relative to the current screen.
      const screenRelativeTick = this.song.currentTick - this.pageStart;
      const x = screenRelativeTick * NOTE_SIZE;
      this.ctx.fillStyle = "#000000";

      // subtract half the width from the x coordinate so the center of the bar is the true position
      this.ctx.fillRect(x - SEEKER_SIZE / 2, 0, SEEKER_SIZE, this.canvas.height);

      // If the mouse is within an infinity tall rectangle around the seeker
      if (this.mouseIntersects(x - SEEKER_SELECT / 2, 0, SEEKER_SELECT, Infinity)) {
        // user is hovering over the seeker right now
        this.draggingSeeker = this.mouse.left;
        // left/right resize, looks like an error pointing left and right
        this.cursor = "ew-resize";
      } else {
        this.draggingSeeker = false;
      }
    },

    /**
     * Draws a scrollbar at the bottom of the canvas.
     */
    drawScrollbar() {
      // The percentage of the screen that is currently on screen.
      const percentOnScreen = this.visibleTicks / this.song.size;
      const scrollbarWidth = Math.max(percentOnScreen * this.canvas.width, SCROLLBAR_MIN_WIDTH);

      // The percentage of the screen that is to the left of the screen.
      const percentToLeft = this.pageStart / this.song.size;
      const scrollbarStart = percentToLeft * this.canvas.width;

      const startY = this.canvas.height - SCROLLBAR_HEIGHT;

      // The mouse's intersection with the scrollbar changes its color.
      const mouseIntersects = this.mouseIntersects(scrollbarStart, startY, scrollbarWidth, SCROLLBAR_HEIGHT);
      if (mouseIntersects) {
        this.draggingScrollbar = this.mouse.left;
        if (this.mouse.left) {
          this.ctx.fillStyle = SCROLLBAR_ACTIVE_COLOR;
        } else {
          this.ctx.fillStyle = SCROLLBAR_HOVER_COLOR;
        }
      } else {
        // Even if the mouse is not on the scrollbar we did not immediately stop the interaction.
        // If the user grabs the scrollbar then moves the mouse up, they still want to grab it
        // until they release their mouse.
        if (this.draggingScrollbar && !this.mouse.left) {
          this.draggingScrollbar = false;
        }
        this.ctx.fillStyle = SCROLLBAR_INACTIVE_COLOR;
      }

      this.ctx.fillRect(scrollbarStart, startY, scrollbarWidth, SCROLLBAR_HEIGHT);
    },

    /**
     * Draws all notes that are currently visible.
     * Draws notes starting at (0, 0), translate() the canvas if this is not intended.
     */
    drawNotes(time) {
      /**
       * Creates a texture for a noteblock with a given instrument and key.
       */
      const createNoteTexture = (instrument, key) => {
        // Create a canvas that lets us do image operations
        const canvas = document.createElement("canvas");
        canvas.width = NOTE_SIZE;
        canvas.height = NOTE_SIZE;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(instrument.baseTexture, 0, 0);

        // Draw the key text centered
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const keyText = KEY_TEXT[(key - 1) % 12];
        const octave = Math.floor((key - 1) / 12) + 1;
        const text = keyText + octave.toString();
        ctx.fillText(text, NOTE_SIZE / 2, NOTE_SIZE / 2);

        return canvas;
      };

      // Determine what we need to draw.
      const visibleTicks = this.visibleTicks;
      const visibleLayers = this.visibleLayers;
      const pageStart = this.pageStart;
      const pageEnd = this.pageEnd;

      // The note rendering loop loops through all the layers, and then through each note we need to draw.
      for (let l = 0; l < visibleLayers; l++) {
        const layer = this.song.layers[l];

        // Skip rows which do not contain enough notes to be rendered at this point
        if (layer.notes.length < pageStart) {
          continue;
        }

        const y = l * ROW_HEIGHT;

        // TODO: fix layer culling
        // Skip rows in which we know that they will be offscreen
        // if (Math.abs(this.boundingRects.y) - NOTE_SIZE > y || this.boundingRects.y + this.boundingRects.height + NOTE_SIZE < y) {
        //  continue;
        // }

        for (let t = pageStart; t < pageEnd; t++) {
          const x = (t - pageStart) * NOTE_SIZE;
          const note = layer.notes[t];

          // Ofcourse theres no guarantee that a note exists at any point in a layer.
          if (!note) {
            continue;
          }

          // If the note has been played recently (1s), we will make it render slightly transparent to indicate it
          // was recently played.
          const timeSincePlayed = note.lastPlayed === null ? Infinity : time - note.lastPlayed;
          if (timeSincePlayed < 1000) {
            // Opacity between 1 (played exactly 1s ago) and 0.5 (played exactly 0s ago)
            this.ctx.globalAlpha = 1 - (1000 - timeSincePlayed) / 2000;
          }

          // A hopefully unique id given to this note's texture.
          // All notes with the same characteristics will have the same texture id.
          const textureId = `${note.instrument.id}-${note.key}`;

          // Creating the note textures is slow, so they're cached in a map.
          // The texture is only created when it does not exist in the cache.
          if (!this.textureCache.has(textureId)) {
            const texture = createNoteTexture(note.instrument, note.key);
            this.textureCache.set(textureId, texture);
          }
          this.ctx.drawImage(this.textureCache.get(textureId), x, y);

          // If we mucked with the opacity, remeber to cleanup after ourselves.
          if (timeSincePlayed < 1000) {
            this.ctx.globalAlpha = 1;
          }
        }
      }
    },

    /**
     * Draws the canvas.
     */
    draw(time) {
      // Temporary and dirty hack to handhold browser other than firefox and seem to behave differently
      // when it comes to what `height: 100%` means
      if (!navigator.userAgent.includes("Firefox")) {
        const rows = this.song.layers.length + 2;
        this.canvas.style.height = (rows * ROW_HEIGHT) + "px";
      }

      const boundingClientRect = this.canvas.getBoundingClientRect();
      this.canvas.height = boundingClientRect.height;
      this.canvas.width = boundingClientRect.width;
      this.boundingRects = boundingClientRect;

      // Reset the cursor so it can change later.
      this.cursor = "";

      // Go to the next screen when the song has moved passed the end of this page.
      if (this.song.currentTick >= this.pageEnd) {
        this.pageStart = this.song.tick;
      }

      // Go back a screen when the song has moved before our screen
      if (this.song.currentTick < this.pageStart) {
        this.pageStart = this.song.tick;
      }

      // Use translate() to shift the coordinate grid a bit during rendering.
      // Simplifies drawNotes() since it can assume (0, 0) is where it should start working from.
      this.ctx.save();
      this.ctx.translate(0, ROW_HEIGHT); // shifts coordinate grid up 1 row
      this.drawNotes(time);
      this.ctx.restore();

      this.drawSeeker();

      // Scrollbar should only be drawn if the entire song does not fit on a single screen.
      if (this.song.size > this.visibleTicks) {
        this.drawScrollbar();
      }

      // Apply any changes to the cursor that have happened.
      this.canvas.style.cursor = this.cursor;
    },
  },
}
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
