const { version } = require('./package.json')

module.exports = {
  out: 'docs/',
  excludeExternals: true,
  excludePrivate: true,
  mode: 'modules',
  hideGenerator: true,
  gitRevision: 'v' + version
}
