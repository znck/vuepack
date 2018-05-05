import {compileScssStyle} from '../src/style'
import promised from '@znck/promised'
import * as _fs from 'fs'
import * as path from 'path'

const fs = promised(_fs)

describe('scss', () => {
  const fileImportScss = path.resolve(__dirname, './fixtures/import.scss')
  const fileStyleScss = path.resolve(__dirname, './fixtures/style.scss')
  test('no imports allowed', async () => {
    const content = (await fs.readFile(fileImportScss)).toString()
    const result = await compileScssStyle(content, {filename: fileImportScss})

    expect(result.errors.length).toBe(1)
    expect(result.errors[0]).toEqual(expect.stringContaining('Only css imports are supported.'))
  })
})
