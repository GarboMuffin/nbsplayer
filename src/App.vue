<template>
  <div id="app">
    <!-- Overlays -->

    <loading-overlay :visible="loading"></loading-overlay>
    <welcome-overlay :visible="showWelcome"></welcome-overlay>

    <!-- Editor Layout -->
    <table id="main" class="compact">
      <tr id="toolbar-container">
        <td colspan="2">
          <button @click="song.paused = !song.paused">{{ song.paused ? "PLAY" : "PAUSE"}}</button>
          <button @click="showWelcome = true">GO BACK</button>
        </td>
      </tr>

      <tr valign="top" id="middle">

        <td id="layer-list">
          <time-box :song="song"></time-box>
          <layer-meta :layer="layer" :key="layer.id" v-for="layer in song.layers"></layer-meta>
          <!-- parenthesis after addLayer are required due to classes being weird about `this` -->
          <button @click="song.addLayer()" class="row">+ layer</button>
        </td>

        <td id="canvas-container">
          <note-canvas :song="song"></note-canvas>
        </td>

      </tr>
    </table>

    <br>
    <br>

    <!-- TODO: move these options elsewhere -->
    <div><label>Volume <input type="range" v-model.number="options.volume" min="0" max="1" step="0.01"> {{ options.volume * 100 + "%" }}</label></div>
    <div><label>Loop <input type="checkbox" v-model="options.loop"></label></div>
    <div><label>Key Offset <input type="number" v-model.number="options.keyOffset"></label></div>
    <div><label>Tempo <input type="number" v-model.number="song.tempo" step="any"> ms per tick</label></div>

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

export default {
  components: {
    NoteCanvas,
    LayerMeta,
    LoadingOverlay,
    WelcomeOverlay,
    TimeBox,
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

    tick(time) {
      requestAnimationFrame((time) => this.tick(time));

      // Determine the amount of time that has passed, up to 500 ms
      // If the time is above 500 ms then most likely the timer stopped for a bit (tabbed out, or something)
      // and skipping ahead 30 seconds if the user has been gone 30 seconds is bad design.
      const timePassed = Math.min(time - this.previousTime, 500);
      this.previousTime = time;

      if (this.song.paused) {
        return;
      }

      // Handle the song ending.
      if (this.song.currentTime >= this.song.totalTime) {
        if (this.options.loop) {
          this.song.currentTime = 0;
        } else {
          this.song.paused = false;
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

table.compact,
table.compact tr,
table.compact th,
table.compact td {
  padding: 0;
  border-collapse: collapse;
}

.overlay {
  /* always centered */
  position: fixed;
  top: 50%;
  left: 50%;
  text-align: center;
  transform: translate(-50%, -50%);
  /* make it look half decent */
  background-color: #ededed;
  border-left: 1px solid #e4e4e4;
  border-top: 1px solid #e4e4e4;
  border-radius: 7px;
  padding: 10px 85px;
  box-shadow: 3px 3px #111;
}

#layer-list {
  height: 100%;
  border-right: 1px solid #777;
}
#layer-list > .row {
  height: 32px;
  width: 200px;
}
#canvas-container {
  width: 100%;
  height: 100%;
}
#toolbar-container {
  height: 20px;
}
#middle {
  border-top: 1px solid #777;
  border-bottom: 1px solid #777;
}
</style>
