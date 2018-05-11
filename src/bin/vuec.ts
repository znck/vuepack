#!/usr/bin/env node

import glob = require('glob')
import nopt = require('nopt')
import logger = require('consola')
import * as path from 'path'
import * as fs from 'fs'
import plugins from '../plugins'
import{ compile } from '../index'
import { promised, all, read, write } from '../utils'

async function run(
  source: string,
  dest: string,
  files: string[],
  {
    toStdOut = false,
    overwrite = false,
    silent = false
  }: { toStdOut: boolean; overwrite: boolean; silent: boolean }
): Promise<boolean> {
  let hasAnyErrors = false
  const duplicates = new Map()
  await all(
    files
      // Compile.
      .map(async (from: string): Promise<void> => {
        try {
          const { filename, errors, tips, code } = await compile(
            path.resolve(source, from),
            await read(path.resolve(source, from)),
            plugins
          )
  
          const hasErrors = errors.length > 0
          if (hasErrors) {
            hasAnyErrors = true
            logger.error('in ' + from)
            errors.forEach((error: string | Error) => console.error(error))
          }
  
          if (tips.length && !silent) {
            logger.info(
              'for ' +
                from +
                '\n' +
                tips.map((tip: string) => '  - ' + tip.replace(/\n/g, '\n  ')).join('\n')
            )
          }
  
          if (!hasErrors && filename && code) {
            const to = path.relative(source, filename)
  
            if (toStdOut) {
              console.log(code)
            } else if (!duplicates.has(to)) {
              try {
                await write(path.resolve(dest, to), code, overwrite)
                !silent && logger.log('> ' + from + ' -> ' + to)
              } catch (e) {
                logger.error(e.message)
              }
              duplicates.set(to, from)
            } else {
              logger.fatal(
                `Both '${duplicates.get(to)}' and ${from} are compiled to ${to}.`
              )
              logger.info('Rename one of the above files.')
            }
          }
        } catch (e) {
          logger.fatal('while processing ' + from, e.stack)
        }
      })
  )

  return hasAnyErrors
}

async function main(argv: string[]) {
  const options = nopt(
    { outDir: String, force: Boolean, silent: Boolean },
    { f: '--force', d: '--outDir', s: '--silent' },
    argv,
    2
  )

  const paths = options.argv.remain.length ? options.argv.remain : ['src']
  const target = options.outDir
    ? path.resolve(process.cwd(), options.outDir)
    : path.join(process.cwd(), 'dist')
  let hasAnyErrors: boolean = true

  for (const filename of paths) {
    const file = path.resolve(process.cwd(), filename)
    if (!(await promised(fs).exists(file))) {
      logger.error(`No such file or directory, ${filename}`)
      continue
    }

    const isFile = (await promised(fs).lstat(file)).isFile()
    const dir = isFile ? path.dirname(file) : file
    const dest = paths.length > 1 && !isFile ? path.join(target, filename) : target
    const files = isFile
      ? [file]
      : await promised({ glob }).glob('**', { cwd: dir, nodir: true })

    hasAnyErrors = await run(dir, dest, files, {
      toStdOut: !options.outDir && paths.length === 1,
      silent: options.silent,
      overwrite: options.force
    })
  }

  if (hasAnyErrors === true) process.exit(1)
}

if (process.argv.find(arg => arg === '-h' || arg === '--help')) {
  console.log(`
  Usage: vuec [options] [file ...]

  Examples: vuec
            vuec --outDir dist app.vue

  Options:
  -h, --help              Output usage information.
  -d <path>
  --outDir <path>         Redirect output structure to the directory.
  -f, --force             Overwrite existing files.
  -s, --silent            No console output.
  `)
} else {
  main(process.argv).catch((error: Error) => logger.fatal(error))
}
