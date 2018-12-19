<template>
  <div class="layer-list">
    <time-box :song="song"></time-box>
    <layer-meta :layer="layer" :key="layer.id" v-for="layer in song.layers"></layer-meta>
    <button @click="song.addLayer()" class="row">+ layer</button>
  </div>
</template>

<script>
import { Song } from "@/NBS.js";
import LayerMeta from "./LayerMeta.vue";
import TimeBox from "./TimeBox.vue";

export default {
  props: {
    song: Song,
  },
  components: {
    LayerMeta,
    TimeBox,
  }
}
</script>

<style scoped>
.row {
  height: 32px;
  width: 100%;
}
</style>
