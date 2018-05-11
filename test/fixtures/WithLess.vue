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

<style scoped lang="less">
@color: red;

div {
  color: @color;
}
</style>
