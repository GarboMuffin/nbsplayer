<template>
  <div class="flex flex-row">
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

    <span class="separator"></span>

    <a @click="play" :value="!song.paused" class="button" title="Play">
      <img class="button-image" src="@/assets/toolbar/play.svg" alt="Play">
    </a>

    <a @click="pause" :value="song.paused" class="button" title="Pause">
      <img class="button-image" src="@/assets/toolbar/pause.svg" alt="Pause">
    </a>

    <a @click="stop" class="button" title="Stop">
      <img class="button-image" src="@/assets/toolbar/stop.svg" alt="Stop">
    </a>

    <span class="separator"></span>

    <a @click="options.loop = !options.loop" :value="options.loop" title="Loop" class="button">
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
      <input type="range" name="volume" v-model.number="options.volume" min="0" max="1" step="0.01">
      <span class="volume-amount">{{ formattedVolume }}%</span>
    </a>
  </div>
</template>

<script>
import * as NBS from "@/NBS.js";

export default {
  props: {
    song: NBS.Song,
    options: Object,
  },
  data() {
    return {
      
    };
  },
  computed: {
    formattedVolume() {
      return (this.options.volume * 100).toFixed(0);
    },
  },
  methods: {
    /**
     * Pauses the song
     */
    pause() {
      this.song.pause();
    },
    /**
     * Plays the song
     */
    play() {
      this.song.play();
    },
    /**
     * Stops the song. (pause & return to start)
     */
    stop() {
      this.song.pause();
      this.song.currentTick = 0;
    },
    /**
     * Opens the settings menu
     */
    openSettings() {
      this.$parent.$refs.settingsOverlay.show();
    },
    /**
     * Opens the song information overlay
     */
    openInfo() {
      this.$parent.$refs.songDetailsOverlay.show();
    },
    /**
     * Loads a file from a "change" event on a file input
     */
    loadFile(e) {
      this.pause();
      const file = e.target.files[0];
      this.$parent.loadFile(file);
    },
    newSong() {
      this.$parent.song = NBS.Song.new();
    },
    save() {
      const buffer = NBS.Song.toArrayBuffer(this.song);
      const array = new Uint8Array(buffer);
      const blob = new Blob([buffer], {
        type: "application/octet-stream",
      });
      var url = URL.createObjectURL(blob);

      // Create a link and click on it automatically.
      // This is dirty and probably won't work in some browsers.
      const link = document.createElement("a");
      link.href = url;
      link.download = (this.song.name || "song") + ".nbs";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },
}
</script>

<style scoped>
.separator {
  border-right: 1px solid #999;
  margin: 2px;
}

.button {
  border: 1px solid transparent;
  border-radius: 3px;
  display: inline-block;
  width: calc(10px + 1vh);
  height: calc(10px + 1vh);
  padding: 2px;
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
  background-image: linear-gradient(#ccc, #aaa);
}
.button-image {
  width: 100%;
  height: 100%;
}

.volume:hover {
  width: initial;
}
.volume input[name="volume"] {
  height: 16px;
  width: 100px;
  margin: 0 10px;
  padding: 0;
}
.volume :not(img) {
  display: none;
}
.volume:hover :not(img) {
  display: initial;
}

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
