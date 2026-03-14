# おみくじ (Omikuji) — Nim implementation
# 運勢をランダムに引く。seed に現在時刻のミリ秒を渡す。

type
  Fortune = object
    rank:   string
    desc:   string
    love:   string
    work:   string
    health: string
    lucky:  string

proc makeFortune(rank, desc, love, work, health, lucky: string): Fortune =
  Fortune(rank: rank, desc: desc, love: love,
          work: work, health: health, lucky: lucky)

const fortunes: array[7, Fortune] = [
  makeFortune("大吉", "運勢最高。何事にも挑戦すべし。",
    "君はモテモテ", "何をやっても上手く行く", "逆上がりも余裕で3回転", "赤"),
  makeFortune("中吉", "大体良いと思う",
    "告られるかも", "大体の努力が実を結ぶ", "風邪ひかなさそう", "青"),
  makeFortune("小吉", "悪くはない",
    "友達できるかも", "努力を怠るべからず", "ZONe飲んでおこう", "黄"),
  makeFortune("吉",   "当たり前を享受すべし",
    "誠実さが大事", "石の上にもなんとやら", "早寝早起き大事", "緑"),
  makeFortune("末吉", "最近調子乗ってない？",
    "会話に変な間とか入る", "あせらずいつも通りに", "禁煙しとく？", "白"),
  makeFortune("凶",   "踏ん張りどころだね",
    "浮気とかした？", "横着すんなよ", "人間ドック行っとこう", "灰"),
  makeFortune("大凶", "やばいよこれ",
    "刺されそう", "石橋を叩きまくれ", "血とか吐くかも", "紫"),
]

# 出現率 (合計100): 大吉30 中吉20 小吉15 吉15 末吉10 凶7 大凶3
const weights: array[7, int] = [30, 20, 15, 15, 10, 7, 3]

proc drawOmikuji*(seed: int): Fortune =
  let roll = seed mod 100
  var cumulative = 0
  for i in 0 ..< weights.len:
    cumulative += weights[i]
    if roll < cumulative:
      return fortunes[i]
  return fortunes[6]

when defined(js):
  import std/jsffi

  proc jsDrawOmikuji*(seed: int): JsObject {.exportc.} =
    let f = drawOmikuji(seed)
    let obj = newJsObject()
    obj["rank"]   = f.rank.toJs
    obj["desc"]   = f.desc.toJs
    obj["love"]   = f.love.toJs
    obj["work"]   = f.work.toJs
    obj["health"] = f.health.toJs
    obj["lucky"]  = f.lucky.toJs
    return obj
