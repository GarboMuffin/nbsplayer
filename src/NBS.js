import { audioContext } from "./audio.js";

/**
 * JavaScript implementation of .nbs files.
 */

/**
 * Represents a song.
 */
export class Song {
  constructor() {
    this.name = "";
    this.author = "";
    this.originalAuthor = "";
    this.description = "";
    this.layers = [];
    this.currentTime = 0;
    this.paused = true;
    this.tempo = 100;
    this.size = 0;
  }

  setNote(layer, tick, note) {
    if (tick > this.size) {
      this.size = tick;
    }
    layer.notes[tick] = note;
  }

  addLayer() {
    const layer = new Layer(this);
    this.layers.push(layer);
    return layer;
  }

  deleteLayer(layer) {
    const index = this.layers.indexOf(layer);
    this.layers.splice(index, 1);
  }

  play() {
    if (this.currentTime >= this.totalTime) {
      this.currentTime = 0;
    }
    this.paused = false;
  }

  pause() {
    this.paused = true;
  }

  get currentTick() {
    return Math.floor(this.currentTime / this.tempo);
  }
  set currentTick(tick) {
    this.currentTime = Math.max(tick * this.tempo, 0);
  }

  get exactTick() {
    return this.currentTime / this.tempo;
  }
  set exactTick(tick) {
    this.currentTime = Math.max(tick * this.tempo, 0);
  }

  get totalTime() {
    return (this.size + 1) * this.tempo;
  }
}

/**
 * Represents a layer in a song
 */
export class Layer {
  constructor(song) {
    this.song = song;
    this.name = "";
    this.volume = 1;
    this.notes = [];
    this.id = Layer.lastId++;
  }

  delete() {
    this.song.deleteLayer(this);
  }

  get placeholder() {
    return "Layer " + this.id;
  }
}
Layer.lastId = 0;

/**
 * Represents a note in a song
 */
export class Note {
  constructor() {
    this.key = 45;
    this.instrument = null;
    this.lastPlayed = null;
  }
}

/**
 * Represents an instrument
 */
export class Instrument {
  constructor(name, audioSrc, textureSrc) {
    this.name = name;
    this.audioSrc = audioSrc;
    this.textureSrc = textureSrc;
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
    require("./assets/instruments/harp.ogg"),
    require("./assets/instruments/harp.png"),
  ),
  new Instrument(
    "Double Bass",
    require("./assets/instruments/dbass.ogg"),
    require("./assets/instruments/dbass.png")
  ),
  new Instrument(
    "Bass Drum",
    require("./assets/instruments/bdrum.ogg"),
    require("./assets/instruments/bdrum.png")
  ),
  new Instrument(
    "Snare Drum",
    require("./assets/instruments/sdrum.ogg"),
    require("./assets/instruments/sdrum.png")
  ),
  new Instrument(
    "Click",
    require("./assets/instruments/click.ogg"),
    require("./assets/instruments/click.png")
  ),
  new Instrument(
    "Guitar",
    require("./assets/instruments/guitar.ogg"),
    require("./assets/instruments/guitar.png")
  ),
  new Instrument(
    "Flute",
    require("./assets/instruments/flute.ogg"),
    require("./assets/instruments/flute.png")
  ),
  new Instrument(
    "Bell",
    require("./assets/instruments/bell.ogg"),
    require("./assets/instruments/bell.png")
  ),
  new Instrument(
    "Chime",
    require("./assets/instruments/chime.ogg"),
    require("./assets/instruments/chime.png")
  ),
  new Instrument(
    "Xylophone",
    require("./assets/instruments/xylobone.ogg"),
    require("./assets/instruments/xylophone.png")
  ),
];

/**
 * Parses an array buffer containg the bytes of a .nbs file as a Song.
 */
Song.fromArrayBuffer = function songFromArrayBuffer(arrayBuffer) {
  // https://www.stuffbydavid.com/mcnbs/format

  // Create the song object right away. We'll be using it a lot.
  const song = new Song();

  let currentByte = 0;
  const viewer = new DataView(arrayBuffer);

  function readByte() {
    const result = viewer.getInt8(currentByte, true);
    currentByte += 1;
    return result;
  }

  function readShort() {
    const result = viewer.getInt16(currentByte, true);
    currentByte += 2;
    return result;
  }

  function readInt() {
    const result = viewer.getInt32(currentByte, true);
    currentByte += 4;
    return result;
  }

  function readString() {
    const length = readInt();
    let result = "";
    for (let i = 0; i < length; i++) {
      const byte = readByte();
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
      rawNotes.push({
        instrument: instrumentId,
        key,
        layer: currentLayer,
        tick: currentTick,
      });
    }
  }

  // Layers
  const layers = [];
  for (let i = 0; i < totalLayers; i++) {
    const layer = new Layer(song);
    layer.name = readString();
    layer.volume = readByte() / 100;
    layers.push(layer);
  }

  // TODO: parse custom instruments

  // Parsing is now done.

  // Create the song
  song.author = songAuthor;
  song.name = songName;
  song.originalAuthor = originalSongAuthor;
  song.description = songDescription;
  song.layers = layers;
  // TODO: can be simplified
  song.tempo = 20 / (tempo / 100) * 50;
  song.paused = true;

  // Process notes
  // Cannot be done while parsing because information about layers does not exist yet.
  // TODO: actually it could happen during parsing
  for (const rn of rawNotes) {
    const note = new Note();
    note.key = rn.key;
    note.instrument = Instrument.builtin[rn.instrument];
    const layer = layers[rn.layer];
    const tick = rn.tick;
    song.setNote(layer, tick, note);
  }

  return song;
};
