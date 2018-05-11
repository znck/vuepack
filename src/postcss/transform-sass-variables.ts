import { Root, Result, Declaration } from 'postcss'
const postcss = require('postcss')

export default postcss.plugin('transform-sass-variables', () => (css: Root, result: Result) => {
  const root = postcss.atRule({ selector: ':root' })
  css.walkDecls(/\$[a-z0-9_-]+/i, (declaration: Declaration) => {
    const variable = declaration.clone({ prop: '--' + declaration.prop.substr(1) })
    declaration.
  })
})
