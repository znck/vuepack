module.exports = {
  hooks: {
    readPackage
  }
}

function readPackage (pkg) {
  if (pkg.dependencies && pkg.dependencies.resolve) {
    pkg.dependencies.resolve = 'zkochan/node-resolve'
  }

  if (pkg.name === 'ts-jest') {
    pkg.dependencies['source-map-support'] = '*'
  }

  return pkg
}
