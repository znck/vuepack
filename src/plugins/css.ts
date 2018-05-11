import {BlockPlugin, ComponentRewriterAPI, CustomBlock} from "../api"

export default class CSSPlugin implements BlockPlugin {
  name: string = 'css'

  EXT_REGEX = /\.css$/gi
  TYPE_REGEX =/^(css|postcss)$/gi

  testBlock(type: string, srcOrLang?: string): boolean {
    return type === 'style' &&
      (srcOrLang === undefined || this.EXT_REGEX.test(srcOrLang) || this.TYPE_REGEX.test(srcOrLang))
  }

  async processBlock(block: CustomBlock, api: ComponentRewriterAPI): Promise<void> {
    api.addBlock('style', block.attrs, block.content)
  }
}
