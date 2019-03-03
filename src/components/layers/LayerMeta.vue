<template>
  <div class="row layer">
    <div class="child">
      <input type="text" v-model="layer.name" :placeholder="layer.placeholder" name="name">
      <input type="number" v-model="volume" name="volume" class="no-spinners">
      <!-- Janky ['delete'] allows it to call delete() without using the word delete because vue errors if you do that -->
      <a class="delete-button" @click="layer['delete']()" title="Delete layer">&times;</a>
    </div>
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
.layer {
  position: relative;
  font-size: 11px;
}
.child {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.child > * {
  display: inline-block;
  vertical-align: middle;
}
.delete-button {
  font-size: 12pt;
  margin: 0 2px;
}
input {
  font-size: inherit;
}
input[name="name"] {
  width: 140px;
}
input[name="volume"] {
  width: 20px;
}
</style>
