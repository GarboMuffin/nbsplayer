import { Layer } from "@/NBS";

/**
 * A visible part of a screen.
 */
export class Viewport {
  constructor() {
    /**
     * The first visible tick of the song.
     * Must *not* have decimals.
     */
    this.firstTick = 0;
  }

  /**
   * The last visible tick of the song. May have decimals.
   */
  get lastTick() {
    return this.firstTick + this.width;
  }
  set lastTick(tick) {
    this.firstTick = tick - this.width;
  }
}

/**
 * Methods related to editing or displaying the notes of a song.
 */
export class SongEditor {
  /**
   * Formats a note's key as human readable text.
   * 
   * Examples results are "A#3" and "F-4"
   */
  static formatKey(key) {
    const KEY_TEXT = [
      "C-", "C#", "D-", "D#", "E-", "F-", "F#", "G-", "G#", "A-", "A#", "B-", 
    ];

    const keyText = KEY_TEXT[(key - 3) % 12];
    const octave = Math.floor((key - 3) / 12) + 1;
    return `${keyText}${octave}`;
  }

  constructor(song) {
    /**
     * The song being edited.
     */
    this.song = song;
    /**
     * The currently active key for newly placed notes.
     */
    this.currentKey = 45; // F#4
    /**
     * The currently active instrument for newly placed instruments.
     */
    this.currentInstrument = song.instruments[0];
    /**
     * The currently visible part of the song.
     */
    this.viewport = new Viewport();
  }

  /**
   * Gets a layer
   */
  getLayer(layer) {
    if (layer instanceof Layer) {
      return layer;
    } else if (typeof layer === "number") {
      if (this.song.layers[layer]) {
        return this.song.layers[layer];
      }
    }
    throw new Error("Unknown layer: " + layer);
  }

  /**
   * Places a note using the currently active key and instrument
   */
  placeNote(layer, tick) {
    this.setNote(layer, tick, this.currentKey, this.currentInstrument);
  }

  /**
   * Gets a note
   */
  getNote(layer, tick) {
    return this.getLayer(layer).notes[tick];
  }

  /**
   * Sets a note in a song
   */
  setNote(layer, tick, key, instrument) {
    this.getLayer(layer).setNote(tick, key, instrument);
  }

  /**
   * Deletes a note of a song
   */
  deleteNote(layer, tick) {
    this.getLayer(layer).deleteNote(tick);
  }

  /**
   * Replaces the current settings with those of a note.
   * Similar to the "Pick Block" feature of Minecraft.
   */
  pickNote(note) {
    this.currentInstrument = note.instrument;
    this.currentKey = note.key;
  }

  seekTick(tick) {
    this.song.currentTick = tick;
    // TODO: updateViewport()?
  }

  /**
   * Updates the viewport and ensures the current tick is currently in view.
   */
  updateViewport() {
    if (this.song.currentTick >= this.viewport.lastTick) {
      this.viewport.firstTick = this.song.tick;
    }
    if (this.song.currentTick < this.viewport.firstTick) {
      this.viewport.firstTick = this.song.tick;
    }
  }
}
