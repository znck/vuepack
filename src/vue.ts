import {parse, SFCBlock, SFCCustomBlock, SFCDescriptor} from '@vue/component-compiler-utils'
import {all, CompilerOptions, CompilerResult, flatten} from "./utils"
import {compileType} from "./any"

export function compileVue(source: string, options: CompilerOptions): Promise<CompilerResult> {
  return processDescriptor(parse({...options, source, needMap: false}), options)
}

export async function processCustomBlock(block: SFCCustomBlock, options: CompilerOptions): Promise<SFCBlock & CompilerResult> {
  return {...block, code: block.content, tips: [], errors: []}
}

export async function processDescriptor(descriptor: SFCDescriptor, options: CompilerOptions): Promise<CompilerResult> {
  const {
    template,
    script,
    styles,
    customBlocks
  } = descriptor
  type Part = SFCBlock & CompilerResult
  const parts = await all(flatten([
    template ? processTemplateBlock(template, options) : undefined,
    script ? processScriptBlock(script, options) : undefined,
    styles.map(style => processStyleBlock(style, options)),
    customBlocks.map(block => processCustomBlock(block, options))
  ]))

  return {
    code: parts.map((block: Part) => stringifyBlock(block)).filter(Boolean).join('\n'),
    tips: flatten(parts.map((part: Part) => part.tips)),
    errors: flatten(parts.map((part: Part) => part.errors))
  }
}

export async function processTemplateBlock(template: SFCBlock, options: CompilerOptions): Promise<SFCBlock & CompilerResult> {
  // const lang = template.lang || 'js'

  return {...template, code: template.content, errors: [], tips: []}
}

export async function processScriptBlock(script: SFCBlock, options: CompilerOptions): Promise<SFCBlock & CompilerResult> {
  if (script.src) {
    delete script.content
    
    return {
      ...script,
      tips: [],
      errors: [],
      src: script.src.replace(/\.(ts|coffee)$/gi, '.js')
    }
  } else if (script.content) {
    const content = script.content.replace(/^(\/\/[\n\s])*/g, '')
    const lang = script.lang || 'js'

    delete script.lang
    delete script.attrs.lang

    return {
      ...script,
      ...await compileType(lang, content, options)
    }
  }

  return {...script, tips: [], errors: []}
}

export async function processStyleBlock(style: SFCBlock, options: CompilerOptions): Promise<SFCBlock & CompilerResult> {
  if (style.src) {
    delete style.content

    return {
      ...style,
      tips: [],
      errors: [],
      src: style.src.replace(/\.(scss|sass|styl|less)$/, '.css')
    }
  } else if (style.content) {
    const lang = style.lang || 'css'

    delete style.lang
    delete style.attrs.lang

    return {
      ...style,
      ...await compileType(lang, style.content, options)
    }
  }

  return {...style, tips: [], errors: []}
}

export function stringifyBlock(block: SFCBlock & CompilerResult | undefined): string {
  if (!block) return ''

  const {type, content, code, attrs} = block
  if (block.src) attrs.src = block.src
  if (block.scoped) attrs.scoped = ''
  if (block.module) attrs.module = block.module === true ? '' : block.module
  
  const attrString = Object.keys(attrs)
    .map(key => (attrs[key] === '' ? key : key + '=' + JSON.stringify(attrs[key])))
    .join(' ')

  return `<${type}${attrString ? ' ' + attrString : ''}>\n${(code || content || '').trim()}\n</${type}>\n`
}
