<template>
  <div id="app">

    <!-- Overlays -->
    <overlay dismissable :overlay="overlays.welcome">
      <welcome-overlay></welcome-overlay>
    </overlay>

    <overlay :overlay="overlays.loading">
      <loading-overlay></loading-overlay>
    </overlay>

    <overlay dismissable :overlay="overlays.info">
      <song-details-overlay></song-details-overlay>
    </overlay>

    <overlay dismissable :overlay="overlays.settings">
      <settings-overlay></settings-overlay>
    </overlay>

    <!-- Core Interface -->

    <div id="main-container">
      <toolbar id="toolbar"></toolbar>
      <div id="middle">
        <layer-list id="layer-list"></layer-list>
        <note-canvas ref="canvas"></note-canvas>
      </div>
    </div>
  </div>
</template>

<script>
import * as NBS from "./NBS.js";
import { audioContext, audioDestination } from "./audio.js";
import sharedState from "./state.js";

import Overlay from "./components/overlays/Overlay.vue";
import LoadingOverlay from "./components/overlays/LoadingOverlay.vue";
import WelcomeOverlay from "./components/overlays/WelcomeOverlay.vue";
import SettingsOverlay from "./components/overlays/SettingsOverlay.vue";
import SongDetailsOverlay from "./components/overlays/SongDetailsOverlay.vue";
import Toolbar from "./components/toolbar/Toolbar.vue";
import LayerList from "./components/layers/LayerList.vue";
import NoteCanvas from "./components/NoteCanvas.vue";

window.sharedState = sharedState;

export default {
  components: {
    Overlay,
    LoadingOverlay,
    WelcomeOverlay,
    SettingsOverlay,
    SongDetailsOverlay,
    Toolbar,
    LayerList,
    NoteCanvas,
  },

  data() {
    return {
      previousTime: -1,
      lastPlayedTick: -1,
      sharedState,
    };
  },

  watch: {
    "options.volume"(volume) {
      audioDestination.gain.value = volume;
    },
  },

  mounted() {
    // Load builtin instruments and other assets
    const instruments = NBS.Instrument.builtin;
    Promise.all(instruments.map((i) => i.load()))
      .then(() => {
        this.overlays.loading.visible = false;
        this.overlays.welcome.visible = true;
        requestAnimationFrame(this.tick);
      });
  },

  computed: {
    song() {
      return sharedState.song;
    },
    options() {
      return sharedState.options;
    },
    overlays() {
      return sharedState.overlays;
    },
  },

  methods: {
    /**
     * Plays a note.
     */
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

    /**
     * Advanced the song forward.
     */
    advanceSong(time, timePassed) {
      if (this.song.paused) {
        return;
      }

      // Handle the song ending.
      if (this.song.currentTick >= this.song.size) {
        if (this.options.loop) {
          this.song.currentTick = 0;
        } else {
          this.song.paused = true;
        }
        return;
      }

      const ticksPassed = timePassed / this.song.timePerTick;
      this.song.currentTick += ticksPassed;

      // song.tick is a getter that uses currenTick, we do not have to manually set it.
      if (this.song.tick === this.lastPlayedTick) {
        return;
      }
      this.lastPlayedTick = this.song.tick;

      for (const layer of this.song.layers) {
        const note = layer.notes[this.song.tick];
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
      requestAnimationFrame(this.tick);

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
  /* firefox */
  -moz-appearance: textfield;
}
.no-spinners::-webkit-outer-spin-button,
.no-spinners::-webkit-inner-spin-button {
  /* webkit */
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

#main-container {
  display: grid;
  width: 100vw;
  height: 100vh;
  grid-template-rows: 30px auto;
  grid-template-columns: auto;
}

#toolbar {
  border-bottom: 1px solid #777;
}

#middle {
  display: grid;
  width: 100vw;
  grid-template-rows: auto;
  grid-template-columns: 200px auto;
  overflow-y: scroll;
  background-image: url("assets/layersbackground.jpg");
}

#layer-list {
  border-right: 1px solid #777;
}
</style>
