<template>
  <div class="row flex flex-row timebox">
    <div class="times">
      <div class="current">{{ currentTime }}</div>
      <div class="end">{{ endTime }}</div>
    </div>
    <div class="flex flex-center">
      <div :vanilla-friendly="isVanillaFriendlyTempo" @click.self="focusTempo" class="tempo-container" title="Tempo in ticks per second">
        <input ref="tempo" type="number" v-model.number="song.tempo" class="no-spinners" name="tempo" step="0.25">
        t/s
      </div>
    </div>
  </div>
</template>

<script>
import * as NBS from "@/NBS.js";

const VANILLA_FRIENDLY_TEMPOS = [
  2.5, 5, 10,
];

export default {
  props: {
    song: NBS.Song,
  },

  computed: {
    currentTime() {
      return this.formatTime(this.song.currentTime);
    },
    endTime() {
      return this.formatTime(this.song.endTime);
    },
    isVanillaFriendlyTempo() {
      return VANILLA_FRIENDLY_TEMPOS.includes(this.song.tempo);
    }
  },

  methods: {
    formatTime(ms) {
      const time = Math.abs(ms) / 1000;
      const hours = Math.floor(time / 3600).toString().padStart(2, "0");
      const minutes = Math.floor(time / 60 % 60).toString().padStart(2, "0");
      const seconds = Math.floor(time % 60).toString().padStart(2, "0");
      const millis = Math.floor(Math.abs(ms) % 1000).toString().padStart(3, "0");
      const formatted = `${hours}:${minutes}:${seconds}.${millis}`;
      if (ms < 0) {
        return "-" + formatted;
      }
      return formatted;
    },

    focusTempo() {
      this.$refs.tempo.focus();
    },
  }
};
</script>

<style scoped>
.timebox {
  font-size: 12px;
  justify-content: flex-end;
}
.timebox > * {
  padding-right: 10px;
}

.times {
  text-align: right;
}
.current {
  font-weight: bold;
}
.end {
  font-size: 11px;
}

.tempo-container {
  border: 1px solid black;
  cursor: text;
}
.tempo-container:not([vanilla-friendly]) {
  background-color: rgb(255, 213, 213);
}
input[name="tempo"] {
  width: 35px;
  text-align: right;
  border: 0;
  background-color: inherit;
}
</style>
