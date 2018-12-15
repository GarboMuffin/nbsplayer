<template>
  <div>
    <h3>Settings</h3>
    <div><label>Key Offset <input type="number" v-model.number="options.keyOffset"></label></div>
    <button @click="hide">Close</button>
  </div>
</template>

<script>
export default {
  inject: ["hide"],
  props: {
    options: Object,
  },
}
</script>

<style>

</style>
