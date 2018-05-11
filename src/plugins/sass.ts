import {
  ComponentRewriterAPI,
  CustomBlock,
  CustomFile,
  FileRewriterAPI,
  MessageBagAPI,
  Plugin
} from '../api'
import { transform } from './style'
import promised from '@znck/promised'
import SCSS_PARSER from 'postcss-scss'
import SASS_PARSER from 'postcss-sass'

export default class SassPlugin implements Plugin {
  name: 'sass'
  EXT_REGEX = /\.(scss|sass)$/gi

  testFile(filename: string): boolean {
    return this.EXT_REGEX.test(filename)
  }

  async processFile(file: CustomFile, api: FileRewriterAPI): Promise<void> {
    const isIndented = file.filename.endsWith('.sass')
    const { errors, code } = await this.preprocess(file, isIndented, api)

    if (errors.length) return

    try {
      const result = await this.compile(code || file.content, file.filename, isIndented)
      api.name(file.filename.replace(this.EXT_REGEX, '.css'))
      api.content(result)
    } catch (e) {
      console.log('Trying to compile\n' + code)
      api.error(e)
    }
  }

  private async preprocess(
    file: CustomFile,
    isIndented: boolean,
    api: MessageBagAPI
  ): Promise<{ errors: (string | Error)[]; code: string }> {
    const { errors, code } = await transform(
      file.content,
      {
        parser: isIndented ? SASS_PARSER : SCSS_PARSER,
        isIndented
      },
      file.filename
    )

    if (errors.length) {
      errors.map((error: string) => api.error(error))
    }

    return { errors, code }
  }

  private async compile(
    data: string,
    file: string,
    indentedSyntax: boolean
  ): Promise<string> {
    console.log(data)
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
    const { errors, code } = await this.preprocess(block, isIndented, api)

    if (errors.length) return
    try {
      api.addBlock('style', block.attrs, await this.compile(code, block.filename, isIndented))
    } catch (e) {
      console.log('Trying to compile\n' + code)
      api.error(e)
    }
  }
}
