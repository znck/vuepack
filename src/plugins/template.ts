import {BlockPlugin, ComponentRewriterAPI, CustomBlock} from "../api"

export default class TemplatePlugin implements BlockPlugin {
  name: string = 'template'

  EXT_REGEX = /\.html$/i
  TYPE_REGEX =/^(html)$/i

  testBlock(type: string, srcOrLang?: string): boolean {
    return type === 'template' &&
      (srcOrLang === undefined || this.EXT_REGEX.test(srcOrLang) || this.TYPE_REGEX.test(srcOrLang))
  }

  async processBlock(block: CustomBlock, api: ComponentRewriterAPI): Promise<void> {
    api.addBlock('template', block.attrs, block.content)
  }
}
