<template>
  <div>
    <h3>Settings</h3>
    <div><label>Key Offset <input type="number" v-model.number="options.keyOffset"></label></div>
    <button @click="hide">Close</button>
  </div>
</template>

<script>
import sharedState from "@/state.js";

export default {
  inject: ["hide"],
  computed: {
    options() {
      return sharedState.options;
    }
  }
}
</script>

<style>

</style>
