import * as path from 'path'
import {  all, e, promised, flatten, resolveExternal } from '../src/utils'

describe(all.name, () => {
  const returnIn10 = () => new Promise(resolve => setTimeout(() => resolve('foo'), 10))
  const returnIn100 = () => new Promise(resolve => setTimeout(() => resolve('bar'), 100))
  it('should combine promises', async () => {
    expect(await all([returnIn10(), returnIn100()])).toEqual(['foo', 'bar'])
  })
})

describe(e.name, () => {
  test('string', () => expect(e('foo')).toBe("'foo'"))
  test('integer', () => expect(e(1)).toBe('1'))
  test('number', () => expect(e(1.5670)).toBe('1.567'))
  test('boolean', () => expect(e(false)).toBe('false'))
  test('undefined', () => expect(e(undefined)).toBe('undefined'))
  test('null', () => expect(e(null)).toBe('null'))
  test('object', () => expect(e({ foo: 'bar' })).toBe("{ foo: 'bar' }"))
  test('array', () => expect(e([{ foo: 'bar' }])).toBe("[{ foo: 'bar' }]"))
})

describe(flatten.name, () => {
  it('should flatten arrays', () => {
    expect(flatten(['foo', ['bar', undefined], null])).toEqual(['foo', 'bar'])
  })
})

describe(resolveExternal.name, () => {
  it('should not resolve without context', async () => {
    expect(await resolveExternal(undefined, 'foo.vue', [])).toBe(undefined)
  })
})
