<template>
  <div class="toolbar flex flex-row">
    <a @click="newSong" class="button" title="New">
      <img class="button-image" src="@/assets/toolbar/new.svg" alt="New">
    </a>

    <a @click="save" class="button" title="Save">
      <img class="button-image" src="@/assets/toolbar/save.svg" alt="Save">
    </a>

    <a class="open button" title="Open">
      <img class="button-image" src="@/assets/toolbar/open.svg" alt="Open">
      <input type="file" accept=".nbs" @change="loadFile">
    </a>

    <div class="separator"></div>

    <a @click="play" :value="!paused" class="button" title="Play">
      <img class="button-image" src="@/assets/toolbar/play.svg" alt="Play">
    </a>

    <a @click="pause" :value="paused" class="button" title="Pause">
      <img class="button-image" src="@/assets/toolbar/pause.svg" alt="Pause">
    </a>

    <a @click="stop" :value="stopped" class="button" title="Stop">
      <img class="button-image" src="@/assets/toolbar/stop.svg" alt="Stop">
    </a>

    <div class="separator"></div>

    <a @click="toggleLoop" :value="state.options.loop" title="Loop" class="button">
      <img class="button-image" src="@/assets/toolbar/loop.svg" alt="Loop">
    </a>

    <a @click="openInfo" title="Info" class="button">
      <img class="button-image" src="@/assets/toolbar/info.svg" alt="Info">
    </a>

    <a @click="openSettings" title="Settings" class="button">
      <img class="button-image" src="@/assets/toolbar/settings.svg" alt="Settings">
    </a>

    <a title="Volume" class="volume button">
      <img class="button-image" src="@/assets/toolbar/volume.svg" alt="Volume">
      <input type="range" name="volume" v-model.number="state.options.volume" min="0" max="1" step="0.01">
      <span class="volume-amount">{{ formattedVolume }}%</span>
    </a>

    <div class="separator"></div>

    <instrument-button
      v-for="instrument in state.song.instruments"
      :key="instrument.id"
      :instrument="instrument"
      :editor="state.editor"></instrument-button>
  </div>
</template>

<script>
import { Song } from "@/NBS.js";
import { state } from "@/state.js";
import InstrumentButton from "./InstrumentButton.vue";

export default {
  data() {
    return {
      state,
    };
  },

  components: {
    InstrumentButton,
  },

  computed: {
    formattedVolume() {
      return (this.state.options.volume * 100).toFixed(0);
    },
    paused() {
      return this.state.song.paused;
    },
    stopped() {
      return this.paused && this.state.song.currentTime === 0;
    },
  },

  methods: {
    /**
     * Pauses the song
     */
    pause() {
      this.state.song.pause();
    },
    /**
     * Plays the song
     */
    play() {
      this.state.song.play();
    },
    /**
     * Stops the song. (pause & return to start)
     */
    stop() {
      this.state.song.pause();
      this.state.song.currentTick = 0;
    },
    /**
     * Opens the settings menu
     */
    openSettings() {
      this.state.showSettings = true;
    },
    /**
     * Opens the song information overlay
     */
    openInfo() {
      this.state.showSongDetails = true;
    },
    /**
     * Toggles the loop option
     */
    toggleLoop() {
      this.state.options.loop = !this.state.options.loop;
    },
    /**
     * Loads a file from a "change" event on a file input
     */
    loadFile(e) {
      this.pause();
      const file = e.target.files[0];
      state.loadFile(file);
    },
    /**
     * Replaces the existing song with a new empty song.
     */
    newSong() {
      state.setSong(Song.new());
    },
    /**
     * Downloads the song to the user's computer.
     */
    save() {
      const buffer = Song.toArrayBuffer(this.state.song);

      // Convert an ArrayBuffer to a Blob which can actually be downloaded
      const blob = new Blob([buffer], {
        type: "application/octet-stream",
      });
      // Create a URL for the blob that acts like any other URL.
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      // Use the song's given name as the file's name when possible
      link.download = (this.state.song.name || "song") + ".nbs";

      // Append the link to the DOM temporarily so clicking on it has an effect.
      // Without appending it click() silently does nothing.
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },
}
</script>

<style scoped>
.toolbar {
  overflow-x: auto;
}

.separator {
  border-right: 1px solid #999;
  margin: 2px;
}

.button {
  border: 1px solid transparent;
  border-radius: 3px;
  display: inline-block;
  padding: 2px;
  width: 20px;
  height: 20px;
  margin: 2px;
  text-decoration: none;
}
.button:hover,
.button[value="true"] {
  border: 1px solid #999;
}
.button[value="true"] {
  background-image: linear-gradient(#eee, #ccc);
}
.button:active {
  background-color: #ccc;
}
.button-image {
  width: 100%;
  height: 100%;
}

/* Volume Button */
.volume:hover {
  width: initial;
}
.volume input[name="volume"] {
  height: 16px;
  width: 100px;
  margin: 0 10px;
  padding: 0;
}
.volume img {
  width: initial;
}
.volume :not(img) {
  display: none;
}
.volume:hover :not(img) {
  display: initial;
}

/* Open Button */
.open {
  position: relative;
}
.open input[type="file"] {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
