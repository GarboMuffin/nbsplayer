import { audioContext } from "./audio.js";

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
    const layer = new Layer();
    this.layers.push(layer);
    return layer;
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

export class Layer {
  constructor() {
    this.name = "";
    this.volume = 1;
    this.notes = [];
    this.id = Layer.lastId++;
  }

  get placeholder() {
    return "Layer " + this.id;
  }
}
Layer.lastId = 0;

export class Note {
  constructor() {
    this.key = 45;
    this.instrument = null;
    this.lastPlayed = null;
  }
}

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

Instrument.builtin = [
  new Instrument(
    "Piano/Harp",
    require("./assets/instruments/harp.ogg"),
    require("./assets/instruments/harp.png"),
  ),
  new Instrument(
    "Double Bass",
    require("./assets/instruments/dbass.ogg"),
    require("./assets/instruments/dbass.png")
  ), // 1
  new Instrument(
    "Bass Drum",
    require("./assets/instruments/bdrum.ogg"),
    require("./assets/instruments/bdrum.png")
  ), // 2
  new Instrument(
    "Snare Drum",
    require("./assets/instruments/sdrum.ogg"),
    require("./assets/instruments/sdrum.png")
  ), // 3
  new Instrument(
    "Click",
    require("./assets/instruments/click.ogg"),
    require("./assets/instruments/click.png")
  ), // 4
  new Instrument(
    "Guitar",
    require("./assets/instruments/guitar.ogg"),
    require("./assets/instruments/guitar.png")
  ), // 5
  new Instrument(
    "Flute",
    require("./assets/instruments/flute.ogg"),
    require("./assets/instruments/flute.png")
  ), // 6
  new Instrument(
    "Bell",
    require("./assets/instruments/bell.ogg"),
    require("./assets/instruments/bell.png")
  ), // 7
  new Instrument(
    "Chime",
    require("./assets/instruments/chime.ogg"),
    require("./assets/instruments/chime.png")
  ), // 8
  new Instrument(
    "Xylophone",
    require("./assets/instruments/xylobone.ogg"),
    require("./assets/instruments/xylophone.png")
  ), // 9
];

Song.fromArrayBuffer = function songFromArrayBuffer(arrayBuffer) {
  // JavaScript .nbs parser.
  // https://www.stuffbydavid.com/mcnbs/format

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
    const layer = new Layer();
    layer.name = readString();
    layer.volume = readByte() / 100;
    layers.push(layer);
  }

  // TODO: parse custom instruments

  // Parsing is now done.

  // Set fields
  const song = new Song();
  song.layers = layers;
  song.author = songAuthor;
  song.name = songName;
  song.tempo = 20 / (tempo / 100) * 50;
  song.paused = false;

  // Process notes
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
