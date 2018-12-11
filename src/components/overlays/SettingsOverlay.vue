<template>
  <div class="overlay" v-show="computedVisible">
    <h3>Advanced Settings</h3>
    <div><label>Key Offset <input type="number" v-model.number="options.keyOffset"></label></div>
    <button @click="hide">Close</button>
  </div>
</template>

<script>
import overlayMixin from "./overlay.js";

export default {
  props: ["options"],
  mixins: [overlayMixin],
}
</script>

<style>

</style>
