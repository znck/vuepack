import {ComponentRewriterAPI, CustomBlock, CustomFile, FileRewriterAPI, Plugin} from "../api"

export default class LessPlugin implements Plugin {
  name: 'less'
  EXT_REGEX = /\.less$/i

  testFile(filename: string): boolean {
    return this.EXT_REGEX.test(filename)
  }

  async processFile(file: CustomFile, api: FileRewriterAPI): Promise<void> {
    try {
      api.name(file.filename.replace(this.EXT_REGEX, '.css'))
      api.content(await this.compile(file.filename, file.content))
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

    try {
      api.addBlock('style', block.attrs, await this.compile(block.filename, block.content))
    } catch (e) {
      api.error(e)
    }
  }

  private async compile(filename: string, content: string): Promise<string> {
    const result = await require('less').render(content, { filename })

    return result.css
  }
}