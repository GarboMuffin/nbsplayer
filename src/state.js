import Vue from "vue";
import { Song } from "./NBS.js";
import { audioDestination } from "./audio.js";
import { SongEditor } from "./components/editor/editor.js";

/**
 * Global shared state.
 */
export const state = new Vue({
  // Uses a Vue instance so that the data here is "reactive" and it provides some helper methods.
  // I found Vuex to be very clumsy with little to no gain.

  data() {
    const data = {
      /**
       * Is something still loading?
       */
      loading: true,
      /**
       * Currently loaded song
       */
      song: Song.new(),
      /**
       * Allows you to edit the song.
       */
      editor: null,
      /**
       * Show the welcome message?
       */
      showWelcome: false,
      /**
       * Show the song details overlay?
       */
      showSongDetails: false,
      /**
       * Show the settings overlay?
       */
      showSettings: false,
      /**
       * Somewhat-global options.
       */
      options: {
        /**
         * Offset of note key to the actual sound that is played.
         */
        keyOffset: 45, // F#4
        /**
         * Loop the song
         */
        loop: false,
        /**
         * Global volume of the song. (0-1)
         */
        volume: 1,
      },
    };

    data.editor = new SongEditor(data.song);

    return data;
  },

  watch: {
    "options.volume"(volume) {
      audioDestination.gain.value = volume;
    },
  },

  methods: {
    setSong(song) {
      this.song = song;
      this.editor = new SongEditor(song);
    },

    /**
     * Loads a file as the current song.
     */
    loadFile(file) {
      this.loading = true;

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
          this.loading = false;
          this.setSong(song);
          if (song.name || song.author || song.originalAuthor || song.description) {
            this.showSongDetails = true;
          }
          resolve(song);
        };
        fileReader.onerror = (err) => reject(err);
      });
    },
  },
});
