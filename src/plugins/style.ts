import * as path from 'path'
import * as fs from 'fs'
import {AtRule, Declaration} from 'postcss'
import {e, resolveExternal} from '../utils'

const SUGAR = require('sugarss')
const postcss = require('postcss')
const EXT_REGEX = /\.(less|scss|sass|styl)$/gi

export async function transform(source: string,
                                options: { parser: any; isIndented: boolean },
                                context?: string): Promise<{ errors: Array<string | Error>; code: string }> {
  const {errors, code: input} = await checkUnsupportedImports(source, options, context)
  const code = await transformVariablesToCSS(input, options, context)

  return {errors, code}
}

async function toIndented(css: string | AtRule): Promise<string> {
  const {content} = await postcss().process(css, {
    stringifier: SUGAR,
    map: false,
    from: undefined,
    to: undefined
  })

  return content
}

export async function checkUnsupportedImports(source: string,
                                              { parser }: { parser: any; isIndented: boolean },
                                              context?: string): Promise<{ errors: Array<string | Error>; code: string }> {
  const errors = []
  const extensions = ['less', 'scss', 'less', 'styl', 'stylus', 'css']
  const root = await postcss().parse(source, {
    syntax: parser,
    from: undefined,
    to: undefined,
    map: false
  })
  const imports: Array<{ param: string; rule: AtRule }> = []

  root.walkAtRules('import', (rule: AtRule) => {
    const params = rule.params.split(' ')

    if (/^("[^"]+"|'[^']+')$/gi.test(params[0])) {
      const param = params[0].substr(1, params[0].length - 2)
      const name = EXT_REGEX.test(param)
        ? param.replace(EXT_REGEX, '.css')
        : param + '.css'

      if (
        name.startsWith('.') ||
        (context && fs.existsSync(path.resolve(path.dirname(context), name)))
      ) {
        params[0] = e(name)
        if (params.length === 1) params.push('all')
        rule.params = params.join(' ')
      } else {
        imports.push({param: name, rule})
      }
    }
  })

  for (const {rule, param} of imports) {
    const filename = await resolveExternal(context, param, extensions)

    if (filename && /\.(less|scss|sass|styl)$/i.test(filename)) {
      const {start} = rule.source
      const pos = start
        ? `${context ? path.relative(process.cwd(), context) : 'Line'}:${
          start.line
          }:${start.column}`
        : ''
      errors.push(`Only css imports are supported.\n` + `   ${pos} -> ${rule}`)
    }
  }

  return {errors, code: root.toString() }
}

export async function transformVariablesToCSS(source: string,
                                              {isIndented, parser}: { parser: any; isIndented?: boolean },
                                              context?: string): Promise<string> {
  const { root } = await postcss().process(source, {
    syntax: parser,
    from: undefined,
    to: undefined,
    map: false
  })

  const variables: Declaration[] = []
  root.walkDecls(/\$([a-z0-9-_]+)/i, (d: Declaration) => {
    const v = d.clone({prop: '--' + d.prop.substr(1)})

    if (d.parent === root) {
      variables.push(v)
      d.remove()
    } else {
      d.replaceWith(v)
    }
  })
  root.replaceValues(/\$([a-z0-9-_]+)/i, (name: string) => `var(--${name.substr(1)})`);

  if (variables.length) {
    const rule = postcss.rule({selectors: [':root']})
    rule.append(...variables)

    if (!isIndented) {
      root.prepend(rule)

      return root.toString().replace(/\n+/g, '\n')
    } else {
      // Hack: Add semicolon.
      return (await toIndented(rule.toString()))
        .replace(/--[^:]+:[^\n]+/, (match: string) => match + ';')
        .replace(/:root/g, '\\:root') + '\n\n' + root
    }
  }

  return source
}
