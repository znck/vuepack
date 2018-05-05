import { compileVue } from '../src/vue'
import * as path from 'path'
import { read as _read } from '../src/utils'

async function read(filename: string): Promise<string> {
  return _read(path.resolve(__dirname, filename))
}

describe('simple', () => {
  let content

  beforeAll(async () => {
    content = await compileVue(await read('./fixtures/Simple.vue'), {})
  })

  test('compiles without error', () => expect(content.errors.length).toBe(0))
  test('keeps template as it is', () => expect(content.code).toEqual(expect.stringContaining('<div>Example</div>')))
  test('keeps style as it is', () => expect(content.code).toEqual(expect.stringContaining(`div {\n  color: 'red';\n}`)))
  test('trans forms to es6', () => expect(content.code).toEqual(expect.stringContaining(`export default`)))
  test('has name as it is', () => expect(content.code).toEqual(expect.stringContaining(`name: 'Simple'`)))
  test('compiles rest operator', () => expect(content.code).toEqual(expect.stringContaining(`foo: function foo() {`)))
})

describe('with typescript', () => {
  let content

  beforeAll(async () => {
    content = await compileVue(await read('./fixtures/WithTypescript.vue'), {})
  })

  test('compiles without error', () => expect(content.errors.length).toBe(0))
  test('trans forms to es6', () => expect(content.code).toEqual(expect.stringContaining(`export default`)))
  test('remove script language', () => expect(content.code).toEqual(expect.stringContaining(`<script>`)))
  test('has name as it is', () => expect(content.code).toEqual(expect.stringContaining(`name: 'Simple'`)))
  test('compiles rest operator', () => expect(content.code).toEqual(expect.stringContaining(`foo: function foo() {`)))
})


describe('with typescript import', () => {
  let content

  beforeAll(async () => {
    content = await compileVue(await read('./fixtures/WithTypescriptImport.vue'), {})
  })

  test('compiles without error', () => expect(content.errors.length).toBe(0))
  test('convert import to js', () => expect(content.code).toEqual(expect.stringContaining(`<script src="./script.js">`)))
})

describe('with scss', () => {
  let content

  beforeAll(async () => {
    content = await compileVue(await read('./fixtures/WithScss.vue'), {})
  })

  test('compiles without error', () => expect(content.errors.length).toBe(0))
  test('compile scss', () => expect(content.code).toEqual(expect.stringContaining(`color: "red";`)))
  test('remove style language', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped>`)))
})

describe('with scss import', () => {
  let content

  beforeAll(async () => {
    content = await compileVue(await read('./fixtures/WithScssImport.vue'), {})
  })

  test('compiles without error', () => expect(content.errors.length).toBe(0))
  test('convert import to css', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped src="./style-scss.css">`)))
})

describe('with sass', () => {
  let content

  beforeAll(async () => {
    content = await compileVue(await read('./fixtures/WithSass.vue'), {})
  })

  test('compiles without error', () => expect(content.errors.length).toBe(0))
  test('compile sass', () => expect(content.code).toEqual(expect.stringContaining(`color: "red";`)))
  test('remove style language', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped>`)))
})

describe('with sass import', () => {
  let content

  beforeAll(async () => {
    content = await compileVue(await read('./fixtures/WithSassImport.vue'), {})
  })

  test('compiles without error', () => expect(content.errors.length).toBe(0))
  test('convert import to css', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped src="./style-sass.css">`)))
})

describe('with less', () => {
  let content

  beforeAll(async () => {
    content = await compileVue(await read('./fixtures/WithLess.vue'), {})
  })

  test('compiles without error', () => expect(content.errors.length).toBe(0))
  test('compile less', () => expect(content.code).toEqual(expect.stringContaining(`color: 'red';`)))
  test('remove style language', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped>`)))
})

describe('with less import', () => {
  let content

  beforeAll(async () => {
    content = await compileVue(await read('./fixtures/WithLessImport.vue'), {})
  })

  test('compiles without error', () => expect(content.errors.length).toBe(0))
  test('convert import to css', () => expect(content.code).toEqual(expect.stringContaining(`<style scoped src="./style-less.css">`)))
})
