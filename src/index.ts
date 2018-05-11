import {parse, SFCBlock, SFCCustomBlock, SFCDescriptor} from '@vue/component-compiler-utils'
import {
  BlockPlugin,
  ComponentRewriterAPI,
  CustomBlock,
  CustomFile, FilePlugin,
  FileRewriterAPI,
  MessageBagAPI,
  Plugin,
  ProcessedResults
} from "./api"

export class MessageBag implements MessageBagAPI {
  errors: Array<string | Error>
  tips: string[]
  scope: string = ''

  constructor() {
    this.errors = []
    this.tips = []
  }

  setScope(name: string) {
    this.scope = name
  }

  error(error: Error | string): void {
    this.errors.push(error)
  }

  tip(tip: string): void {
    this.tips.push(tip)
  }

  hasError(): boolean {
    return this.errors.length > 0
  }

  write(): ProcessedResults {
    return {tips: this.tips, errors: this.errors}
  }
}

export class FileRewriter extends MessageBag implements FileRewriterAPI {
  input: CustomFile
  output: { filename?: string, content?: string } = {}

  constructor(input: CustomFile) {
    super()
    this.input = input
  }

  name(filename: string): void {
    this.output.filename = filename
  }

  content(content: string): void {
    this.output.content = content
  }

  write(): ProcessedResults {
    if (this.hasError()) return super.write()

    return {
      ...super.write(),
      filename: this.output.filename || this.input.filename,
      code: this.output.content
    }
  }
}

export class ComponentRewriter extends MessageBag implements ComponentRewriterAPI {
  static CONSTANTS = {
    properties: new Set(['$on'])
  }

  private mixins: Array<{ [key: string]: string }> = []
  private properties: { [key: string]: string } = {}
  private hooks: { [key: string]: string[] } = {}
  private currentPluginName: string

  filename: string | undefined
  descriptor: SFCDescriptor
  blocks: CustomBlock[] = []

  isFunctional: boolean

  constructor(filename: string | undefined, descriptor: SFCDescriptor) {
    super()
    this.filename = filename
    this.descriptor = descriptor
    this.isFunctional = !!(descriptor.template && 'functional' in descriptor.template.attrs)
  }

  async forEach(callback: (block: CustomBlock) => Promise<void>): Promise<void> {
    if (this.descriptor.template) await callback(normalizeBlock(this.descriptor.template, this.filename))
    if (this.descriptor.script) await callback(normalizeBlock(this.descriptor.script, this.filename))

    for (const style of this.descriptor.styles) {
      await callback(normalizeBlock(style, this.filename))
    }

    for (const block of this.descriptor.customBlocks) {
      await callback(normalizeBlock(block, this.filename))
    }
  }

  defineInstanceProperty(name: string, value: string): void {
    if (name in this.properties || ComponentRewriter.CONSTANTS.properties.has(name)) {
      this.tip(
        'Plugin (' +
        this.currentPluginName +
        ') is trying to overwrite existing instance property.'
      )
    } else {
      this.properties[name] = value
    }
  }

  defineOption(name: string, value: string): void {
    this.mixins[this.mixins.length - 1][name] = value
  }

  defineHook(name: string, value: string): void {
    if (this.isFunctional) {
      // TODO: Handle hooks!.
    } else if (name in this.hooks) {
      this.hooks[name].push(value)
    } else {
      this.hooks[name] = [value]
    }
  }

  block(block: CustomBlock): void {
    if (block.type === 'template' || block.type === 'script') {
      if (this.blocks.some(it => it.type === block.type)) {
        throw new Error(`Only one ${block.type} block is supported.`)
      }
    }

    this.blocks.push(block)
  }

  createBlock(type: string, attrs: { [key: string]: string }, code?: string): void {
    this.block({ filename: '', type, attrs, code, content: ''})
  }

  addBlock(block: CustomBlock | string, attrs?: { [p: string]: string }, content?: string): void {
    if (typeof block === 'string') this.createBlock(block, attrs || {}, content)
    else if (block && typeof block === 'object') this.block(block)
  }

  write(): ProcessedResults {
    if (this.hasError()) return super.write()

    const code = this.blocks.map(stringifyBlock).join('\n')

    return {...super.write(), filename: this.filename, code}
  }
}

// -- Internal Utility Functions --

function stringifyBlock(block: CustomBlock): string {
  const {type, code, attrs} = block

  const attrString = Object.keys(attrs)
    .map(
      key => (attrs[key] === '' || attrs[key] as any === true ? key : key + '=' + JSON.stringify(attrs[key]))
    )
    .join(' ')

  return `<${type}${attrString ? ' ' + attrString : ''}>\n${(
    code || ''
  ).trim()}\n</${type}>\n`
}

function normalizeBlock(block: SFCCustomBlock | SFCBlock, filename?: string): CustomBlock {
  delete block.attrs.lang
  const output: any = {
    filename,
    type: block.type,
    attrs: block.attrs,
    content: block.content,
    start: block.start,
    end: block.end,
    map: block.map,
    lang: (block as any).lang
  }
  const keys = ['module', 'scope', 'src']

  keys.forEach((key: string) => {
    if (key in block) {
      output.attrs[key] = typeof (block as any)[key] !== 'string'
        ? ''
        : (block as any)[key]
    }
  })

  return output as CustomBlock
}

export async function compile(filename: string, content: string, plugins: Array<Plugin | BlockPlugin | FilePlugin>): Promise<ProcessedResults> {
  let isVue = /\.vue$/gi.test(filename)

  if (!isVue) {
    const file = {filename, content}
    const api = new FileRewriter(file)

    for (const plugin of plugins) {
      if ((plugin as FilePlugin).testFile && (plugin as FilePlugin).testFile(filename)) {
        await (plugin as FilePlugin).processFile(file, api)
      }
    }

    return api.write()
  } else {
    const api = new ComponentRewriter(filename, parse({filename: filename, source: content}))

    await api.forEach(async block => {
      for (const plugin of plugins) {
        if ((plugin as BlockPlugin).testBlock && (plugin as BlockPlugin).testBlock(block.type, block.attrs.src || block.lang)) {
          await (plugin as BlockPlugin).processBlock({...block, attrs: {...block.attrs}}, api)
        }
      }
    })

    return api.write()
  }
}
