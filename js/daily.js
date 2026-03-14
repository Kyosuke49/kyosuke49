// 自動生成: DailyData.java
// 日替わりメッセージデータ

const dailyByDate = {
  '01-01': `<p class="font-kazesawa-light">年の最初。<br>今年はどんな一年になるかな</p>`,
  '01-07': `<p class="font-kazesawa-light">この日替わり機能が<br>実装された日です。</p>`,
  '02-14': `<p class="font-fraktur">男同士で贈る友チョコは、<br>一般的にホモチョコと呼ばれる。</p>`,
  '03-14': `<p class="font-kazesawa-light">円周率の日。<br>3.14159265...</p>`,
  '04-01': `<p class="font-geosans">April Fools' Day.<br>競介実は女。</p>`,
  '05-05': `<p class="font-kazesawa-light">競介は生まれた時から競介なので<br>子ども時代とか存在しません。</p>`,
  '06-21': `<p class="font-kazesawa-light">夏至。<br>なんか響きがおもろい。</p>`,
  '07-07': `<p class="font-kurrent">Tanabata.<br>棚からバター。</p>`,
  '10-31': `<p class="font-fraktur">Halloween.<br>仮装とかしちゃう感じ？</p>`,
  '11-11': `<p class="font-geosans">11:11:11<br>ポッキー！！</p>`,
  '12-25': `<p class="font-fraktur">Weihnachten.<br>プレゼント貰えると良いね</p>`,
  '12-31': `<p class="font-kazesawa-light">年の最後。<br>また来年。</p>`,
};

const specialConditions = [
  {
    name: 'friday-13',
    check: (d) => d.getDay() === 5 && d.getDate() === 13,
    html: `<p class="font-fraktur">Freitag, der 13.<br>何も起きない。</p>`
  },
  {
    name: '0222',
    check: (d) => d.getHours() === 2 && d.getMinutes() === 22,
    html: `<p class="font-suetter">02:22<br>誰も見ていない時間。</p>`
  },
  {
    name: 'midnight',
    check: (d) => d.getHours() === 0 && d.getMinutes() === 0,
    html: `<p class="font-kazesawa-light">00:00<br>今日と明日の境界線。</p>`
  },
  {
    name: 'leap-second',
    check: (d) => {
      const m = d.getMonth() + 1, day = d.getDate(), h = d.getHours(), min = d.getMinutes();
      return ((m === 6 && day === 30) || (m === 12 && day === 31)) && h === 23 && min === 59;
    },
    html: `<p class="font-geosans">閏秒。<br>時間が一瞬だけ余る。</p>`
  },
];
