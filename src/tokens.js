/* Hand-written tokenizers for JavaScript tokens that can't be
   expressed by lezer's built-in tokenizer. */

import {ExternalTokenizer, ContextTracker} from "@lezer/lr"
import {
  spaces, newline,
  LineComment,
} from "./parser.terms.js"

const space = [9, 10, 11, 12, 13, 32, 133, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200,
               8201, 8202, 8232, 8233, 8239, 8287, 12288]

const braceR = 125, semicolon = 59, slash = 47, star = 42, plus = 43, minus = 45, lt = 60, comma = 44, question = 63, dot = 46, bracketL = 91

export const trackNewline = new ContextTracker({
  start: false,
  shift(context, term) {
    return term == LineComment || term == spaces ? context : term == newline
  },
  strict: false
})

export const operatorToken = new ExternalTokenizer((input, stack) => {
  let {next} = input
  if (next == plus || next == minus) {
    input.advance()
    if (next == input.next) {
      input.advance()
      let mayPostfix = !stack.context && stack.canShift(incdec)
      input.acceptToken(mayPostfix ? incdec : incdecPrefix)
    }
  } else if (next == question && input.peek(1) == dot) {
    input.advance(); input.advance()
    if (input.next < 48 || input.next > 57) // No digit after
      input.acceptToken(questionDot)
  }
}, {contextual: true})

function identifierChar(ch, start) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch == 95 || ch >= 192 ||
    !start && ch >= 48 && ch <= 57
}
