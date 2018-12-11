import { audioContext } from "./audio.js";

/**
 * JavaScript implementation of .nbs files.
 */

/**
 * Represents a song.
 */
export class Song {
  constructor() {
    /**
     * The name (or title) of this song.
     */
    this.name = "";
    /**
     * The author of this song.
     */
    this.author = "";
    /**
     * The original author of this song.
     */
    this.originalAuthor = "";
    /**
     * The song's description.
     */
    this.description = "";

    /**
     * Layers of the song
     */
    this.layers = [];
    /**
     * The tempo of the song in ticks per second.
     */
    this.tempo = 5;
    /**
     * The total number of ticks in the song.
     */
    this.size = 0;

    /**
     * The current playing tick of a song.
     * Can contain decimals.
     */
    this.currentTick = 0;
    /**
     * Is the song paused? (as in, not playing)
     */
    this.paused = true;
  }

  /**
   * Adds a new layer to the song and returns it.
   */
  addLayer() {
    const layer = new Layer(this, this.layers.length + 1);
    this.layers.push(layer);
    return layer;
  }

  /**
   * Deletes a layer from the song.
   */
  deleteLayer(layer) {
    const index = this.layers.indexOf(layer);
    this.layers.splice(index, 1);
  }

  /**
   * Sets a note at a given tick in a given layer
   */
  setNote(layer, tick, note) {
    if (tick > this.size) {
      this.size = tick;
    }
    layer.notes[tick] = note;
  }

  /**
   * Plays the song
   */
  play() {
    if (this.currentTick >= this.size) {
      this.currentTick = 0;
    }
    this.paused = false;
  }

  /**
   * Pauses the song
   */
  pause() {
    this.paused = true;
  }

  /**
   * The time that each takes, in milliseconds.
   */
  get timePerTick() {
    return 20 / this.tempo * 50;
  }

  /**
   * The current time, in milliseconds, of the song.
   */
  get currentTime() {
    return this.currentTick * this.timePerTick;
  }

  /**
   * The length of the song in milliseconds.
   */
  get endTime() {
    return this.size * this.timePerTick;
  }

  /**
   * Gets the currently active tick in the song.
   * Will not contain decimals.
   */
  get tick() {
    return Math.floor(this.currentTick);
  }
}

/**
 * Represents a layer in a song
 */
export class Layer {
  constructor(song, id) {
    /**
     * The parent song of this layer.
     */
    this.song = song;
    /**
     * The name of this layer.
     */
    this.name = "";
    /**
     * The volume of this layer.
     * A number between 0 and 1.
     */
    this.volume = 1;
    /**
     * The notes within this layer.
     * Not all indexes will have a note.
     */
    this.notes = [];
    /**
     * The ID of this layer.
     * Is not guaranteed to be unique.
     */
    this.id = id;
  }

  /**
   * Deletes this layer.
   */
  delete() {
    this.song.deleteLayer(this);
  }

  /**
   * The placeholder name of this layer.
   */
  get placeholder() {
    return "Layer " + this.id;
  }
}

/**
 * Represents a note in a song
 */
export class Note {
  constructor() {
    /**
     * The key of the note.
     */
    this.key = 45;
    /**
     * The instrument of the note.
     * TODO: null is not a good default value
     */
    this.instrument = null;
    /**
     * The last time the note was played.
     * TODO: does this need to be here?
     */
    this.lastPlayed = null;
  }
}

/**
 * Represents an instrument
 */
export class Instrument {
  constructor(name, audioSrc, textureSrc) {
    /**
     * The name of the instrument
     */
    this.name = name;
    /**
     * The source to be fetched for the instrument's sound
     */
    this.audioSrc = audioSrc;
    /**
     * The image to be fetched for the instrument's image in the editor
     */
    this.textureSrc = textureSrc;
    /**
     * The resulting audio buffer that will contain the sound
     * Set by loadAudio() or load()
     */
    this.audioBuffer = null;
  }

  load() {
    return Promise.all([this.loadAudio(), this.loadTexture()]);
  }

  /**
   * Fetches the sound from the internet
   */
  loadAudio() {
    return fetch(this.audioSrc)
      .then((data) => data.arrayBuffer())
      .then((audioData) => audioContext.decodeAudioData(audioData))
      .then((buffer) => this.audioBuffer = buffer);
  }

  /**
   * Fetchs the texture from the internet
   */
  loadTexture() {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = this.textureSrc;
      this.baseTexture = image;
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(e);
    });
  }
}

/**
 * Builtin instruments
 */
Instrument.builtin = [
  // Vue will set the correct sources and sometimes inline images using require()
  new Instrument(
    "Piano/Harp",
    require("./assets/instruments/audio/harp.ogg"),
    require("./assets/instruments/textures/harp.png")
  ),
  new Instrument(
    "Double Bass",
    require("./assets/instruments/audio/dbass.ogg"),
    require("./assets/instruments/textures/dbass.png")
  ),
  new Instrument(
    "Bass Drum",
    require("./assets/instruments/audio/bdrum.ogg"),
    require("./assets/instruments/textures/bdrum.png")
  ),
  new Instrument(
    "Snare Drum",
    require("./assets/instruments/audio/sdrum.ogg"),
    require("./assets/instruments/textures/sdrum.png")
  ),
  new Instrument(
    "Click",
    require("./assets/instruments/audio/click.ogg"),
    require("./assets/instruments/textures/click.png")
  ),
  new Instrument(
    "Guitar",
    require("./assets/instruments/audio/guitar.ogg"),
    require("./assets/instruments/textures/guitar.png")
  ),
  new Instrument(
    "Flute",
    require("./assets/instruments/audio/flute.ogg"),
    require("./assets/instruments/textures/flute.png")
  ),
  new Instrument(
    "Bell",
    require("./assets/instruments/audio/bell.ogg"),
    require("./assets/instruments/textures/bell.png")
  ),
  new Instrument(
    "Chime",
    require("./assets/instruments/audio/chime.ogg"),
    require("./assets/instruments/textures/chime.png")
  ),
  new Instrument(
    "Xylophone",
    require("./assets/instruments/audio/xylobone.ogg"),
    require("./assets/instruments/textures/xylophone.png")
  ),
];

/**
 * Parses an array buffer containg the bytes of a .nbs file as a Song.
 */
Song.fromArrayBuffer = function songFromArrayBuffer(arrayBuffer) {
  // https://www.stuffbydavid.com/mcnbs/format

  // TODO: error handling

  const song = new Song();
  const viewer = new DataView(arrayBuffer);
  let currentByte = 0;

  /**
   * Reads a signed byte from the buffer and advances the current byte by 1.
   */
  function readByte() {
    const result = viewer.getInt8(currentByte, true);
    currentByte += 1;
    return result;
  }

  /**
   * Reads an unsigned byte form the buffer and advances the current byte by 1.
   */
  function readUnsignedByte() {
    const result = viewer.getUint8(currentByte, true);
    currentByte += 1;
    return result;
  }

  /**
   * Reads a signed 2 byte number (eg. a short) from the buffer and advanced the current byte by 2.
   */
  function readShort() {
    const result = viewer.getInt16(currentByte, true);
    currentByte += 2;
    return result;
  }

  /**
   * Reads a signed 4 byte number (eg. an integer) from the buffer and advanced the current byte by 4.
   */
  function readInt() {
    const result = viewer.getInt32(currentByte, true);
    currentByte += 4;
    return result;
  }

  /**
   * Reads a string from the buffer and advanced the current byte until the end of the string.
   * Strings begin with a signed integer (the length), followed by that many bytes of the string's data.
   */
  function readString() {
    const length = readInt();
    let result = "";
    for (let i = 0; i < length; i++) {
      const byte = readUnsignedByte();
      result += String.fromCharCode(byte);
    }
    return result;
  }

  // Header
  const size = readShort();
  const totalLayers = readShort();
  const songName = readString();
  const songAuthor = readString();
  const originalSongAuthor = readString();
  const songDescription = readString();
  const tempo = readShort();
  const autoSaveEnabled = readByte();
  const autoSaveDuration = readByte();
  const timeSignature = readByte();
  const minutesSpent = readInt();
  const leftClicks = readInt();
  const rightClicks = readInt();
  const blocksAdded = readInt();
  const blocksRemoved = readInt();
  const midiName = readString();

  // Note Blocks
  // The format website linked somewhere above does a much better job at explaining this than I could.
  let currentTick = -1;
  const rawNotes = [];
  while (true) {
    const jumpsToNextTick = readShort();
    if (jumpsToNextTick === 0) {
      break;
    }
    currentTick += jumpsToNextTick;
    let currentLayer = -1;
    while (true) {
      const jumpsToNextLayer = readShort();
      if (jumpsToNextLayer === 0) {
        break;
      }
      currentLayer += jumpsToNextLayer;
      const instrumentId = readByte();
      const key = readByte();
      // We'll process the raw note into a real Note object later.
      rawNotes.push({
        instrument: instrumentId,
        key,
        layer: currentLayer,
        tick: currentTick,
      });
    }
  }

  // Layers
  for (let i = 0; i < totalLayers; i++) {
    const layer = song.addLayer();
    layer.name = readString();
    layer.volume = readByte() / 100;
  }

  // TODO: custom instruments, at least acknowledge their existence

  // Set the fields of the song to match the file
  song.author = songAuthor;
  song.name = songName;
  song.originalAuthor = originalSongAuthor;
  song.description = songDescription;
  // the raw tempo is ticks per second * 100, so divide by 100 to get the real tempo
  song.size = size;
  song.tempo = tempo / 100;

  // Process raw notes and convert them to real Note objects.
  // Cannot be done while parsing because information about layers and other things might not exist yet.
  for (const rn of rawNotes) {
    const note = new Note();
    note.key = rn.key;
    note.instrument = Instrument.builtin[rn.instrument];

    // If a note is in a layer that doesn't exist, we will have to create the layers for it.
    // For an example file that does this, see Friday.nbs in an NBS installation
    // TODO: determine what NBS does in this scenario, should they be skipped instead?
    if (rn.layer >= song.layers.length) {
      while (rn.layer >= song.layers.length) {
        song.addLayer();
      }
    }

    const layer = song.layers[rn.layer];
    const tick = rn.tick;
    song.setNote(layer, tick, note);
  }

  return song;
};
