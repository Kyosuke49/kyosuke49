;; babel.wat — バベルの司書 WebAssembly モジュール (テキスト形式)
;;
;; このファイルは babel.nim の WAT 等価実装です。
;; コンパイル: wat2wasm babel.wat -o babel.wasm
;;
;; メモリレイアウト (1ページ = 64KB):
;;   0x000 (  0): gridBuf  [100 × u8]  — グリッドの数字値 (0-9)
;;   0x064 (100): traceBuf [100 × u8]  — トレースのセルインデックス列
;;   0x0C8 (200): awardPts [16 × i32]  — 各アワードの得点
;;   0x108 (264): awardKey [16 × i32]  — 各アワードのキーインデックス
;;   0x148 (328): awardCnt [i32]
;;   0x14C (332): total    [i32]        — evalTrace 用作業領域
;;   0x150 (336): seqBuf   [100 × u8]  — 採点用数字 char バッファ
;;   0x200 (512): 定数文字列
;;
;; 定数オフセット:
;;   0x200: DIGITS_E     "2718281828459045" (16 bytes)
;;   0x211: DIGITS_PI    "3141592653589793" (16 bytes)
;;   0x222: DIGITS_SQRT2 "141421356"         ( 9 bytes)
;;   0x22C: DIGITS_PHI   "161803398"         ( 9 bytes)
;;   0x236: DIGITS_CBRT2 "12599210498"       (11 bytes)
;;   0x242: FUMO_SEQ     "1145141919810"     (13 bytes)
;;   0x250: CHAMPERNOWNE "012345..." (~502 bytes)

(module
  (memory (export "memory") 1)

  ;; ── 定数データ ───────────────────────────────────────────────────
  (data (i32.const 0x200) "2718281828459045")
  (data (i32.const 0x211) "3141592653589793")
  (data (i32.const 0x222) "141421356")
  (data (i32.const 0x22C) "161803398")
  (data (i32.const 0x236) "12599210498")
  (data (i32.const 0x242) "1145141919810")
  (data (i32.const 0x250) "012345678910111213")

  ;; ── RNG (xorshift32) ────────────────────────────────────────────

  (func (export "nextSeed") (param $s i32) (result i32)
    (local $x i32)
    local.get $s
    i32.const 0
    i32.eq
    if
      i32.const 2463534242
      local.set $x
    else
      local.get $s
      local.set $x
    end
    ;; x ^= x << 13
    local.get $x
    local.get $x
    i32.const 13
    i32.shl
    i32.xor
    local.set $x
    ;; x ^= x >> 17
    local.get $x
    local.get $x
    i32.const 17
    i32.shr_u
    i32.xor
    local.set $x
    ;; x ^= x << 5
    local.get $x
    local.get $x
    i32.const 5
    i32.shl
    i32.xor
  )

  (func (export "digit") (param $s i32) (result i32)
    local.get $s
    i32.const 10
    i32.rem_u
  )

  ;; ── バッファポインタ ─────────────────────────────────────────────

  (func (export "gridBufPtr") (result i32)  i32.const 0x000)
  (func (export "traceBufPtr") (result i32) i32.const 0x064)

  ;; ── アワード読み出し ─────────────────────────────────────────────

  (func (export "getAwardCount") (result i32)
    i32.const 0x148
    i32.load
  )

  (func (export "getAwardPts") (param $i i32) (result i32)
    i32.const 0x148
    i32.load          ;; awardCnt
    local.get $i
    i32.gt_u
    if (result i32)
      i32.const 0x0C8
      local.get $i
      i32.const 4
      i32.mul
      i32.add
      i32.load
    else
      i32.const 0
    end
  )

  (func (export "getAwardKey") (param $i i32) (result i32)
    i32.const 0x148
    i32.load          ;; awardCnt
    local.get $i
    i32.gt_u
    if (result i32)
      i32.const 0x108
      local.get $i
      i32.const 4
      i32.mul
      i32.add
      i32.load
    else
      i32.const 0
    end
  )

  ;; ── 内部: addAward(pts, key, totalAddr) ─────────────────────────
  ;; *totalAddr += pts; if awardCnt < 16: push award, awardCnt++
  (func $addAward (param $pts i32) (param $key i32) (param $totalAddr i32)
    (local $cnt i32)
    ;; *totalAddr += pts
    local.get $totalAddr
    local.get $totalAddr
    i32.load
    local.get $pts
    i32.add
    i32.store
    ;; cnt = awardCnt
    i32.const 0x148
    i32.load
    local.set $cnt
    ;; if cnt < 16
    local.get $cnt
    i32.const 16
    i32.lt_u
    if
      i32.const 0x0C8
      local.get $cnt
      i32.const 4
      i32.mul
      i32.add
      local.get $pts
      i32.store
      i32.const 0x108
      local.get $cnt
      i32.const 4
      i32.mul
      i32.add
      local.get $key
      i32.store
      i32.const 0x148
      local.get $cnt
      i32.const 1
      i32.add
      i32.store
    end
  )

  ;; ── 内部: lcs(sAddr, sLen, tAddr, tLen) -> i32 ──────────────────
  ;; 最長共通部分文字列の長さ
  (func $lcs (param $sA i32) (param $sL i32) (param $tA i32) (param $tL i32) (result i32)
    (local $max i32) (local $si i32) (local $ti i32) (local $L i32)
    i32.const 0
    local.set $max
    i32.const 0
    local.set $si
    block $bsi
      loop $lsi
        local.get $si
        local.get $sL
        i32.ge_u
        br_if $bsi
        i32.const 0
        local.set $ti
        block $bti
          loop $lti
            local.get $ti
            local.get $tL
            i32.ge_u
            br_if $bti
            i32.const 0
            local.set $L
            block $bL
              loop $lL
                ;; si+L < sL?
                local.get $si
                local.get $L
                i32.add
                local.get $sL
                i32.ge_u
                br_if $bL
                ;; ti+L < tL?
                local.get $ti
                local.get $L
                i32.add
                local.get $tL
                i32.ge_u
                br_if $bL
                ;; s[si+L] == t[ti+L]?
                local.get $sA
                local.get $si
                i32.add
                local.get $L
                i32.add
                i32.load8_u
                local.get $tA
                local.get $ti
                i32.add
                local.get $L
                i32.add
                i32.load8_u
                i32.ne
                br_if $bL
                local.get $L
                i32.const 1
                i32.add
                local.set $L
                br $lL
              end
            end
            ;; max = max(max, L)
            local.get $L
            local.get $max
            i32.gt_u
            if
              local.get $L
              local.set $max
            end
            local.get $ti
            i32.const 1
            i32.add
            local.set $ti
            br $lti
          end
        end
        local.get $si
        i32.const 1
        i32.add
        local.set $si
        br $lsi
      end
    end
    local.get $max
  )

  ;; ── 内部: prefixMatch(seqLen, constAddr, constLen) -> i32 ───────
  ;; seqBuf の先頭から constAddr と何文字一致するか返す
  (func $prefixMatch (param $seqLen i32) (param $cA i32) (param $cL i32) (result i32)
    (local $k i32) (local $mMax i32)
    i32.const 0
    local.set $k
    ;; mMax = min(seqLen, constLen)
    local.get $seqLen
    i32.const 0
    local.get $seqLen
    local.get $cL
    i32.gt_u
    select          ;; 0 if seqLen>cL else... wait, need min
    drop
    ;; Correct min: select(seqLen, cL, seqLen<cL)
    local.get $seqLen
    local.get $cL
    local.get $seqLen
    local.get $cL
    i32.lt_u
    select
    local.set $mMax
    block $brk
      loop $lp
        local.get $k
        local.get $mMax
        i32.ge_u
        br_if $brk
        ;; if seqBuf[k] != constAddr[k]: break
        i32.const 0x150
        local.get $k
        i32.add
        i32.load8_u
        local.get $cA
        local.get $k
        i32.add
        i32.load8_u
        i32.ne
        br_if $brk
        local.get $k
        i32.const 1
        i32.add
        local.set $k
        br $lp
      end
    end
    local.get $k
  )

  ;; ── 採点エンジン ─────────────────────────────────────────────────
  (func (export "evalTrace") (param $traceLen i32) (result i32)
    (local $i     i32)
    (local $j     i32)
    (local $k     i32)
    (local $runLen i32)
    (local $key    i32)
    (local $match  i32)

    ;; awardCnt = 0
    i32.const 0x148
    i32.const 0
    i32.store

    ;; if traceLen == 0: return 0
    local.get $traceLen
    i32.const 0
    i32.eq
    if
      i32.const 0
      return
    end

    ;; total (at 0x14C) = 0
    i32.const 0x14C
    i32.const 0
    i32.store

    ;; ── seqBuf を構築: seqBuf[i] = gridBuf[traceBuf[i]] + '0' ──
    i32.const 0
    local.set $i
    block $bseq
      loop $lseq
        local.get $i
        local.get $traceLen
        i32.ge_u
        br_if $bseq
        ;; addr of seqBuf[i]
        i32.const 0x150
        local.get $i
        i32.add
        ;; value: gridBuf[ traceBuf[i] ] + 0x30
        i32.const 0x064
        local.get $i
        i32.add
        i32.load8_u     ;; = traceBuf[i] = cell index (0-99)
        i32.load8_u     ;; = gridBuf[cellIndex] (gridBuf is at 0x000)
        i32.const 0x30
        i32.add
        ;; seqBuf[i] = value
        i32.store8
        local.get $i
        i32.const 1
        i32.add
        local.set $i
        br $lseq
      end
    end

    ;; ── 1. 同じ数字の連続（3以上） ─────────────────────────────────
    i32.const 0
    local.set $i
    block $brun
      loop $lrun
        local.get $i
        local.get $traceLen
        i32.ge_u
        br_if $brun
        ;; j = i + 1
        local.get $i
        i32.const 1
        i32.add
        local.set $j
        ;; while j < traceLen and seqBuf[j] == seqBuf[i]: j++
        block $brk_inner
          loop $lp_inner
            local.get $j
            local.get $traceLen
            i32.ge_u
            br_if $brk_inner
            i32.const 0x150
            local.get $j
            i32.add
            i32.load8_u
            i32.const 0x150
            local.get $i
            i32.add
            i32.load8_u
            i32.ne
            br_if $brk_inner
            local.get $j
            i32.const 1
            i32.add
            local.set $j
            br $lp_inner
          end
        end
        ;; runLen = j - i
        local.get $j
        local.get $i
        i32.sub
        local.set $runLen
        ;; if runLen >= 3: compute key, addAward
        local.get $runLen
        i32.const 3
        i32.ge_u
        if
          ;; key: 0=small(<=5), 1=medium(<=8), 2=large
          local.get $runLen
          i32.const 5
          i32.le_u
          if (result i32)
            i32.const 0
          else
            local.get $runLen
            i32.const 8
            i32.le_u
            if (result i32)
              i32.const 1
            else
              i32.const 2
            end
          end
          local.set $key
          local.get $runLen
          local.get $key
          i32.const 0x14C
          call $addAward
        end
        local.get $j
        local.set $i
        br $lrun
      end
    end

    ;; ── 2. 数学定数（先頭から 3 文字以上一致） ─────────────────────

    ;; E (addr=0x200, len=16, key=3)
    local.get $traceLen
    i32.const 0x200
    i32.const 16
    call $prefixMatch
    local.set $match
    local.get $match
    i32.const 3
    i32.ge_u
    if
      local.get $match
      i32.const 2
      i32.mul
      i32.const 3
      i32.const 0x14C
      call $addAward
    end

    ;; PI (addr=0x211, len=16, key=4)
    local.get $traceLen
    i32.const 0x211
    i32.const 16
    call $prefixMatch
    local.set $match
    local.get $match
    i32.const 3
    i32.ge_u
    if
      local.get $match
      i32.const 2
      i32.mul
      i32.const 4
      i32.const 0x14C
      call $addAward
    end

    ;; SQRT2 (addr=0x222, len=9, key=5)
    local.get $traceLen
    i32.const 0x222
    i32.const 9
    call $prefixMatch
    local.set $match
    local.get $match
    i32.const 3
    i32.ge_u
    if
      local.get $match
      i32.const 2
      i32.mul
      i32.const 5
      i32.const 0x14C
      call $addAward
    end

    ;; PHI (addr=0x22C, len=9, key=6)
    local.get $traceLen
    i32.const 0x22C
    i32.const 9
    call $prefixMatch
    local.set $match
    local.get $match
    i32.const 3
    i32.ge_u
    if
      local.get $match
      i32.const 2
      i32.mul
      i32.const 6
      i32.const 0x14C
      call $addAward
    end

    ;; CBRT2 (addr=0x236, len=11, key=7)
    local.get $traceLen
    i32.const 0x236
    i32.const 11
    call $prefixMatch
    local.set $match
    local.get $match
    i32.const 3
    i32.ge_u
    if
      local.get $match
      i32.const 2
      i32.mul
      i32.const 7
      i32.const 0x14C
      call $addAward
    end

    ;; ── 3. チャンパーノウン（任意位置, 5文字以上） ─────────────────
    i32.const 0x150
    local.get $traceLen
    i32.const 0x250
    i32.const 18
    call $lcs
    local.set $match
    local.get $match
    i32.const 5
    i32.ge_u
    if
      local.get $match
      i32.const 8
      i32.const 0x14C
      call $addAward
    end

    ;; ── 4. 1145141919810（任意位置, 6文字以上） ────────────────────
    i32.const 0x150
    local.get $traceLen
    i32.const 0x242
    i32.const 13
    call $lcs
    local.set $match
    local.get $match
    i32.const 6
    i32.ge_u
    if
      local.get $match
      i32.const 9
      i32.const 0x14C
      call $addAward
    end

    ;; ── 合計を返す ─────────────────────────────────────────────────
    i32.const 0x14C
    i32.load
  )
)
