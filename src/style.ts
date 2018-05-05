import {
  CompilerOptions,
  CompilerResult,
  resolveExternal,
  promised
} from './utils'
import ScssParser from 'postcss-scss'
import SassParser from 'postcss-sass'
import LessParser from 'postcss-less'
import * as path from 'path'
import { AtRule } from 'postcss'

const postcss = require('postcss')

async function checkUnSupportedStyleFeatures(
  source: string,
  options: CompilerOptions & { parser: any }
): Promise<string[]> {
  const errors = []
  const extensions = ['less', 'scss', 'less', 'styl', 'stylus', 'css']
  const result = postcss().process(source, { parser: options.parser })
  const imports: Array<{ param: string; rule: AtRule }> = []

  result.root.walkAtRules('import', (rule: AtRule) =>
    rule.params
      .split(',')
      .map((param: string) => param.replace(/^['"]|['"]$/g, ''))
      .map((param: string) => imports.push({ rule, param }))
  )

  for (const { rule, param } of imports) {
    const filename = await resolveExternal(options.filename, param, extensions)

    if (filename && /\.(less|scss|sass|styl)$/i.test(filename)) {
      const { start } = rule.source
      const pos = start
        ? `${
            options.filename
              ? path.relative(process.cwd(), options.filename)
              : 'Line'
          }:${start.line}:${start.column}`
        : ''
      errors.push(`Only css imports are supported.\n` + `   ${pos} -> ${rule}`)
    }
  }

  return errors
}

async function compileSassOrScssStyle(
  source: string,
  options: CompilerOptions,
  sassOptions: any
): Promise<CompilerResult> {
  try {
    const nodeSass = require('node-sass')
    const config = {
      ...sassOptions,
      data: source,
      file: options.filename,
      outFile: options.filename,
      sourceMap: false
    }
    const result = await promised(nodeSass).render(config)
    return { code: result.css.toString(), errors: [], tips: [] }
  } catch (e) {
    return { errors: [e.message], tips: [] }
  }
}

export async function compileScssStyle(
  source: string,
  options: CompilerOptions
): Promise<CompilerResult> {
  const errors = await checkUnSupportedStyleFeatures(source, {
    ...options,
    parser: ScssParser
  })

  if (!errors.length) {
    return compileSassOrScssStyle(source, options, { indentedSyntax: false })
  }

  return { code: source, tips: [], errors } // TODO:
}

export async function compileSassStyle(
  source: string,
  options: CompilerOptions
): Promise<CompilerResult> {
  const errors = await checkUnSupportedStyleFeatures(source, {
    ...options,
    parser: SassParser
  })

  if (!errors.length) {
    return compileSassOrScssStyle(source, options, { indentedSyntax: true })
  }

  return { code: source, tips: [], errors } // TODO:
}

export async function compileLessStyle(
  source: string,
  options: CompilerOptions
): Promise<CompilerResult> {
  const errors = await checkUnSupportedStyleFeatures(source, {
    ...options,
    parser: LessParser
  })

  if (errors.length) return { code: source, tips: [], errors }

  try {
    const nodeLess = require('less')
    const result = await promised(nodeLess).render(source)
    return { code: result.css.toString(), errors: [], tips: [] }
  } catch (e) {
    return { errors: [e.message], tips: [] }
  }
}

export async function compileStylusStyle(
  source: string,
  options: CompilerOptions
): Promise<CompilerResult> {
  return { code: source, tips: [], errors: ['Stylus is not supported.'] } // TODO:
}
