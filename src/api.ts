export interface CompilerOptions {
  filename?: string
  plugins: Plugin[]
}

export interface CompilerResult {
  code?: string
  map?: any
  tips: string[]
  errors: Array<string | Error>
}


export interface MessageBagAPI {
  error(error: Error | string): void

  tip(tip: string): void
}

export interface FileRewriterAPI extends MessageBagAPI {
  name(filename: string): void

  content(content: string): void
}

export interface ComponentRewriterAPI extends MessageBagAPI {
  isFunctional: boolean

  defineInstanceProperty(name: string, value: string): void

  defineOption(name: string, value: string): void

  defineHook(name: string, value: string): void

  addBlock(block: CustomBlock): void

  addBlock(type: string, attrs: { [key: string]: string }, content?: string): void
}

export interface CustomFile {
  filename: string,
  content: string
}

export interface CustomBlock extends CustomFile {
  type: string
  attrs: { [key: string]: string }
  code?: string
  lang?: string
}

export interface ProcessedResults {
  filename?: string
  code?: string
  tips: string[]
  errors: Array<string | Error>
}

export interface BlockPlugin {
  name: string

  testBlock(type: string, srcOrLang?: string): boolean

  processBlock(block: CustomBlock, api: ComponentRewriterAPI): Promise<void>
}

export interface FilePlugin {
  name: string

  testFile(filename: string): boolean

  processFile(file: CustomFile, api: FileRewriterAPI): Promise<void>
}

export type Plugin = BlockPlugin & FilePlugin