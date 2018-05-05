import * as path from "path"
import * as fs from "fs"
import prettier from 'prettier'

export * from '@znck/promised'
import promised from '@znck/promised'

export { promised }

export interface CompilerOptions {
  filename?: string
}

export interface CompilerResult {
  code?: string
  map?: any
  tips: string[]
  errors: string[]
}

export async function all<T>(promises: Array<Promise<T>>): Promise<Array<T>> {
  return Promise.all(promises)
}

export function e(any: any): string {
  const prefix = 'const __ = '

  const source = prefix + JSON.stringify(any)
  const code = prettier.format(source, { semi: false, singleQuote: true }).trim()

  return code.substr(prefix.length)
}

export async function resolveExternal(context: string | undefined, query: string, extensions: string[]): Promise<string | undefined> {
  if (!context) return
  const dir = path.dirname(context)
  const filename = path.resolve(dir, query)

  if (await promised(fs).exists(filename)) {
    return filename
  }

  for (const ext of extensions) {
    const filename = path.resolve(dir, query + '.' + ext)
    if (await promised(fs).exists(filename)) {
      return filename
    }
  }
}

export function flatten<T>(args: Array<T[] | T | undefined | null>): T[] {
  const result: T[] = []

  for (const arg of args) {
    if (Array.isArray(arg)) {
      result.push.apply(result, flatten(arg))
    } else if (arg) {
      result.push(arg)
    }
  }

  return result
}

export async function read(filename: string): Promise<string> {
  const content = await promised(fs).readFile(filename)

  return content.toString()
}

export async function write(filename: string, content: string, overwrite: boolean = false): Promise<void> {
  if (!overwrite && await promised(fs).exists(filename)) throw Error('Error: ' + filename + ' already exists.')
  await mkdirp(path.dirname(filename))
  await promised(fs).writeFile(filename, content)
}

export async function mkdirp(dir: string): Promise<void> {
  if (!await promised(fs).exists(dir)) {
    await mkdirp(path.dirname(dir))
    try {
      await promised(fs).mkdir(dir)
    } catch (e) {
      if (!/file already exists/i.test(e.message)) {
        throw e
      }
    }
  }
}
