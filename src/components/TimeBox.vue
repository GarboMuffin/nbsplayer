<template>
  <div class="row timebox">
    <div class="current">{{ currentTime }}</div>
    <div class="end">{{ endTime }}</div>
  </div>
</template>

<script>
export default {
  props: ["song"],
  computed: {
    currentTime() {
      return this.formatTime(this.song.currentTime);
    },
    endTime() {
      return this.formatTime(this.song.totalTime);
    },
  },
  methods: {
    formatTime(ms) {
      const time = ms / 1000;
      const hours = Math.floor(time / 3600).toString().padStart(2, "0");
      const minutes = Math.floor(time / 60 % 60).toString().padStart(2, "0");
      const seconds = Math.floor(time % 60).toString().padStart(2, "0");
      const millis = Math.floor(ms % 1000).toString().padStart(3, "0");
      return `${hours}:${minutes}:${seconds}.${millis}`;
    },
  }
};
</script>

<style scoped>
.timebox {
  text-align: right;
  font-size: 12px;
}
.current {
  font-weight: bold;
}
</style>
