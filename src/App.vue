<template>
  <div id="app">

    <!-- Overlays -->
    <overlay :visible="state.showWelcome" ref="welcomeOverlay" dismissable>
      <welcome-overlay></welcome-overlay>
    </overlay>

    <overlay :visible="state.loading">
      <loading-overlay></loading-overlay>
    </overlay>

    <overlay ref="songDetailsOverlay" dismissable>
      <song-details-overlay :song="state.song"></song-details-overlay>
    </overlay>

    <overlay ref="settingsOverlay" dismissable>
      <settings-overlay :options="state.options"></settings-overlay>
    </overlay>

    <!-- Core Interface -->
    <div id="main">
      <toolbar id="toolbar"></toolbar>
      <div id="middle">
        <layer-list :song="state.song" id="layer-list"></layer-list>
        <note-canvas :song="state.song" ref="canvas" id="note-canvas"></note-canvas>
      </div>
    </div>

  </div>
</template>

<script>
import * as NBS from "./NBS.js";
import { audioContext, audioDestination } from "./audio.js";
import NoteCanvas from "./components/NoteCanvas.vue";
import LayerList from "./components/layers/LayerList.vue";
import Overlay from "./components/overlays/Overlay.vue";
import LoadingOverlay from "./components/overlays/LoadingOverlay.vue";
import WelcomeOverlay from "./components/overlays/WelcomeOverlay.vue";
import SettingsOverlay from "./components/overlays/SettingsOverlay.vue";
import SongDetailsOverlay from "./components/overlays/SongDetailsOverlay.vue";
import Toolbar from "./components/toolbar/Toolbar.vue";

import { state } from "@/state.js";

export default {
  components: {
    NoteCanvas,
    Overlay,
    LoadingOverlay,
    WelcomeOverlay,
    SettingsOverlay,
    SongDetailsOverlay,
    Toolbar,
    LayerList,
  },

  data() {
    return {
      state,
      previousTime: -1,
      lastPlayedTick: -1,
      nextFrame: 0,
    };
  },

  mounted() {
    // Load builtin instruments and other assets
    const instruments = NBS.Instrument.builtin;
    Promise.all(instruments.map((i) => i.load()))
      .then(() => {
        this.state.loading = false;
        this.state.showWelcome = true;
        requestAnimationFrame((time) => this.tick(time));
      });
  },

  beforeDestroy() {
    // Stop the frame loop if the app is unmounted for whatever reason.
    cancelAnimationFrame(this.nextFrame);
  },

  watch: {
    "state.options.volume"(volume) {
      audioDestination.gain.value = volume;
    },
  },

  methods: {
    /**
     * Plays a note given its layer.
     */
    playNote(note, layer) {
      // Determine the playbackRate using the key
      const keyChange = note.key - this.state.options.keyOffset;
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

    /**
     * Advanced the song forward.
     */
    advanceSong(time, timePassed) {
      const song = this.state.song;

      if (song.paused) {
        return;
      }

      // Handle the song ending.
      if (song.currentTick >= song.size) {
        if (this.state.options.loop) {
          song.currentTick = 0;
        } else {
          song.paused = true;
        }
        return;
      }

      const ticksPassed = timePassed / song.timePerTick;
      song.currentTick += ticksPassed;

      // song.tick is a getter that uses currenTick, we do not have to manually set it.
      if (song.tick === this.lastPlayedTick) {
        return;
      }
      this.lastPlayedTick = song.tick;

      for (const layer of song.layers) {
        const note = layer.notes[song.tick];
        if (note) {
          this.playNote(note, layer).connect(audioDestination);
          note.lastPlayed = time;
        }
      }
    },

    /**
     * Global frame loop. Constantly called with requestAnimationFrame()
     */
    tick(time) {
      this.nextFrame = requestAnimationFrame((time) => this.tick(time));

      // Determine the amount of time that has passed, up to 500 ms
      // If the time is above 500 ms then most likely the timer stopped for a bit (tabbed out, or something)
      // and skipping ahead 30 seconds if the user has been gone 30 seconds is bad design.
      const timePassed = Math.min(time - this.previousTime, 500);
      this.previousTime = time;

      // Advance the song forward.
      this.advanceSong(time, timePassed);

      // Draw the canvas after updating the song.
      if (this.$refs.canvas) {
        this.$refs.canvas.draw(time);
      }
    },
  }
}
</script>

<style>
/* Make body look half decent */
body {
  font-family: sans-serif;
  margin: 0;
}

/* Make links look more like links by default */
a {
  cursor: pointer;
}
a:hover {
  text-decoration: underline;
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

/* Utility Classes */

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

#main {
  display: grid;
  width: 100vw;
  height: 100vh;
  grid-template-rows: 30px auto;
  grid-template-columns: auto;
}
#layer-list {
  border-right: 1px solid #777;
}
#toolbar {
  border-bottom: 1px solid #777;
}
#middle {
  display: grid;
  width: 100vw;
  grid-template-rows: auto;
  grid-template-columns: 200px auto;
  overflow-y: auto;
  background-image: url("assets/layersbackground.jpg");
  background-attachment: local;
}
</style>
