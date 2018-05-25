import {BlockPlugin, ComponentRewriterAPI, CustomBlock, CustomFile, FilePlugin, FileRewriterAPI} from "../api"
import {transform} from 'babel-core'
import promised from "@znck/promised"

export default class BabelPlugin implements BlockPlugin, FilePlugin {
  name: string = 'babel'

  EXT_REGEX = /\.js$/i
  TYPE_REGEX = /^(js|babel|javascript)$/i

  testBlock(type: string, srcOrLang?: string): boolean {
    return type === 'script' &&
      (srcOrLang === undefined || this.EXT_REGEX.test(srcOrLang) || this.TYPE_REGEX.test(srcOrLang))
  }

  async processBlock(block: CustomBlock, api: ComponentRewriterAPI): Promise<void> {
    if ('src' in block.attrs) {
      api.addBlock('script', block.attrs)
      return
    }

    api.addBlock('script', block.attrs, await this.compile(block.filename as string, block.content))
  }

  testFile(filename: string): boolean {
    return this.EXT_REGEX.test(filename)
  }

  async processFile(file: CustomFile, api: FileRewriterAPI): Promise<void> {
    api.content(await this.compile(file.filename, file.content))
  }

  async compile(filename: string, source: string): Promise<string> {
    const result = await promised({transform}).transform(source, {
      filename,
      presets: [['@babel/preset-env', {modules: false, loose: true}]],
      comments: false
    })

    return result.code
  }
}
