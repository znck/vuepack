import Vue from 'vue'

export default Vue.extend({
  name: 'Simple',
  methods: {
    foo(...args: string[]) {
      return args
    }
  }
})
