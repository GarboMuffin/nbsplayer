<template>
  <div class="editor">
    <canvas
      ref="canvas"
      @mousedown.prevent="handleMouse"
      @mouseup.prevent="handleMouse"
      @mousemove="handleMouse"
      @contextmenu.prevent
    ></canvas>
  </div>
</template>

<script>
/**
 * Editor.vue is essentially a small game engine.
 * It has a list of "objects" (sprites) that are updated and rendered sequentially.
 */

import * as NBS from "@/NBS.js";
import { SongEditor } from "./editor.js";
import { NOTE_SIZE } from "./config.js";
import * as Objects from "./objects.js";

export default {
  props: {
    editor: SongEditor,
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
      textureCache: {},
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
       * The bounding rect of the canvas element.
       * Updated at the start of every frame.
       */
      boundingRects: null,
      /**
       * Objets within this editor.
       */
      objects: [],
      /**
       * The object currently being interacted with, if any.
       */
      interaction: null,
    };
  },

  mounted() {
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d");

    this.objects.push(new Objects.EditorWrapper());
    this.objects.push(new Objects.SongEndLine());
    this.objects.push(new Objects.SongStartLine());
    this.objects.push(new Objects.SeekerLine());
    this.objects.push(new Objects.Scrollbar());
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

        if (isDown) {
          this.findInteraction(e.button);
        } else {
          this.endInteraction();
        }
      } else if (e.type === "mousemove") {
        const prevX = this.mouse.x;
        const prevY = this.mouse.y;

        this.mouse.x = e.clientX - this.boundingRects.left;
        this.mouse.y = e.clientY - this.boundingRects.top;

        if (this.interaction) {
          const dx = this.mouse.x - prevX;
          const dy = this.mouse.y - prevY;
          this.interaction.dragged(this, dx, dy);
        }
      }
    },

    /**
     * Ends the current interaction, if any.
     */
    endInteraction() {
      if (!this.interaction) {
        return;
      }
      this.interaction.interactEnd(this);
      this.interaction = null;
    },

    /**
     * Attempts to find an object to interact with and begins the interaction with that object.
     */
    findInteraction(button) {
      // We do interaction searching on objects in reverse.
      // Objects that are later in the list are displayed on top and naturally should be prioritized for interactions.

      let i = this.objects.length;
      while (i--) {
        const object = this.objects[i];
        if (object.intersectsPoint(this.mouse)) {
          const interaction = object.interact(this, button);
          if (interaction) {
            this.interaction = object;
            return true;
          }
        }
      }

      return false;
    },

    /**
     * Updates all objects.
     */
    updateObjects() {
      for (const object of this.objects) {
        object.update(this);
      }
    },

    /**
     * Renders all objects.
     */
    renderObjects(time) {
      for (const object of this.objects) {
        object.render(this.ctx, time);
      }
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

        const text = SongEditor.formatKey(key);
        ctx.fillText(text, NOTE_SIZE / 2, NOTE_SIZE / 2);

        return canvas;
      };

      // Determine what we need to draw.
      const visibleTicks = this.editor.viewport.width;
      const start = this.editor.viewport.firstTick;
      const end = this.editor.viewport.lastTick;

      // The note rendering loop loops through all the layers, and then through each note we need to draw.
      for (let l = 0; l < this.song.layers.length; l++) {
        const layer = this.song.layers[l];

        // Skip rows which do not contain enough notes to be rendered at this point
        if (layer.notes.length < start) {
          continue;
        }

        const y = l * NOTE_SIZE;

        for (let t = start; t < end; t++) {
          const x = (t - start) * NOTE_SIZE;
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

          if (!(textureId in this.textureCache)) {
            const texture = createNoteTexture(note.instrument, note.key);
            this.textureCache[textureId] = texture;
          }
          this.ctx.drawImage(this.textureCache[textureId], x, y);

          // If we mucked with the opacity, remeber to cleanup after ourselves.
          if (timeSincePlayed < 1000) {
            this.ctx.globalAlpha = 1;
          }
        }
      }
    },

    /**
     * Updates the canvas.
     */
    update(time) {
      // TODO: getting client rects is slow, cache it?
      const boundingClientRect = this.canvas.getBoundingClientRect();
      this.canvas.height = boundingClientRect.height;
      this.canvas.width = boundingClientRect.width;
      this.boundingRects = boundingClientRect;
      this.editor.viewport.width = this.canvas.width / NOTE_SIZE;
      this.editor.updateViewport();

      this.cursor = "";

      this.updateObjects();

      // Note rendering is handled outside of updateObjects and renderObjects. It's simpler this way.
      // drawNotes assumes it can start at (0, 0) for simplicity, so translate the canvas to make it work correctly.
      this.ctx.save();
      this.ctx.translate(0, NOTE_SIZE);
      this.drawNotes(time);
      this.ctx.restore();

      this.renderObjects(time);

      this.canvas.style.cursor = this.cursor;
    },
  },
}
</script>

<style scoped>
/* weird position jank to make the canvas size correctly in all browsers */
.editor {
  position: relative;
}
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
