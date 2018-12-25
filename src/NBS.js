import { audioContext } from "./audio.js";

/**
 * NBS.js: JavaScript implementation of parsing, saving, and abstracting .nbs files.
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
     * The length of the longest layer of the song.
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
    /**
     * The song's time signature.
     */
    this.timeSignature = 4;
    /**
     * The minutes spent editing the song.
     */
    this.minutesSpent = 0;
    /**
     * The total left clicks of the song.
     */
    this.leftClicks = 0;
    /**
     * The total right clicks of the song.
     */
    this.rightClicks = 0;
    /**
     * Blocks added to the song.
     */
    this.blocksAdded = 0;
    /**
     * Blocks removed from the song.
     */
    this.blocksRemoved = 0;
    /**
     * The name of the MIDI or schematic that this song was imported from.
     */
    this.midiName = "";
    /**
     * The instruments of the song.
     */
    this.instruments = Instrument.builtin;
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
   * Sets the note at a given tick with a given key and instrument.
   * Automatically expands the song's size if it has now grown.
   */
  setNote(tick, key, instrument) {
    if (tick + 1 > this.song.size) {
      this.song.size = tick + 1;
    }
    const note = new Note(this, tick);
    note.key = key;
    note.instrument = instrument;
    this.notes[tick] = note;
  }

  /**
   * Deletes the tick at a given tick in the song.
   * Does not automatically shrink the song if it has now shrunk in size.
   */
  deleteNote(tick) {
    delete this.notes[tick];
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
  constructor(layer, tick) {
    /**
     * The layer this note is in
     */
    this.layer = layer;
    /**
     * The tick that the note lives in
     */
    this.tick = tick;
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
  constructor(name, id, audioSrc, textureSrc) {
    /**
     * The name of the instrument
     */
    this.name = name;
    /**
     * The ID of the instrument
     */
    this.id = id;
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
    "Harp",
    0,
    require("./assets/instruments/audio/harp.ogg"),
    require("./assets/instruments/textures/harp.png")
  ),
  new Instrument(
    "Double Bass",
    1,
    require("./assets/instruments/audio/dbass.ogg"),
    require("./assets/instruments/textures/dbass.png")
  ),
  new Instrument(
    "Bass Drum",
    2,
    require("./assets/instruments/audio/bdrum.ogg"),
    require("./assets/instruments/textures/bdrum.png")
  ),
  new Instrument(
    "Snare Drum",
    3,
    require("./assets/instruments/audio/sdrum.ogg"),
    require("./assets/instruments/textures/sdrum.png")
  ),
  new Instrument(
    "Click",
    4,
    require("./assets/instruments/audio/click.ogg"),
    require("./assets/instruments/textures/click.png")
  ),
  new Instrument(
    "Guitar",
    5,
    require("./assets/instruments/audio/guitar.ogg"),
    require("./assets/instruments/textures/guitar.png")
  ),
  new Instrument(
    "Flute",
    6,
    require("./assets/instruments/audio/flute.ogg"),
    require("./assets/instruments/textures/flute.png")
  ),
  new Instrument(
    "Bell",
    7,
    require("./assets/instruments/audio/bell.ogg"),
    require("./assets/instruments/textures/bell.png")
  ),
  new Instrument(
    "Chime",
    8,
    require("./assets/instruments/audio/chime.ogg"),
    require("./assets/instruments/textures/chime.png")
  ),
  new Instrument(
    "Xylophone",
    9,
    require("./assets/instruments/audio/xylophone.ogg"),
    require("./assets/instruments/textures/xylophone.png")
  ),
];

/**
 * Parses an array buffer containg the bytes of a .nbs file as a Song.
 */
Song.fromArrayBuffer = function songFromArrayBuffer(arrayBuffer) {
  // https://www.stuffbydavid.com/mcnbs/format

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
  song.size = readShort();
  const totalLayers = readShort();
  song.name = readString();
  song.author = readString();
  song.originalAuthor = readString();
  song.description = readString();
  song.tempo = readShort() / 100; // tempo is stored as real tempo * 100
  readByte(); // auto save enabled (0/1), unused by nbs.js
  readByte(); // auto save duration in minutes, unused by nbs.js
  song.timeSignature = readByte();
  song.minutesSpent = readInt();
  song.leftClicks = readInt();
  song.rightClicks = readInt();
  song.blocksAdded = readInt();
  song.blocksRemoved = readInt();
  song.midiName = readString();

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

  // Layers (optional section)
  if (arrayBuffer.byteLength > currentByte) {
    for (let i = 0; i < totalLayers; i++) {
      const layer = song.addLayer();
      layer.name = readString();
      layer.volume = readByte() / 100;
    }
  }

  // Process raw notes and convert them to real Note objects.
  // Cannot be done while parsing because information about layers and other things might not exist yet.
  for (const rn of rawNotes) {
    // If a note is in a layer that doesn't exist, we will have to create the layers for it.
    // For an example file that does this, see Friday.nbs in any NBS installation
    if (rn.layer >= song.layers.length) {
      while (rn.layer >= song.layers.length) {
        song.addLayer();
      }
    }

    const layer = song.layers[rn.layer];
    const key = rn.key;
    const tick = rn.tick;
    const instrument = song.instruments[rn.instrument];

    layer.setNote(tick, key, instrument);
  }

  return song;
};

/**
 * Converts a song to an array buffer containing the bytes of the corresponding .nbs file
 */
Song.toArrayBuffer = function songToArrayBuffer(song) {
  // https://www.stuffbydavid.com/mcnbs/format

  // Writing to a buffer involves 2 "passes".
  // 1 to determine the size of the buffer, and the other to actually write the file.
  // There are probably better ways to do this, but this works.

  /**
   * Uses provided data operations to write the data of the song.
   */
  function write({
    writeString,
    writeByte,
    writeShort,
    writeInt,
  }) {
    // Part 1 - Header
    writeShort(song.size);
    writeShort(song.layers.length);
    writeString(song.name);
    writeString(song.author);
    writeString(song.originalAuthor);
    writeString(song.description);
    writeShort(song.tempo * 100); // tempo is stored as the real tempo * 100
    writeByte(0); // auto save enabled
    writeByte(0); // auto save duration
    writeByte(song.timeSignature); // time signature
    writeInt(song.minutesSpent); // minutes spent
    writeInt(song.leftClicks); // left clicks
    writeInt(song.rightClicks); // right clicks
    writeInt(song.blocksAdded); // blocks added
    writeInt(song.blocksRemoved); // blocks removed
    writeString(song.midiName); // midi/schematic name

    // Part 2 - Notes
    let currentTick = -1;
    for (let i = 0; i < song.size; i++) {
      // Determine if there are any notes in this tick.
      let hasNotes = false;
      for (const layer of song.layers) {
        if (layer.notes[i]) {
          hasNotes = true;
          break;
        }
      }

      if (!hasNotes) {
        continue;
      }

      const jumpsToNextTick = i - currentTick;
      currentTick = i;

      // Part 2 step 1
      writeShort(jumpsToNextTick);

      let currentLayer = -1;

      for (let j = 0; j < song.layers.length; j++) {
        const layer = song.layers[j];
        const note = layer.notes[i];
        if (note) {
          const jumpsToNextLayer = j - currentLayer;
          currentLayer = j;
          writeShort(jumpsToNextLayer); // Part 2 step 2 - jumps to next layer
          writeByte(note.instrument.id); // Part 2 step 3 - instrument
          writeByte(note.key); // Part 2 step 4 - key
        }
      }

      // Part 2 step 2 - end tick
      writeShort(0);
    }
    // Part 2 step 1 - end note section
    writeShort(0);

    // Part 3 - Layers
    for (const layer of song.layers) {
      writeString(layer.name);
      writeByte(Math.floor(layer.volume * 100)); // we store volume as 0-1 but it the format needs 0-100
    }

    // Part 4 - Custom Instruments.
    // Since custom instruments are not supported, we use just 0 custom instruments.
    writeByte(0);
  }

  // In the first pass all the writing operations just accumlate to the bufferSize.
  // We'll use this to make the array buffer later for the actual writing.
  let bufferSize = 0;
  write({
    writeString(str) {
      // 1 byte for each character + 4 bytes for length
      bufferSize += str.length + 4;
    },
    writeByte() {
      bufferSize += 1;
    },
    writeShort() {
      bufferSize += 2;
    },
    writeInt() {
      bufferSize += 4;
    },
  });

  // Use the determined size to actually do the writing.
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const dataView = new DataView(arrayBuffer);
  let currentByte = 0;
  write({
    // pass real byte writing methods.
    writeByte,
    writeShort,
    writeInt,
    writeString,
  });

  function writeByte(byte) {
    dataView.setInt8(currentByte, byte, true);
    currentByte += 1;
  }

  function writeUnsignedByte(byte) {
    dataView.setUint8(currentByte, byte, true);
    currentByte += 1;
  }

  function writeShort(short) {
    dataView.setInt16(currentByte, short, true);
    currentByte += 2;
  }

  function writeInt(int) {
    dataView.setInt32(currentByte, int, true);
    currentByte += 4;
  }

  function writeString(string) {
    writeInt(string.length);
    for (const i of string) {
      writeUnsignedByte(i.charCodeAt(0));
    }
  }

  return arrayBuffer;
};

/**
 * Creates a new song that is setup to be used.
 */
Song.new = function newSong() {
  const song = new Song();
  song.addLayer();
  return song;
};
