import {ComponentRewriterAPI, CustomBlock, CustomFile, FileRewriterAPI, Plugin} from "../api"
import {checkUnsupportedImports} from './style'
import parser from "postcss-less"

export default class LessPlugin implements Plugin {
  name: 'less'
  EXT_REGEX = /\.less$/gi

  testFile(filename: string): boolean {
    return this.EXT_REGEX.test(filename)
  }

  async processFile(file: CustomFile, api: FileRewriterAPI): Promise<void> {
    const {errors, code} = await checkUnsupportedImports(file.content, {parser}, file.filename)

    if (errors.length) {
      errors.map((error: string) => api.error(error))
      return
    }

    try {
      api.name(file.filename.replace(this.EXT_REGEX, '.css'))
      api.content((await require('less').render(code || file.content)).css)
    } catch (e) {
      api.error(e)
    }
  }

  testBlock(type: string, srcOrLang?: string): boolean {
    return !!(type === 'style' && srcOrLang && (srcOrLang === 'less' || this.EXT_REGEX.test(srcOrLang)))
  }

  async processBlock(block: CustomBlock, api: ComponentRewriterAPI): Promise<void> {
    if ('src' in block.attrs) {
      block.attrs.src = block.attrs.src.replace(this.EXT_REGEX, '.css')

      api.addBlock('style', block.attrs)
      return
    }

    const {errors, code} = await checkUnsupportedImports(block.content, {parser}, block.filename)

    if (errors.length) {
      errors.map((error: string) => api.error(error))
      return
    }

    try {
      api.addBlock('style', block.attrs, (await require('less').render(code || block.content)).css)
    } catch (e) {
      api.error(e)
    }
  }
}