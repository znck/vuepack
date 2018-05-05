<template>
  <div>Example</div>
</template>

<script lang="typescript">
import Vue from 'vue'

export default Vue.extend({
  name: 'Simple',
  methods: {
    foo(...args: string[]) {
      return args
    }
  }
})
</script>

<style scoped>
div {
  color: 'red';
}
</style>
