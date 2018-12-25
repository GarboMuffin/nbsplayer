<template>
  <div class="keyboard">
    <div class="key">a</div>
  </div>
</template>

<script>
import { SongEditor } from "@/components/editor/editor";

export default {
  props: {
    editor: SongEditor
  }
}
</script>

<style scoped>
.keyboard {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>
