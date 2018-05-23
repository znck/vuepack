#!/usr/bin/env node

import glob = require('glob')
import nopt = require('nopt')
import logger = require('consola')
import * as path from 'path'
import * as fs from 'fs'
import promised from '@znck/promised'
import DEFAULT_PLUGINS from '../plugins'
import{ compile } from '../index'
import { all, read, write } from '../utils'
import { Plugin, BlockPlugin, FilePlugin } from '../api';

async function run(
  source: string,
  dest: string,
  files: string[],
  {
    plugins = [],
    toStdOut = false,
    overwrite = false,
    silent = false
  }: { plugins: Array<Plugin | BlockPlugin | FilePlugin> , toStdOut: boolean; overwrite: boolean; silent: boolean }
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
            [...DEFAULT_PLUGINS, ...plugins]
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

  let config = { 
    force: options.force,
    paths: options.argv.remain.length ? options.argv.remain : ['src'],
    plugins: [],
    silent: options.silent,
    target: options.outDir
      ? path.resolve(process.cwd(), options.outDir)
      : path.join(process.cwd(), 'dist')
  }
  const configPath = path.join(process.cwd(), 'vuec.config.js')
  const hasConfigFile = await promised(fs).exists(configPath)
  if (hasConfigFile) {
    logger.info('Using config from vuec.config.js.')
    const local = require(configPath)

    if (typeof local === 'function') {
      config = { ...config, ...local(config) }
    } else {
      config = { ...config, ...local }
    }
  }
  let hasAnyErrors: boolean = true

  for (const filename of config.paths) {
    const file = path.resolve(process.cwd(), filename)
    if (!(await promised(fs).exists(file))) {
      logger.error(`No such file or directory, ${filename}`)
      continue
    }

    const isFile = (await promised(fs).lstat(file)).isFile()
    const dir = isFile ? path.dirname(file) : file
    const dest = config.paths.length > 1 && !isFile ? path.join(config.target, filename) : config.target
    const files = isFile
      ? [file]
      : await promised({ glob }).glob('**', { cwd: dir, nodir: true })

    hasAnyErrors = await run(dir, dest, files, {
      plugins: config.plugins,
      toStdOut: !hasConfigFile && !options.outDir && config.paths.length === 1,
      silent: config.silent,
      overwrite: config.force
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
