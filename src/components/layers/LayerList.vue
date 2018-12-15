<template>
  <div>
    <time-box :song="song"></time-box>
    <layer-meta :layer="layer" :key="layer.id" v-for="layer in song.layers"></layer-meta>
    <button @click="song.addLayer()" class="row">+ layer</button>
  </div>
</template>

<script>
import TimeBox from "./TimeBox.vue";
import LayerMeta from "./LayerMeta.vue";
import { Song } from "@/NBS.js";
import sharedState from "@/state.js";

export default {
  computed: {
    song() {
      return sharedState.song;
    }
  },
  components: {
    LayerMeta,
    TimeBox,
  },
}
</script>

<style scoped>
.row {
  height: 32px;
  width: 100%;
}
</style>
