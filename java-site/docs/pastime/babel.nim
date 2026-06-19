# babel.nim — バベルの司書 WebAssembly モジュール
# ゲームシステム（乱数・グリッド・採点エンジン）
#
# エクスポート一覧:
#   nextSeed(s: uint32) -> uint32      xorshift32 PRNG
#   digit(s: uint32) -> uint32         s mod 10（0〜9）
#   gridBufPtr() -> uint32             グリッドバッファのメモリアドレス
#   traceBufPtr() -> uint32            トレースバッファのメモリアドレス
#   evalTrace(traceLen: uint32) -> int32   採点実行・合計得点を返す
#   getAwardCount() -> uint32          受賞件数
#   getAwardPts(i: uint32) -> int32    i番目の得点
#   getAwardKey(i: uint32) -> uint32   i番目のメッセージキーインデックス
#
# JS 側の使い方:
#   const mem = new Uint8Array(instance.exports.memory.buffer);
#   // グリッド生成後: mem[gridBufPtr + i] = digit (0-9)
#   // トレース評価前: mem[traceBufPtr + i] = cellIndex
#   const total = evalTrace(traceLength);
#   for i in 0..getAwardCount()-1: { pts: getAwardPts(i), key: AWARD_KEYS[getAwardKey(i)] }
#
# コンパイル:
#   nim c --cpu:wasm32 --os:any --gc:none --no-main-proc \
#     -d:release --opt:size \
#     --passC:"--target=wasm32 -nostdlib" \
#     --passL:"--target=wasm32 -nostdlib -Wl,--export-all,--no-entry" \
#     -o:babel.wasm babel.nim

# ── アワードキーインデックス ─────────────────────────────────────────
# JS 側の AWARD_KEYS 配列と順序を合わせること
const
  KEY_RUN_SMALL  = 0'u32   # msg_run_small
  KEY_RUN_MEDIUM = 1'u32   # msg_run_medium
  KEY_RUN_LARGE  = 2'u32   # msg_run_large
  KEY_E          = 3'u32   # msg_e
  KEY_PI         = 4'u32   # msg_pi
  KEY_SQRT2      = 5'u32   # msg_sqrt2
  KEY_PHI        = 6'u32   # msg_phi
  KEY_CBRT2      = 7'u32   # msg_cbrt2
  KEY_CHAMP      = 8'u32   # msg_champ
  KEY_FUMO       = 9'u32   # msg_fumo

# ── 静的メモリバッファ ────────────────────────────────────────────────
var gridBuf:   array[100, uint8]   # セルの数字値 (0-9)、JSがここに書き込む
var traceBuf:  array[100, uint8]   # トレースのセルインデックス列
var awardPts:  array[16, int32]    # 各アワードの得点
var awardKeys: array[16, uint32]   # 各アワードのキーインデックス
var awardCnt:  uint32              # アワード件数

# ── 採点定数（データセグメントに配置） ───────────────────────────────
const
  DIGITS_E      = "2718281828459045"
  DIGITS_PI     = "3141592653589793"
  DIGITS_SQRT2  = "141421356"
  DIGITS_PHI    = "161803398"
  DIGITS_CBRT2  = "12599210498"
  FUMO_SEQ      = "1145141919810"
  CHAMPERNOWNE  = "012345678910111213"

# ── ヘルパー: stdlib なしの min ──────────────────────────────────────
proc nimMin(a, b: int): int {.inline.} =
  if a < b: a else: b

# ── ヘルパー: cstring の長さ ─────────────────────────────────────────
proc cstrLen(s: cstring): int {.inline.} =
  var i = 0
  while s[i] != '\0': inc i
  i

# ── ヘルパー: 最長共通部分文字列の長さ ───────────────────────────────
proc longestCommonSubstring(s: cstring, sLen: int,
                             t: cstring, tLen: int): int =
  var maxLen = 0
  for si in 0 ..< sLen:
    for ti in 0 ..< tLen:
      var L = 0
      while si + L < sLen and ti + L < tLen and s[si + L] == t[ti + L]:
        inc L
      if L > maxLen: maxLen = L
  maxLen

# ── RNG (xorshift32) ─────────────────────────────────────────────────
proc nextSeed*(s: uint32): uint32 {.exportc, cdecl, raises: [].} =
  ## xorshift32 PRNG — ヒープ確保なし、ランタイム依存なし
  var x: uint32 = if s == 0'u32: 2463534242'u32 else: s
  x = x xor (x shl 13)
  x = x xor (x shr 17)
  x = x xor (x shl  5)
  x

proc digit*(s: uint32): uint32 {.exportc, cdecl, raises: [].} =
  ## 状態値を 0〜9 の数字に変換する
  s mod 10'u32

# ── バッファポインタ（JS が memory.buffer 経由でアクセスするため） ──
proc gridBufPtr*(): uint32 {.exportc, cdecl, raises: [].} =
  ## グリッドバッファ（100バイト）の WASM メモリ内オフセットを返す
  cast[uint32](addr gridBuf[0])

proc traceBufPtr*(): uint32 {.exportc, cdecl, raises: [].} =
  ## トレースバッファ（最大100バイト）の WASM メモリ内オフセットを返す
  cast[uint32](addr traceBuf[0])

# ── アワード読み出し ─────────────────────────────────────────────────
proc getAwardCount*(): uint32 {.exportc, cdecl, raises: [].} =
  awardCnt

proc getAwardPts*(i: uint32): int32 {.exportc, cdecl, raises: [].} =
  if i < awardCnt: awardPts[i] else: 0'i32

proc getAwardKey*(i: uint32): uint32 {.exportc, cdecl, raises: [].} =
  if i < awardCnt: awardKeys[i] else: 0'u32

# ── ヘルパー: アワード追加 ───────────────────────────────────────────
proc addAward(pts: int32, key: uint32, totalPts: var int32) {.inline.} =
  totalPts += pts
  if awardCnt < 16:
    awardPts[awardCnt]  = pts
    awardKeys[awardCnt] = key
    inc awardCnt

# ── 採点エンジン ─────────────────────────────────────────────────────
proc evalTrace*(traceLen: uint32): int32 {.exportc, cdecl, raises: [].} =
  ## traceBuf[0..traceLen-1] のセルインデックスを gridBuf で数字に変換し採点する。
  ## awardPts / awardKeys / awardCnt を更新し、合計得点を返す。
  ## 得点がなければ 0 を返す。
  awardCnt = 0
  if traceLen == 0: return 0

  # グリッドの数字をchar配列に変換（比較用）
  var seq: array[100, char]
  for i in 0 ..< traceLen.int:
    seq[i] = char(gridBuf[traceBuf[i].int].int + ord('0'))

  let seqLen  = traceLen.int
  let seqCstr = cast[cstring](addr seq[0])
  var total: int32 = 0

  # ── 1. 同じ数字の連続（3以上） ─────────────────────────────────────
  var i = 0
  while i < seqLen:
    var j = i + 1
    while j < seqLen and seq[j] == seq[i]: inc j
    let runLen = j - i
    if runLen >= 3:
      let key =
        if runLen <= 5: KEY_RUN_SMALL
        elif runLen <= 8: KEY_RUN_MEDIUM
        else: KEY_RUN_LARGE
      addAward(int32(runLen), key, total)
    i = j

  # ── 2. 数学定数（先頭から 3 文字以上一致） ─────────────────────────
  const constPairs = [
    (DIGITS_E,     KEY_E),
    (DIGITS_PI,    KEY_PI),
    (DIGITS_SQRT2, KEY_SQRT2),
    (DIGITS_PHI,   KEY_PHI),
    (DIGITS_CBRT2, KEY_CBRT2),
  ]
  for pair in constPairs:
    let digs    = cstring(pair[0])
    let digLen  = cstrLen(digs)
    var matchLen = 0
    let maxCheck = nimMin(seqLen, digLen)
    for k in 0 ..< maxCheck:
      if seq[k] == digs[k]: inc matchLen
      else: break
    if matchLen >= 3:
      addAward(int32(matchLen * 2), pair[1], total)

  # ── 3. チャンパーノウン数列（任意位置, 5文字以上） ─────────────────
  let champCstr = cstring(CHAMPERNOWNE)
  let champLen  = cstrLen(champCstr)
  let champMatch = longestCommonSubstring(seqCstr, seqLen, champCstr, champLen)
  if champMatch >= 5:
    addAward(int32(champMatch), KEY_CHAMP, total)

  # ── 4. 1145141919810（任意位置, 6文字以上） ────────────────────────
  let fumoCstr  = cstring(FUMO_SEQ)
  let fumoLen   = cstrLen(fumoCstr)
  let fumoMatch = longestCommonSubstring(seqCstr, seqLen, fumoCstr, fumoLen)
  if fumoMatch >= 6:
    addAward(int32(fumoMatch), KEY_FUMO, total)

  total
