// Core classes and objects
//
// This module defines classes for the AST nodes. Only the constructors are
// defined here. Semantic analysis methods, optimization methods, and code
// generation are handled by other modules. This keeps the compiler organized
// by phase.

import util from "util"

export class Program {
  constructor(statements) {
    this.statements = statements
  }
}

export class VariableDeclaration {
  constructor(type, variable, initializer) {
    Object.assign(this, { type, variable, initializer })
  }
}

export class Conditional {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate })
  }
}

export class If {
  constructor(condition, block, elseifs, elseStatement) {
    Object.assign(this, { condition, block, elseifs, elseStatement })
  }
}

export class ElseIf {
  constructor(condition, block) {
    Object.assign(this, { condition, block })
  }
}

export class Else {
  constructor(block) {
    Object.assign(this, { block })
  }
}

export class FunctionDeclaration {
  constructor(type, id, params, block) {
    Object.assign(this, { type, id, params, block })
  }
}

export class FuncParam {
  constructor(type, id) {
    Object.assign(this, { type, id })
  }
}

export class Assignment {
  constructor(target, source) {
    Object.assign(this, { target, source })
  }
}

export class WhileStatement {
  constructor(test, body) {
    Object.assign(this, { test, body })
  }
}

export class ReturnStatement {
  constructor(value) {
    Object.assign(this, { value })
  }
}

export class PrintStatement {
  constructor(argument) {
    Object.assign(this, { argument })
  }
}

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args })
  }
}

export class BreakStatement {
  // Intentionally empty
}

export class Type {
  // Type of all basic type int, float, string, etc. and superclass of others
  static BOOLEAN = new Type("boolin")
  static INT = new Type("pog")
  static DOUBLE = new Type("dublin")
  static STRING = new Type("manyCars")
  static VOID = new Type("nada")
  constructor(typename) {
    Object.assign(this, { typename })
  }
}

export class ArrayType extends Type {
  constructor(elementType) {
    if (elementType instanceof Type) {
      super(`[${elementType.typename}]`)
      Object.assign(this, { elementType })
    }
  }
}

export class CringeArray {
  constructor(values) {
    Object.assign(this, { values })
  }
}

export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right })
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand })
  }
}

export class SubscriptExpression {
  // Example: a[20]
  constructor(array, index) {
    Object.assign(this, { array, index })
  }
}

export class MemberExpression {
  //we don't have structs, classes, etc. so this is obsolete but language breaks if deleted
  // Example: state.population
  constructor(object, field) {
    Object.assign(this, { object, field })
  }
}

// Token objects are wrappers around the Nodes produced by Ohm. We use
// them here just for simple things like numbers and identifiers. The
// Ohm node will go in the "source" property.
export class Token {
  constructor(category, source) {
    Object.assign(this, { category, source })
  }
  get lexeme() {
    return this.source.contents
  }
}

export class Variable {
  constructor(name) {
    Object.assign(this, { name })
  }
}

export class Function {
  constructor(name, params, type) {
    Object.assign(this, { name, params, type })
  }
}

export class FunctionType extends Type {
  // Example: (boolean,[string]?)->float
  constructor(paramTypes, returnType) {
    super(
      `(${paramTypes.map((t) => t.typename).join(",")})->${returnType.typename}`
    )
    Object.assign(this, { paramTypes, returnType })
  }
}

export const standardLibrary = Object.freeze({
  π: new Variable("π", true),
  sqrt: new Function("sqrt", 1, true),
  sin: new Function("sin", 1, true),
  cos: new Function("cos", 1, true),
  exp: new Function("exp", 1, true),
  ln: new Function("ln", 1, true),
  hypot: new Function("hypot", 2, true),
})

// Throw an error message that takes advantage of Ohm's messaging
export function error(message, token) {
  //   if (token?.source) {
  //     throw new Error(`${token.source.getLineAndColumnMessage()}${message}`)
  //   }
  throw new Error(message)
}

// Return a compact and pretty string representation of the node graph,
// taking care of cycles. Written here from scratch because the built-in
// inspect function, while nice, isn't nice enough. Defined properly in
// the root class prototype so that it automatically runs on console.log.
Program.prototype[util.inspect.custom] = function () {
  const tags = new Map()

  // Attach a unique integer tag to every node
  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return
    if (node.constructor === Token) {
      // Tokens are not tagged themselves, but their values might be
      tag(node?.value)
    } else {
      // Non-tokens are tagged
      tags.set(node, tags.size + 1)
      for (const child of Object.values(node)) {
        Array.isArray(child) ? child.forEach(tag) : tag(child)
      }
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`
      if (e?.constructor === Token) {
        return `(${e.category},"${e.lexeme}"${
          /*   e.value ? "," + view(e.value) : ""  */ ""
        })`
      }
      if (Array.isArray(e)) return `[${e.map(view)}]`
      return util.inspect(e)
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let type = node.constructor.name
      let props = Object.entries(node).map(([k, v]) => `${k}=${view(v)}`)
      yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`
    }
  }

  tag(this)
  return [...lines()].join("\n")
}
