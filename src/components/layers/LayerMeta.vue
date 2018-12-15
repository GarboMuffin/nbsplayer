<template>
  <div class="row layer flex flex-row flex-center">
    <input type="text" v-model="layer.name" :placeholder="layer.placeholder" name="name">

    <!-- TODO: make volume display 0-100 and convert behind the scenes to 0-1 -->
    <input type="number" v-model="layer.volume" name="volume" class="no-spinners" step="0.01">

    <!-- Janky ['delete'] allows it to call delete() without using the word delete because vue errors if I do that -->
    <a @click="layer['delete']()">&times;</a>
  </div>
</template>

<script>
import { Layer } from "@/NBS.js";

export default {
  props: {
    layer: Layer,
  },
};
</script>

<style scoped>
input {
  font-size: 11px;
}
input[name="name"] {
  width: 140px;
}
input[name="volume"] {
  width: 20px;
}
</style>
