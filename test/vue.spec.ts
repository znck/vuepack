import {compile as compileVue} from '../src/'
import plugins from '../src/plugins'
import * as path from 'path'
import {read as _read} from '../src/utils'

async function read(filename: string): Promise<string> {
  return _read(path.resolve(__dirname, filename))
}

describe('with css', () => {
  let content

  beforeAll(async () => {
    content = await compileVue('Simple.vue', await read('./fixtures/WithCss.vue'), plugins)
  })

  test('compiles without error', () => expect(content.errors).toEqual([]))
  test('keeps template as it is', () => expect(content.code).toEqual(expect.stringContaining('<div>Example</div>')))
  test('keeps style as it is', () => expect(content.code).toEqual(expect.stringContaining(`div {\n  color: red;\n}`)))
  test('trans forms to es6', () => expect(content.code).toEqual(expect.stringContaining(`export default`)))
  test('has name as it is', () => expect(content.code).toEqual(expect.stringContaining(`name: 'Simple'`)))
  test('compiles rest operator', () => expect(content.code).toEqual(expect.stringContaining(`foo: function foo() {`)))
})

describe('with typescript', () => {
  let content

  beforeAll(async () => {
    content = await compileVue('WithTypescript.vue', await read('./fixtures/WithTypescript.vue'), plugins)
  })

  test('compiles without error', () => expect(content.errors).toEqual([]))
  test('trans forms to es6', () => expect(content.code).toEqual(expect.stringContaining(`export default`)))
  test('remove script language', () => expect(content.code).toEqual(expect.stringContaining(`<script>`)))
  test('has name as it is', () => expect(content.code).toEqual(expect.stringContaining(`name: 'Simple'`)))
  test('compiles rest operator', () => expect(content.code).toEqual(expect.stringContaining(`foo: function foo() {`)))
})


describe('with typescript import', () => {
  let content

  beforeAll(async () => {
    content = await compileVue('WithTypescriptImport.vue', await read('./fixtures/WithTypescriptImport.vue'), plugins)
  })

  test('compiles without error', () => expect(content.errors).toEqual([]))
  test('convert import to js', () => expect(content.code).toEqual(expect.stringContaining(`<script src="./typescript.js">`)))
})

describe('with scss', () => {
  let content

  beforeAll(async () => {
    content = await compileVue('WithScss.vue', await read('./fixtures/WithScss.vue'), plugins)
  })

  test('compiles without error', () => expect(content.errors).toEqual([]))
  test('compile scss', () => expect(content.code).toEqual(expect.stringContaining(`--color: red`)))
  test('compile scss', () => expect(content.code).toEqual(expect.stringContaining(`color: var(--color);`)))
  test('remove style language', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped>`)))
})

describe('with scss import', () => {
  let content

  beforeAll(async () => {
    content = await compileVue('WithScssImport.vue', await read('./fixtures/WithScssImport.vue'), plugins)
  })

  test('compiles without error', () => expect(content.errors).toEqual([]))
  test('convert import to css', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped src="./style-scss.css">`)))
})

describe('with sass', () => {
  let content

  beforeAll(async () => {
    content = await compileVue('WithSass.vue', await read('./fixtures/WithSass.vue'), plugins)
  })

  test('compiles without error', () => expect(content.errors).toEqual([]))
  test('compile sass', () => expect(content.code).toEqual(expect.stringContaining(`--color: red`)))
  test('compile sass', () => expect(content.code).toEqual(expect.stringContaining(`color: var(--color);`)))
  test('remove style language', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped>`)))
})

describe('with sass import', () => {
  let content

  beforeAll(async () => {
    content = await compileVue('WithSassImport.vue', await read('./fixtures/WithSassImport.vue'), plugins)
  })

  test('compiles without error', () => expect(content.errors).toEqual([]))
  test('convert import to css', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped src="./style-sass.css">`)))
})

describe('with less', () => {
  let content

  beforeAll(async () => {
    content = await compileVue('WithLess.vue', await read('./fixtures/WithLess.vue'), plugins)
  })

  test('compiles without error', () => expect(content.errors).toEqual([]))
  test('compile less', () => expect(content.code).toEqual(expect.stringContaining(`--color: red`)))
  test('compile less', () => expect(content.code).toEqual(expect.stringContaining(`color: var(--color);`)))
  test('remove style language', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped>`)))
})

describe('with less import', () => {
  let content

  beforeAll(async () => {
    content = await compileVue('WithLessImport.vue', await read('./fixtures/WithLessImport.vue'), plugins)
  })

  test('compiles without error', () => expect(content.errors).toEqual([]))
  test('convert import to css', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped src="./style-less.css">`)))
})
