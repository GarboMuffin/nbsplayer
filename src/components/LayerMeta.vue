<template>
  <div class="row layer">
    <input type="text" v-model="layer.name" :placeholder="layer.placeholder" name="name">
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
</style>
