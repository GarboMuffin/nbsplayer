<template>
  <div id="app">
    <!-- Overlays -->

    <loading-overlay :visible="loading"></loading-overlay>
    <welcome-overlay ref="welcomeOverlay" :visible="showWelcome"></welcome-overlay>
    <song-details-overlay ref="songDetailsOverlay" :song="song"></song-details-overlay>
    <settings-overlay ref="settingsOverlay" :options="options" :song="song"></settings-overlay>

    <div class="flex flex-column">
      <div>
        <toolbar :song="song" :options="options"></toolbar>
      </div>
      <div>
        <div class="flex flex-row" id="middle">
          <div id="layer-list" class="flex flex-column">
            <time-box :song="song"></time-box>
            <layer-meta :layer="layer" :key="layer.id" v-for="layer in song.layers"></layer-meta>
            <!-- parenthesis after addLayer are required due to classes being weird about `this` -->
            <button @click="song.addLayer()" class="row">+ layer</button>
          </div>

          <note-canvas :song="song" ref="canvas"></note-canvas>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import * as NBS from "./NBS.js";
import { audioContext, audioDestination } from "./audio.js";
import NoteCanvas from "./components/NoteCanvas.vue";
import LayerMeta from "./components/LayerMeta.vue";
import TimeBox from "./components/TimeBox.vue";
import LoadingOverlay from "./components/overlays/LoadingOverlay.vue";
import WelcomeOverlay from "./components/overlays/WelcomeOverlay.vue";
import SettingsOverlay from "./components/overlays/SettingsOverlay.vue";
import SongDetailsOverlay from "./components/overlays/SongDetailsOverlay.vue";
import Toolbar from "./components/toolbar/Toolbar.vue";

export default {
  components: {
    NoteCanvas,
    LayerMeta,
    LoadingOverlay,
    WelcomeOverlay,
    SettingsOverlay,
    SongDetailsOverlay,
    TimeBox,
    Toolbar,
  },

  data() {
    return {
      loading: true,
      showWelcome: false,
      song: new NBS.Song(),
      previousTime: -1,
      lastPlayedTick: -1,
      options: {
        keyOffset: 45,
        loop: false,
        volume: 1,
      },
    };
  },

  mounted() {
    // Load builtin instruments and other assets
    const instruments = NBS.Instrument.builtin;
    Promise.all(instruments.map((i) => i.load()))
      .then(() => {
        this.loading = false;
        this.showWelcome = true;
        requestAnimationFrame((time) => this.tick(time));
      });

    // Create some starter layers.
    for (var i = 0; i < 5; i++) {
      this.song.addLayer();
    }

    // for debugging, expose the app
    window.app = this;
  },

  watch: {
    "options.volume"(volume) {
      audioDestination.gain.value = volume;
    },
  },

  methods: {
    loadFile(file) {
      this.loading = true;

      // Load the file as an arraybuffer so we can really operate on it.
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      // Promise wrapper so other functions can know if/when the loading finishes.
      return new Promise((resolve, reject) => {
        fileReader.onload = (e) => {
          const song = NBS.Song.fromArrayBuffer(e.target.result);
          this.song = song;
          this.loading = false;
          if (song.title || song.author || song.originalAuthor || song.description) {
            this.$refs.songDetailsOverlay.show();
          }
          resolve(song);
        };
        fileReader.onerror = (err) => reject(err);
      });
    },

    playNote(note, layer) {
      // Determine the playbackRate using the key
      const keyChange = note.key - this.options.keyOffset;
      const playbackRate = 2 ** (keyChange / 12);

      // Create an audio source using the instrument's buffer
      const source = audioContext.createBufferSource();
      source.playbackRate.value = playbackRate;
      source.buffer = note.instrument.audioBuffer;
      source.start(0);

      // If our layer volume is not 100% and we are set to respect layer volume,
      // then use a gain node to apply that volume
      // TODO: maybe the layers should have gain node that all notes connect to?
      if (layer.volume !== 100) {
        const gainNode = audioContext.createGain();
        gainNode.gain.value = layer.volume;
        source.connect(gainNode);
        return gainNode;
      }

      return source;
    },

    advanceSong(time, timePassed) {
      if (this.song.paused) {
        return;
      }

      // Handle the song ending.
      if (this.song.currentTime >= this.song.totalTime) {
        if (this.options.loop) {
          this.song.currentTime = 0;
        } else {
          this.song.paused = true;
        }
        return;
      }

      this.song.currentTime += timePassed;

      // Don't play the same tick several times.
      if (this.song.currentTick === this.lastPlayedTick) {
        return;
      }
      this.lastPlayedTick = this.song.currentTick;

      for (const layer of this.song.layers) {
        const note = layer.notes[this.song.currentTick];
        if (note) {
          this.playNote(note, layer).connect(audioDestination);
          note.lastPlayed = time;
        }
      }
    },

    tick(time) {
      requestAnimationFrame((time) => this.tick(time));

      // Determine the amount of time that has passed, up to 500 ms
      // If the time is above 500 ms then most likely the timer stopped for a bit (tabbed out, or something)
      // and skipping ahead 30 seconds if the user has been gone 30 seconds is bad design.
      const timePassed = Math.min(time - this.previousTime, 500);
      this.previousTime = time;

      // Advance the song forward.
      this.advanceSong(time, timePassed);

      // Draw the canvas after updating the song.
      this.$refs.canvas.draw(time);
    },
  }
}
</script>

<style>
body {
  font-family: sans-serif;
  margin: 0;
}
code {
  font-family: "Consolas", "Courier New", Courier, monospace;
}

/* Make links look more like links by default */
a {
  cursor: pointer;
}
a:hover {
  text-decoration: underline;
}

table.compact,
table.compact tr,
table.compact th,
table.compact td {
  padding: 0;
  border-collapse: collapse;
}

/* Hide spinners on some numer inputs */
.no-spinners {
  -moz-appearance: textfield;
}
.no-spinners::-webkit-outer-spin-button,
.no-spinners::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Flex Styles */
.flex {
  display: flex;
}
.flex-row {
  flex-direction: row;
}
.flex-column {
  flex-direction: column;
}
.flex-center {
  align-items: center;
}

/* Overlays */
.overlay {
  /* always centered */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* make it look half decent */
  background-color: #ededed;
  border-left: 1px solid #e4e4e4;
  border-top: 1px solid #e4e4e4;
  border-radius: 7px;
  padding: 15px 30px;
  box-shadow: 3px 3px #111;
  /* visibility is handled by js */
}

#layer-list {
  height: 100%;
  border-right: 1px solid #777;
}
#layer-list > .row {
  height: 32px;
  width: 200px;
}
#middle {
  border-top: 1px solid #777;
  border-bottom: 1px solid #777;
}
</style>
