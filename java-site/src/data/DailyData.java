package site.data;

/**
 * 日替わりメッセージのデータと、それを使うJavaScriptコードを管理するクラス。
 * 日替わりメッセージを追加・編集したい場合はこのクラスを変更してください。
 *
 * 日付のキーは "MM-DD" 形式（例: "01-01" = 1月1日）。
 * フォントクラス: font-kazesawa / font-kazesawa-light / font-fraktur / font-kurrent / font-geosans / font-suetter
 */
public class DailyData {

    public static String getJavaScript() {
        return """
// 自動生成: DailyData.java
// 日替わりメッセージデータ

const dailyByDate = {
  '01-01': `<p class="font-kazesawa-light">年の最初。<br>紙はまだ白い。</p>`,
  '01-07': `<p class="font-kazesawa-light">この日替わり機能が<br>実装された日です。</p>`,
  '02-14': `<p class="font-fraktur">Valentinstag.<br>チョコレートは好きです。</p>`,
  '03-14': `<p class="font-kazesawa-light">円周率の日。<br>3.14159265...</p>`,
  '04-01': `<p class="font-geosans">April Fools' Day.<br>何も信じない日。</p>`,
  '05-05': `<p class="font-kazesawa-light">こどもの日。<br>子どもだった頃を思い出す。</p>`,
  '06-21': `<p class="font-kazesawa-light">夏至。<br>一年で最も長い昼。</p>`,
  '07-07': `<p class="font-kurrent">Tanabata.<br>彦星と織姫。</p>`,
  '10-31': `<p class="font-fraktur">Halloween.<br>仮装は苦手です。</p>`,
  '11-11': `<p class="font-geosans">11:11:11<br>数字が並ぶ日。</p>`,
  '12-25': `<p class="font-fraktur">Weihnachten.<br>良い夜を。</p>`,
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

/**
 * 日替わりメッセージを dateInfo 要素に表示する。
 * setLang() からも呼ばれる。
 */
function loadDailyItem() {
  const el = document.getElementById('dateInfo');
  if (!el) return;

  const now = new Date();

  for (const cond of specialConditions) {
    if (cond.check(now)) {
      el.innerHTML = cond.html;
      return;
    }
  }

  const key = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  if (dailyByDate[key]) {
    el.innerHTML = dailyByDate[key];
    return;
  }

  el.innerHTML = `<p class="font-kazesawa-light">(´・ω・｀)</p>`;
}
""";
    }
}
