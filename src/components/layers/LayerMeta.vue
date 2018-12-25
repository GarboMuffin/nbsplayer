<template>
  <div class="row layer flex flex-row flex-center">
    <input type="text" v-model="layer.name" :placeholder="layer.placeholder" name="name">
    <input type="number" v-model="volume" name="volume" class="no-spinners">
    <!-- Janky ['delete'] allows it to call delete() without using the word delete because vue errors if I do that -->
    <a @click="layer['delete']()">&times;</a>
  </div>
</template>

<script>
import * as NBS from "@/NBS.js";

export default {
  props: {
    layer: NBS.Layer,
  },
  computed: {
    volume: {
      get() {
        return this.layer.volume * 100;
      },
      set(volume) {
        this.layer.volume = volume / 100;
      }
    }
  }
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
