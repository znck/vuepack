import {
  ComponentRewriterAPI,
  CustomBlock,
  CustomFile,
  FileRewriterAPI,
  Plugin
} from '../api'
import promised from '@znck/promised'

export default class SassPlugin implements Plugin {
  name: 'sass'
  EXT_REGEX = /\.(scss|sass)$/gi

  testFile(filename: string): boolean {
    return this.EXT_REGEX.test(filename)
  }

  async processFile(file: CustomFile, api: FileRewriterAPI): Promise<void> {
    const isIndented = file.filename.endsWith('.sass')

    try {
      const result = await this.compile(file.content, file.filename, isIndented)
      api.name(file.filename.replace(this.EXT_REGEX, '.css'))
      api.content(result)
    } catch (e) {
      api.error(e)
    }
  }

  private async compile(
    data: string,
    file: string,
    indentedSyntax: boolean
  ): Promise<string> {
    const result = await promised(require('node-sass')).render({
      data,
      file,
      outFile: undefined,
      indentedSyntax,
      sourceMap: false,
      outputStyle: 'expanded'
    })

    return result.css.toString()
  }

  testBlock(type: string, srcOrLang?: string): boolean {
    return !!(
      type === 'style' &&
      srcOrLang &&
      (srcOrLang === 'scss' ||
        srcOrLang === 'sass' ||
        this.EXT_REGEX.test(srcOrLang))
    )
  }

  async processBlock(
    block: CustomBlock,
    api: ComponentRewriterAPI
  ): Promise<void> {
    if ('src' in block.attrs) {
      block.attrs.src = block.attrs.src.replace(this.EXT_REGEX, '.css')

      api.addBlock('style', block.attrs)
      return
    }

    const isIndented = block.lang === 'sass'
    try {
      api.addBlock('style', block.attrs, await this.compile(block.content, block.filename, isIndented))
    } catch (e) {
      api.error(e)
    }
  }
}
