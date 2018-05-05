import {compileVue} from "./vue"
import {compileLessStyle, compileSassStyle, compileScssStyle} from "./style"
import {compileJavaScript, compileTypeScript} from "./script"
import {CompilerOptions, CompilerResult} from "./utils"

export async function compileType(type: string, source: string, options: CompilerOptions): Promise<CompilerResult> {
  switch (type) {
    case 'vue':
      return compileVue(source, options)
    // Javascript.
    case 'js':
    case 'javascript':
      return compileJavaScript(source, options)
    case 'ts':
    case 'typescript':
      return compileTypeScript(source, options)
    // StyleSheet
    case 'scss':
      return compileScssStyle(source, options)
    case 'sass':
      return compileSassStyle(source, options)
    case 'less':
      return compileLessStyle(source, options)
    case 'styl':
    case 'stylus':
      return compileLessStyle(source, options)
    default:
      // copy as it is.
      return {code: source, errors: [], tips: []}
  }
}

export async function compileTypeWithDestination(type: string, source: string, options: CompilerOptions): Promise<CompilerResult & { filename?: string }> {
  const result = await compileType(type,source, options)

  if (!options.filename) return result

  const ext = getCompiledExtension(type)
  const filename = ext ? options.filename.replace(/\.([a-z]+)$/i, '.' + ext) : options.filename

  return { ...result, filename }
}

function getCompiledExtension(type: string): string | undefined {
  switch (type) {
    // Javascript.
    case 'ts':
      return 'js'
    // StyleSheet
    case 'scss':
    case 'sass':
    case 'less':
    case 'styl':
    case 'stylus':
      return 'css'
  }
}
