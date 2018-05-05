module.exports = {
  hooks: {
    readPackage
  }
}

function readPackage (pkg) {
  if (pkg.dependencies && pkg.dependencies.resolve) {
    pkg.dependencies.resolve = 'zkochan/node-resolve'
  }

  return pkg
}
