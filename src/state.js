import { Song } from "@/NBS.js";

/**
 * Represents the current shared state of the app.
 */
export default {
  /**
   * The current song.
   */
  song: Song.new(),

  /**
   * Global options.
   */
  options: {
    loop: false,
    keyOffset: 45,
    volume: 1,
  },

  /**
   * Overlay visiblity.
   */
  overlays: {
    welcome: { visible: false },
    info: { visible: false },
    settings: { visible: false },
    loading: { visible: false },
  },

  // Methods

  /**
   * Loads a given file as the current song.
   */
  loadFile(file) {
    this.overlays.loading.visible = true;

    // Load the file as an arraybuffer so we can really operate on it.
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    // Promise wrapper so other functions can know if/when the loading finishes.
    return new Promise((resolve, reject) => {
      fileReader.onload = (e) => {
        try {
          var song = Song.fromArrayBuffer(e.target.result);
        } catch (e) {
          reject(e);
          return;
        }
        this.overlays.loading.visible = false;
        this.song = song;
        if (song.name || song.author || song.originalAuthor || song.description) {
          this.overlays.info.visible = true;
        }
        resolve(song);
      };
      fileReader.onerror = (err) => reject(err);
    });
  },
};
