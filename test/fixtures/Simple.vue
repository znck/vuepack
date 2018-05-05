<template>
  <div>Example</div>
</template>

<script>
export default {
  name: 'Simple',
  methods: {
    foo(...args) {
      return args
    }
  }
}
</script>

<style scoped>
div {
  color: 'red';
}
</style>
