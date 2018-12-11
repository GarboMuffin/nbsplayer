<template>
  <div class="flex flex-row">
    <a @click="openOpen" class="button" title="Open">
      <img src="@/assets/toolbar/open.svg" alt="Open">
    </a>
    <span class="separator"></span>
    <a @click="play" :value="!song.paused" class="button" title="Play">
      <img src="@/assets/toolbar/play.svg" alt="Play">
    </a>
    <a @click="pause" :value="song.paused" class="button" title="Pause">
      <img src="@/assets/toolbar/pause.svg" alt="Pause">
    </a>
    <a @click="stop" class="button" title="Stop">
      <img src="@/assets/toolbar/stop.svg" alt="Stop">
    </a>
    <span class="separator"></span>
    <a @click="options.loop = !options.loop" :value="options.loop" title="Loop" class="button">
      <img src="@/assets/toolbar/loop.svg" alt="Loop">
    </a>
    <a title="Volume" class="volume button">
      <img src="@/assets/toolbar/volume.svg" alt="Volume">
      <input type="range" name="volume" v-model.number="options.volume" min="0" max="1" step="0.01">
      <span class="volume-amount">{{ formattedVolume }}%</span>
    </a>
    <a @click="openSettings" title="Settings" class="button">
      <img src="@/assets/toolbar/settings.svg" alt="Settings">
    </a>
  </div>
</template>

<script>
export default {
  props: ["song", "options"],
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
      this.song.currentTime = 0;
    },
    /**
     * Opens the open menu.
     */
    openOpen() {
      // TODO: actually open the open menu instead of just the welcome overlay
      this.$parent.$refs.welcomeOverlay.show();
    },
    /**
     * Opens the settings menu
     */
    openSettings() {
      this.$parent.$refs.settingsOverlay.show();
    },
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
  width: 16px;
  height: 16px;
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

.volume:hover {
  width: initial;
}
.volume input[name="volume"] {
  height: 16px;
  width: 100px;
  margin: 0 10px;
  background-color: transparent;
  padding: 0;
}
.volume :not(img) {
  display: none;
}
.volume:hover :not(img) {
  display: initial;
}
</style>
