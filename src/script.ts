import {transform} from 'babel-core'
import {CompilerOptions, CompilerResult, promised} from "./utils"

export async function compileJavaScript(source: string, options: CompilerOptions): Promise<CompilerResult> {
  try {
    return {
      tips: [],
      errors: [],
      ...await promised({ transform }).transform(source, {
        presets: [['@babel/preset-env', { modules: false, loose: true }]]
      })
    }
  } catch (e) {
    return {tips: [], errors: [e.message]}
  }
}

export async function compileTypeScript(source: string, options: CompilerOptions): Promise<CompilerResult> {
  try {
    return {
      tips: [],
      errors: [],
      ...await promised({ transform }).transform(source, {
        presets: [['@babel/preset-env', { modules: false, loose: true }]],
        parserOpts: {
          plugins: ['typescript']
        }
      })
    }
  } catch (e) {
    return {tips: [], errors: [e.message]}
  }
}