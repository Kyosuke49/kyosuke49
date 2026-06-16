# plotter.nim
# 関数描画エンジン — kyosuke49's website
# Compile: nim js -d:release --out:plotter-nim.js plotter.nim

import std/[math, strutils]

# ============================================================
# 特殊関数
# ============================================================

proc gammaLanczos(z: float64): float64 =
  if z < 0.5:
    return PI / (sin(PI * z) * gammaLanczos(1.0 - z))
  let n = z - 1.0
  const g = 7
  const c = [
    0.99999999999980993'f64,
    676.5203681218851'f64,
    -1259.1392167224028'f64,
    771.32342877765313'f64,
    -176.61502916214059'f64,
    12.507343278686905'f64,
    -0.13857109526572012'f64,
    9.9843695780195716e-6'f64,
    1.5056327351493116e-7'f64
  ]
  var x = c[0]
  for i in 1..g+1:
    x += c[i] / (n + float64(i))
  let t = n + float64(g) + 0.5
  return sqrt(2.0 * PI) * pow(t, n + 0.5) * exp(-t) * x

proc factInt(n: int): float64 =
  if n < 0: return NaN
  if n == 0 or n == 1: return 1.0
  result = 1.0
  for i in 2..n: result *= float64(i)

proc binomInt(n, k: int): float64 =
  if k < 0 or k > n: return 0.0
  if k == 0 or k == n: return 1.0
  var kk = k
  if kk > n - kk: kk = n - kk
  result = 1.0
  for i in 0..<kk:
    result = result * float64(n - i) / float64(i + 1)

proc harmonicN(n: int): float64 =
  result = 0.0
  for i in 1..max(n, 0): result += 1.0 / float64(i)

proc fallingFact(x: float64, n: int): float64 =
  if n == 0: return 1.0
  if n < 0: return 1.0 / fallingFact(x + float64(-n), -n)
  result = 1.0
  for i in 0..<n: result *= (x - float64(i))

proc risingFact(x: float64, n: int): float64 =
  if n == 0: return 1.0
  result = 1.0
  for i in 0..<n: result *= (x + float64(i))

proc cbrtSafe(x: float64): float64 =
  if x >= 0.0: return pow(x, 1.0 / 3.0)
  return -pow(-x, 1.0 / 3.0)

# ============================================================
# 字句解析
# ============================================================

type
  TokKind = enum
    tkNum, tkIdent, tkPlus, tkMinus, tkStar, tkSlash,
    tkCaret, tkLParen, tkRParen, tkComma, tkEOF, tkBad

  Token = object
    kind: TokKind
    numVal: float64
    strVal: string

  Lexer = object
    src: string
    pos: int

proc newLexer(src: string): Lexer = Lexer(src: src, pos: 0)

proc peekCh(l: Lexer): char =
  if l.pos < l.src.len: l.src[l.pos] else: '\0'

proc advCh(l: var Lexer): char =
  result = peekCh(l)
  if l.pos < l.src.len: inc l.pos

proc skipWs(l: var Lexer) =
  while peekCh(l) in {' ', '\t', '\n', '\r'}: discard l.advCh()

proc nextTok(l: var Lexer): Token =
  l.skipWs()
  let c = peekCh(l)
  if c == '\0': return Token(kind: tkEOF)
  case c
  of '+': discard l.advCh(); return Token(kind: tkPlus)
  of '-': discard l.advCh(); return Token(kind: tkMinus)
  of '*': discard l.advCh(); return Token(kind: tkStar)
  of '/': discard l.advCh(); return Token(kind: tkSlash)
  of '^': discard l.advCh(); return Token(kind: tkCaret)
  of '(': discard l.advCh(); return Token(kind: tkLParen)
  of ')': discard l.advCh(); return Token(kind: tkRParen)
  of ',': discard l.advCh(); return Token(kind: tkComma)
  of '0'..'9', '.':
    var s = ""
    while peekCh(l) in {'0'..'9', '.'}:
      s.add(l.advCh())
    if peekCh(l) in {'e', 'E'}:
      s.add(l.advCh())
      if peekCh(l) in {'+', '-'}: s.add(l.advCh())
      while peekCh(l) in {'0'..'9'}: s.add(l.advCh())
    try:
      return Token(kind: tkNum, numVal: parseFloat(s))
    except:
      return Token(kind: tkBad)
  of 'a'..'z', 'A'..'Z', '_':
    var s = ""
    while peekCh(l) in {'a'..'z', 'A'..'Z', '0'..'9', '_'}:
      s.add(l.advCh())
    return Token(kind: tkIdent, strVal: s)
  else:
    discard l.advCh()
    return Token(kind: tkBad)

# ============================================================
# AST
# ============================================================

type
  NodeKind = enum
    nNum, nVar, nBin, nUnary, nFunc

  Node = ref object
    case kind: NodeKind
    of nNum:
      numVal: float64
    of nVar:
      varName: string
    of nBin:
      op: char
      left, right: Node
    of nUnary:
      uop: char
      child: Node
    of nFunc:
      funcName: string
      args: seq[Node]

# ============================================================
# 構文解析（再帰下降）
# ============================================================

type
  Parser = object
    lex: Lexer
    cur: Token
    nxt: Token

proc newParser(src: string): Parser =
  var p: Parser
  p.lex = newLexer(src)
  p.cur = p.lex.nextTok()
  p.nxt = p.lex.nextTok()
  p

proc adv(p: var Parser): Token =
  result = p.cur
  p.cur = p.nxt
  p.nxt = p.lex.nextTok()

proc parseExpr(p: var Parser): Node

proc parsePrimary(p: var Parser): Node =
  case p.cur.kind
  of tkNum:
    let v = p.cur.numVal
    discard p.adv()
    return Node(kind: nNum, numVal: v)
  of tkIdent:
    let name = p.cur.strVal
    discard p.adv()
    if p.cur.kind == tkLParen:
      discard p.adv()
      var args: seq[Node]
      if p.cur.kind != tkRParen:
        args.add(p.parseExpr())
        while p.cur.kind == tkComma:
          discard p.adv()
          args.add(p.parseExpr())
      if p.cur.kind == tkRParen: discard p.adv()
      return Node(kind: nFunc, funcName: name, args: args)
    return Node(kind: nVar, varName: name)
  of tkLParen:
    discard p.adv()
    let inner = p.parseExpr()
    if p.cur.kind == tkRParen: discard p.adv()
    return inner
  of tkMinus:
    discard p.adv()
    let ch = p.parsePrimary()
    return Node(kind: nUnary, uop: '-', child: ch)
  of tkPlus:
    discard p.adv()
    return p.parsePrimary()
  else:
    return Node(kind: nNum, numVal: 0.0)

proc parsePow(p: var Parser): Node =
  var base = p.parsePrimary()
  if p.cur.kind == tkCaret:
    discard p.adv()
    let exp = p.parsePow()
    return Node(kind: nBin, op: '^', left: base, right: exp)
  return base

proc parseMul(p: var Parser): Node =
  var left = p.parsePow()
  while p.cur.kind in {tkStar, tkSlash}:
    let op = if p.cur.kind == tkStar: '*' else: '/'
    discard p.adv()
    let right = p.parsePow()
    left = Node(kind: nBin, op: op, left: left, right: right)
  return left

proc parseExpr(p: var Parser): Node =
  var left = p.parseMul()
  while p.cur.kind in {tkPlus, tkMinus}:
    let op = if p.cur.kind == tkPlus: '+' else: '-'
    discard p.adv()
    let right = p.parseMul()
    left = Node(kind: nBin, op: op, left: left, right: right)
  return left

# ============================================================
# 評価器
# ============================================================

proc evalNode(node: Node, x, n: float64): float64

proc evalFunc(name: string, args: seq[Node], x, n: float64): float64 =
  template a(i: int): float64 = evalNode(args[i], x, n)
  let argc = args.len
  case name.toLowerAscii()
  # 三角関数
  of "sin":   return sin(a(0))
  of "cos":   return cos(a(0))
  of "tan":   return tan(a(0))
  of "sec":   return 1.0 / cos(a(0))
  of "csc":   return 1.0 / sin(a(0))
  of "cot":   return cos(a(0)) / sin(a(0))
  of "asin", "arcsin": return arcsin(a(0))
  of "acos", "arccos": return arccos(a(0))
  of "atan", "arctan":
    if argc >= 2: return arctan2(a(0), a(1))
    return arctan(a(0))
  of "atan2": return arctan2(a(0), a(1))
  # 双曲線関数
  of "sinh": return sinh(a(0))
  of "cosh": return cosh(a(0))
  of "tanh": return tanh(a(0))
  of "asinh", "arcsinh": return arcsinh(a(0))
  of "acosh", "arccosh": return arccosh(a(0))
  of "atanh", "arctanh": return arctanh(a(0))
  # 指数・対数
  of "exp": return exp(a(0))
  of "ln":  return ln(a(0))
  of "log":
    if argc >= 2: return ln(a(0)) / ln(a(1))
    return ln(a(0))
  of "log10": return log10(a(0))
  of "log2":  return log2(a(0))
  # べき根
  of "sqrt": return sqrt(a(0))
  of "cbrt": return cbrtSafe(a(0))
  of "pow":  return pow(a(0), a(1))
  of "nthroot":
    let v = a(0); let r = a(1)
    if v >= 0.0: return pow(v, 1.0 / r)
    return -pow(-v, 1.0 / r)
  # 丸め・符号
  of "abs":  return abs(a(0))
  of "floor":return floor(a(0))
  of "ceil": return ceil(a(0))
  of "round":return round(a(0))
  of "frac":
    let v = a(0)
    return v - floor(v)
  of "sgn", "sign":
    let v = a(0)
    if v > 0.0: return 1.0 elif v < 0.0: return -1.0 else: return 0.0
  of "min": return min(a(0), a(1))
  of "max": return max(a(0), a(1))
  of "clamp":
    let v = a(0); let lo = a(1); let hi = a(2)
    return max(lo, min(hi, v))
  # 組合せ論
  of "fact", "factorial":
    return factInt(round(a(0)).int)
  of "gamma": return gammaLanczos(a(0))
  of "beta":
    return gammaLanczos(a(0)) * gammaLanczos(a(1)) / gammaLanczos(a(0) + a(1))
  of "c", "binom", "choose":
    return binomInt(round(a(0)).int, round(a(1)).int)
  of "p", "perm":
    let nn = round(a(0)).int; let kk = round(a(1)).int
    return factInt(nn) / factInt(nn - kk)
  # 調和数
  of "h", "harmonic", "hn":
    return harmonicN(round(a(0)).int)
  # 落ちる/上がる階乗
  of "fall", "fallfact", "ffact", "pochhammer_fall":
    return fallingFact(a(0), round(a(1)).int)
  of "rise", "risefact", "rfact", "pochhammer":
    return risingFact(a(0), round(a(1)).int)
  # 差分演算子
  of "delta":
    # delta(f(x)) = f(x+1) - f(x), 高階: delta(f(x), n)
    if argc >= 2:
      let order = round(a(1)).int
      var acc = 0.0
      for k in 0..order:
        let b = binomInt(order, k)
        let s = if (order - k) mod 2 == 0: 1.0 else: -1.0
        acc += s * b * evalNode(args[0], x + float64(k), n)
      return acc
    return evalNode(args[0], x + 1.0, n) - evalNode(args[0], x, n)
  of "nabla":
    # 後退差分: f(x) - f(x-1), 高階: nabla(f(x), n)
    if argc >= 2:
      let order = round(a(1)).int
      var acc = 0.0
      for k in 0..order:
        let b = binomInt(order, k)
        let s = if k mod 2 == 0: 1.0 else: -1.0
        acc += s * b * evalNode(args[0], x - float64(k), n)
      return acc
    return evalNode(args[0], x, n) - evalNode(args[0], x - 1.0, n)
  # 定和分
  of "sum", "sigma":
    # sum(f(x), a, b) : Σ_{x=a}^{b} f(x)
    if argc >= 3:
      let aI = round(a(1)).int
      let bI = round(a(2)).int
      var total = 0.0
      for k in aI..bI:
        total += evalNode(args[0], float64(k), n)
      return total
    return 0.0
  # 積分
  of "integ", "integral":
    # integ(f(x), a, b) 数値定積分
    if argc >= 3:
      let lo = a(1); let hi = a(2)
      let steps = 1000
      let h = (hi - lo) / float64(steps)
      var s = evalNode(args[0], lo, n) + evalNode(args[0], hi, n)
      for i in 1..<steps:
        let xv = lo + float64(i) * h
        let w = if i mod 2 == 0: 2.0 else: 4.0
        s += w * evalNode(args[0], xv, n)
      return s * h / 3.0
    return 0.0
  # 数値微分
  of "deriv", "diff":
    if argc >= 1:
      let h = 1e-5
      let f1 = evalNode(args[0], x - 2.0*h, n)
      let f2 = evalNode(args[0], x - h, n)
      let f3 = evalNode(args[0], x + h, n)
      let f4 = evalNode(args[0], x + 2.0*h, n)
      return (-f4 + 8.0*f3 - 8.0*f2 + f1) / (12.0 * h)
    return 0.0
  # 剰余・整数演算
  of "mod":
    let av = a(0); let bv = a(1)
    return av - floor(av / bv) * bv
  of "gcd":
    var av = abs(round(a(0))).int
    var bv = abs(round(a(1))).int
    while bv != 0:
      let tmp = bv
      bv = av mod bv
      av = tmp
    return float64(av)
  of "lcm":
    let av = abs(round(a(0))).int
    let bv = abs(round(a(1))).int
    if av == 0 or bv == 0: return 0.0
    var ga = av; var gb = bv
    while gb != 0:
      let tmp = gb; gb = ga mod gb; ga = tmp
    return float64(av * bv div ga)
  # 特殊
  of "sinc":
    let v = a(0)
    if v == 0.0: return 1.0
    return sin(PI * v) / (PI * v)
  of "heaviside", "step":
    let v = a(0)
    if v > 0.0: return 1.0 elif v < 0.0: return 0.0 else: return 0.5
  of "rect":
    let v = abs(a(0))
    if v < 0.5: return 1.0 elif v > 0.5: return 0.0 else: return 0.5
  of "tri":
    let v = abs(a(0))
    if v >= 1.0: return 0.0 else: return 1.0 - v
  of "dirichlet":
    # Dirichlet kernel
    let v = a(0); let m = round(a(1)).int
    if sin(v / 2.0) == 0.0: return float64(2*m + 1)
    return sin(float64(2*m+1) * v / 2.0) / sin(v / 2.0)
  else:
    return NaN

proc evalNode(node: Node, x, n: float64): float64 =
  if node == nil: return 0.0
  case node.kind
  of nNum: return node.numVal
  of nVar:
    case node.varName.toLowerAscii()
    of "x":   return x
    of "n":   return n
    of "pi":  return PI
    of "e":   return E
    of "phi": return (1.0 + sqrt(5.0)) / 2.0
    of "inf", "infinity": return Inf
    of "nan": return NaN
    of "tau": return 2.0 * PI
    else: return NaN
  of nBin:
    let l = evalNode(node.left,  x, n)
    let r = evalNode(node.right, x, n)
    case node.op
    of '+': return l + r
    of '-': return l - r
    of '*': return l * r
    of '/':
      if r == 0.0: return if l >= 0.0: Inf else: NegInf
      return l / r
    of '^': return pow(l, r)
    else: return 0.0
  of nUnary:
    let v = evalNode(node.child, x, n)
    if node.uop == '-': return -v
    return v
  of nFunc:
    return evalFunc(node.funcName, node.args, x, n)

proc parseAndEval(expr: string, x: float64, n: float64 = 0.0): float64 =
  var p = newParser(expr)
  let ast = p.parseExpr()
  return evalNode(ast, x, n)

# ============================================================
# エクスポート関数（JSブリッジから呼び出す）
# ============================================================

proc evalExpr(expr: cstring, x: float64): float64 {.exportc.} =
  try: return parseAndEval($expr, x)
  except: return NaN

proc getDeriv(expr: cstring, x: float64): float64 {.exportc.} =
  let e = $expr
  let h = 1e-5
  try:
    let f1 = parseAndEval(e, x - 2.0*h)
    let f2 = parseAndEval(e, x - h)
    let f3 = parseAndEval(e, x + h)
    let f4 = parseAndEval(e, x + 2.0*h)
    return (-f4 + 8.0*f3 - 8.0*f2 + f1) / (12.0 * h)
  except: return NaN

proc getSecondDeriv(expr: cstring, x: float64): float64 {.exportc.} =
  let h = 1e-4
  let e = $expr
  try:
    let f0 = parseAndEval(e, x - h)
    let f1 = parseAndEval(e, x)
    let f2 = parseAndEval(e, x + h)
    return (f0 - 2.0*f1 + f2) / (h*h)
  except: return NaN

proc getIntegral(expr: cstring, a, b: float64): float64 {.exportc.} =
  let e = $expr
  let steps = 2000
  let h = (b - a) / float64(steps)
  try:
    var s = parseAndEval(e, a) + parseAndEval(e, b)
    for i in 1..<steps:
      let xv = a + float64(i) * h
      let w = if i mod 2 == 0: 2.0 else: 4.0
      s += w * parseAndEval(e, xv)
    return s * h / 3.0
  except: return NaN

proc getForwardDiff(expr: cstring, x: float64, order: cint): float64 {.exportc.} =
  let e = $expr
  let n = int(order)
  var acc = 0.0
  for k in 0..n:
    let b = binomInt(n, k)
    let s = if (n - k) mod 2 == 0: 1.0 else: -1.0
    acc += s * b * parseAndEval(e, x + float64(k))
  return acc

proc getBackwardDiff(expr: cstring, x: float64, order: cint): float64 {.exportc.} =
  let e = $expr
  let n = int(order)
  var acc = 0.0
  for k in 0..n:
    let b = binomInt(n, k)
    let s = if k mod 2 == 0: 1.0 else: -1.0
    acc += s * b * parseAndEval(e, x - float64(k))
  return acc

proc getDefiniteSum(expr: cstring, a, b: cint): float64 {.exportc.} =
  let e = $expr
  var total = 0.0
  for k in int(a)..int(b):
    total += parseAndEval(e, float64(k))
  return total

proc getAntiDiffAt(expr: cstring, x: float64, base: cint): float64 {.exportc.} =
  ## 不定和分 F(x) = Σ_{k=base}^{x-1} f(k)、F(base)=0
  let e = $expr
  let baseI = int(base)
  let xI = int(round(x))
  if xI <= baseI: return 0.0
  var total = 0.0
  for k in baseI..<xI:
    total += parseAndEval(e, float64(k))
  return total

proc getHarmonic(n: cint): float64 {.exportc.} =
  return harmonicN(int(n))

proc getFallingFact(x: float64, n: cint): float64 {.exportc.} =
  return fallingFact(x, int(n))

proc getRisingFact(x: float64, n: cint): float64 {.exportc.} =
  return risingFact(x, int(n))

proc getPlotPoints(expr: cstring, xMin, xMax: float64, steps: cint): cstring {.exportc.} =
  let e = $expr
  let n = int(steps)
  let dx = (xMax - xMin) / float64(n - 1)
  var parts: seq[string]
  for i in 0..<n:
    let xv = xMin + float64(i) * dx
    var yv: float64
    try: yv = parseAndEval(e, xv)
    except: yv = NaN
    if yv.isNaN or yv > 1e15 or yv < -1e15:
      parts.add("{\"x\":" & $xv & ",\"y\":null}")
    else:
      parts.add("{\"x\":" & $xv & ",\"y\":" & $yv & "}")
  return cstring("[" & parts.join(",") & "]")

proc getAntiDiffPoints(expr: cstring, xMin: float64, xMax: float64, base: cint): cstring {.exportc.} =
  let e = $expr
  let baseI = int(base)
  let xMinI = int(round(xMin))
  let xMaxI = int(round(xMax))
  var parts: seq[string]
  for xi in xMinI..xMaxI:
    let yv = getAntiDiffAt(cstring(e), float64(xi), base)
    parts.add("{\"x\":" & $xi & ",\"y\":" & $yv & "}")
  return cstring("[" & parts.join(",") & "]")

proc getDiscretePlotPoints(expr: cstring, xMin: float64, xMax: float64): cstring {.exportc.} =
  ## 離散点列（整数 x のみ）
  let e = $expr
  let xMinI = int(round(xMin))
  let xMaxI = int(round(xMax))
  var parts: seq[string]
  for xi in xMinI..xMaxI:
    var yv: float64
    try: yv = parseAndEval(e, float64(xi))
    except: yv = NaN
    if yv.isNaN or yv > 1e15 or yv < -1e15:
      parts.add("{\"x\":" & $xi & ",\"y\":null}")
    else:
      parts.add("{\"x\":" & $xi & ",\"y\":" & $yv & "}")
  return cstring("[" & parts.join(",") & "]")
