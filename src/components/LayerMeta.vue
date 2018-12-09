<template>
  <div class="row layer">
    <input type="text" v-model="layer.name" :placeholder="layer.placeholder" name="name">
    <input type="number" v-model="layer.volume" name="volume" class="no-spinners">

    <!-- Janky ['delete'] allows it to call delete without using the word delete -->
    <!-- because vue errors if I do that -->
    <a @click="layer['delete']()">&times;</a>
  </div>
</template>

<script>
export default {
  props: ["layer"],
};
</script>

<style scoped>
.layer:nth-of-type(even) {
  background-color: #EEE;
}
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
