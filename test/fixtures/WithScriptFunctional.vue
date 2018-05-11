<script>
export default {
  functional: true,
  render(h, {children}) {
    return h('div', { style: 'color: red' }, ['Example', ...children])
  }
}
</script>
