import LessPlugin from "./less"
import SassPlugin from "./sass"
import TypescriptPlugin from "./typescript"
import BabelPlugin from "./babel"
import TemplatePlugin from "./template"
import CSSPlugin from "./css"

export default [
  new TemplatePlugin(),
  new CSSPlugin(),
  new LessPlugin(),
  new SassPlugin(),
  new TypescriptPlugin(),
  new BabelPlugin()
]