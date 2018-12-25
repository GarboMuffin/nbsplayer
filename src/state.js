import Vue from "vue";
import { Song } from "./NBS.js";

/**
 * Global shared state.
 */
export const state = new Vue({
  // Uses a Vue instance so that the data here is "reactive" and it provides some helper methods.
  // I found Vuex to be very clumsy with little to no gain.

  data() {
    return {
      /**
       * Is something still loading?
       */
      loading: true,
      /**
       * Currently loaded song
       */
      song: Song.new(),
      /**
       * Show the welcome message?
       */
      showWelcome: false,
      /**
       * Somewhat-global options.
       */
      options: {
        /**
         * Offset of note key to the actual sound that is played.
         */
        keyOffset: 45,
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
  },

  watch: {
    "options.volume"(volume) {
      audioDestination.gain.value = volume;
    },
  },

  methods: {
    setSong(song) {
      this.song = song;
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
            this.$refs.songDetailsOverlay.show();
          }
          resolve(song);
        };
        fileReader.onerror = (err) => reject(err);
      });
    },
  },
});
