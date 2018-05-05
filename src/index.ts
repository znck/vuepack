import {CompilerResult} from "./utils"
import {compileTypeWithDestination} from "./any"

export type CompiledFile = CompilerResult & { filename?: string }

export async function compile(filename: string, source: string): Promise<CompiledFile> {
  const type = filename.substr(filename.lastIndexOf('.') + 1)

  return compileTypeWithDestination(type, source, {filename})
}
