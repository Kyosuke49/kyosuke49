# omikuji.nim — WebAssembly source
#
# Exports a single function:
#   draw(seed: uint32) -> uint32
# Returns a fortune index in [0, 6], uniformly at random.
# Uses xorshift32 — no heap allocation, no runtime dependency.
#
# Compile: see .github/workflows/compile-omikuji.yml

proc draw*(seed: uint32): uint32 {.exportc, cdecl, raises: [].} =
  ## xorshift32 PRNG  (period 2^32 - 1)
  ## Maps uniformly to one of 7 fortune tiers (0 = 大吉 … 6 = 大凶).
  var s: uint32 = if seed == 0'u32: 2463534242'u32 else: seed
  s = s xor (s shl 13)
  s = s xor (s shr 17)
  s = s xor (s shl 5)
  return s mod 7'u32