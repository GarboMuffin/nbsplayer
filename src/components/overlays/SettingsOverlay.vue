<template>
  <div class="overlay" v-show="computedVisible">
    <h3>Advanced Settings</h3>
    <div><label>Key Offset <input type="number" v-model.number="options.keyOffset"></label></div>
    <div><label>Tempo <input type="number" v-model.number="song.tempo" step="any"> ms per tick</label></div>
    <button @click="hide">Close</button>
  </div>
</template>

<script>
import overlayMixin from "./overlay.js";

export default {
  props: ["options", "song"],
  mixins: [overlayMixin],
}
</script>

<style>

</style>
