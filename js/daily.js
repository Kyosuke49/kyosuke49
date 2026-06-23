// 自動生成: DailyData.java
// 日替わりメッセージデータ
// 多言語対応: 値がオブジェクト { ja, de, fi } の場合は言語切替に連動
// 文字列のままの場合は言語に関係なくそのまま表示（日本語専用エントリ用）

const dailyByDate = {

  // --- 多言語対応エントリ ---

  '01-01': {
    ja: `<p class="font-kazesawa-light">今年もZONeを飲みまくる一年にしたい</p>`,
    de: `<p class="font-kazesawa-light">今年もZONeを飲みまくる一年にしたい</p>`,
    fi: `<p class="font-kazesawa-light">今年もZONeを飲みまくる一年にしたい</p>`,
  },

  '01-07': {
    ja: `<p class="font-kazesawa-light">この日替わりメッセージ表示機能が実装された日です。</p>`,
    de: `<p class="font-kazesawa-light">この日替わりメッセージ表示機能が実装された日です。</p>`,
    fi: `<p class="font-kazesawa-light">この日替わりメッセージ表示機能が実装された日です。</p>`,
  },

  '02-15': {
    ja: `<p class="font-kazesawa-light">男同士で贈る友チョコは、<br>一般的にホモチョコと呼ばれる。</p>`,
    de: `<p class="font-kazesawa-light">男同士で贈る友チョコは、<br>一般的にホモチョコと呼ばれる。</p>`,
    fi: `<p class="font-kazesawa-light">男同士で贈る友チョコは、<br>一般的にホモチョコと呼ばれる。</p>`,
  },

  '03-14': {
    ja: `<p class="font-kazesawa-light">おっπ</p>`,
    de: `<p class="font-kazesawa-light">おっπ</p>`,
    fi: `<p class="font-kazesawa-light">おっπ</p>`,
  },

  '04-01': {
    ja: `<p class="font-geosans">競介実は女</p>`,
    de: `<p class="font-geosans">競介実は女</p>`,
    fi: `<p class="font-geosans">競介実は女</p>`,
  },

  '05-05': {
    ja: `<p class="font-geosans">競介は生まれた時から競介なので<br>子ども時代とか存在しません。</p>`,
    de: `<p class="font-geosans">競介は生まれた時から競介なので<br>子ども時代とか存在しません。</p>`,
    fi: `<p class="font-geosans">競介は生まれた時から競介なので<br>子ども時代とか存在しません。</p>`,

  },

  '06-21': {
    ja: `<p class="font-kazesawa-light">夏至とGeschichteで踏む韻</p>`,
    de: `<p class="font-kazesawa-light">夏至とGeschichteで踏む韻</p>`,
    fi: `<p class="font-kazesawa-light">夏至とGeschichteで踏む韻</p>`,
  },

  '06-23': {
    ja: `<p class="font-kazesawa-light">クソ雑アプデ！</p>`,
    de: `<p class="font-kazesawa-light">クソ雑アプデ！</p>`,
    fi: `<p class="font-kazesawa-light">クソ雑アプデ！</p>`,
  },

  '07-07': {
    ja: `<p class="font-kurrent">天の川が大氾濫してほしいお年頃です。</p>`,
    de: `<p class="font-kurrent">天の川が大氾濫してほしいお年頃です。</p>`,
    fi: `<p class="font-kurrent">天の川が大氾濫してほしいお年頃です。</p>`,
  },

  '10-31': {
    ja: `<p class="font-fraktur">今年も鍋被ろっかな</p>`,
    de: `<p class="font-fraktur">今年も鍋被ろっかな</p>`,
    fi: `<p class="font-fraktur">今年も鍋被ろっかな</p>`,
  },

  '11-11': {
    ja: `<p class="font-kazesawa-light">何がシェアハピだよふざけんなカスが</p>`,
    de: `<p class="font-kazesawa-light">何がシェアハピだよふざけんなカスが</p>`,
    fi: `<p class="font-kazesawa-light">何がシェアハピだよふざけんなカスが</p>`,
  },

  '12-25': {
    ja: `<p class="font-fraktur">クリスマスが…今年も、やってくる…！</p>`,
    de: `<p class="font-fraktur">クリスマスが…今年も、やってくる…！</p>`,
    fi: `<p class="font-fraktur">クリスマスが…今年も、やってくる…！</p>`,
  },

  '12-31': {
    ja: `<p class="font-kazesawa-light">良い一年になったかい？</p>`,
    de: `<p class="font-kazesawa-light">良い一年になったかい？</p>`,
    fi: `<p class="font-kazesawa-light">良い一年になったかい？</p>`,
  },

};

const specialConditions = [
  {
    name: 'friday-13',
    check: (d) => d.getDay() === 5 && d.getDate() === 13,
    html: {
      ja: `<p class="font-kazesawa-light">何かやばい物体がこちらに迫ってくる！</p>`,
      de: `<p class="font-kazesawa-light">何かやばい物体がこちらに迫ってくる！</p>`,
      fi: `<p class="font-kazesawa-light">何かやばい物体がこちらに迫ってくる！</p>`,
    }
  },
  {
    name: '0222',
    check: (d) => d.getHours() === 2 && d.getMinutes() === 22,
    html: {
      ja: `<p class="font-kazesawa-light">何も起きないにぎ。</p>`,
      de: `<p class="font-kazesawa-light">何も起きないにぎ。</p>`,
      fi: `<p class="font-kazesawa-light">何も起きないにぎ。</p>`,
    }
  },
  {
    name: 'midnight',
    check: (d) => d.getHours() === 0 && d.getMinutes() === 0,
    html: {
      ja: `<p class="font-kazesawa-light">日付が変わる瞬間ジャンプ！！</p>`,
      de: `<p class="font-kazesawa-light">日付が変わる瞬間ジャンプ！！</p>`,
      fi: `<p class="font-kazesawa-light">日付が変わる瞬間ジャンプ！！</p>`,
    }
  },
  {
    name: 'leap-second',
    check: (d) => {
      const m = d.getMonth() + 1, day = d.getDate(), h = d.getHours(), min = d.getMinutes();
      return ((m === 6 && day === 30) || (m === 12 && day === 31)) && h === 23 && min === 59;
    },
    html: {
      ja: `<p class="font-geosans">ん？なんか今1秒長くなかった？</p>`,
      de: `<p class="font-geosans">ん？なんか今1秒長くなかった？</p>`,
      fi: `<p class="font-geosans">ん？なんか今1秒長くなかった？</p>`,
    }
  },
];
