import { Layer } from "@/NBS";

/**
 * Methods related to editing or displaying the notes of a song.
 */
export class SongEditor {
  constructor(song) {
    /**
     * The song being edited.
     */
    this.song = song;
    /**
     * The currently active key for newly placed notes.
     */
    this.currentKey = 45;
    /**
     * The currently active instrument for newly placed instruments.
     */
    this.currentInstrument = song.instruments[0];
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

  /**
   * Formats a note's key as human readablet text.
   * 
   * Examples results are "A#3" and "F-4"
   */
  formatKey(key) {
    // TODO: strange logic and potentially buggy

    const KEY_TEXT = [
      "A#", "B-", "C-", "C#", "D-", "D#", "E-", "F-", "F#", "G-", "G#", "A-",
    ];

    const keyText = KEY_TEXT[(key - 1) % 12];
    const octave = Math.floor((key - 1) / 12) + 1;
    return `${keyText}${octave}`;
  }
}