import { Layer, Instrument } from "./NBS";

/**
 * Methods related to editing or displaying the notes of a song.
 */
export class SongEditor {
  constructor(song) {
    /**
     * The song being edited.
     */
    this.song = song;
    this.currentKey = 45;
    this.currentInstrument = song.instruments[0];
  }

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

  placeNote(layer, tick) {
    this.getLayer(layer).setNote(tick, this.currentKey, this.currentInstrument);
  }

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
   * Formats a note's key as human readablet text.
   * 
   * Format is "{note}{octave}", so you might get "A#3", "G-5", etc.
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