<template>
  <div>
    <a @click="togglePlayback">
      <img v-show="!song.paused" src="@/assets/toolbar/pause.png">
      <img v-show="song.paused" src="@/assets/toolbar/play.png">
    </a>
    <a @click="options.loop = !options.loop">
      <img src="@/assets/toolbar/loop.png">
    </a>
  </div>
</template>

<script>
export default {
  props: ["song", "options"],
  methods: {
    togglePlayback() {
      if (this.song.paused) {
        this.song.play();
      } else {
        this.song.pause();
      }
    },
  },
}
</script>

<style scoped>
.button {
  vertical-align: middle;
}
</style>
