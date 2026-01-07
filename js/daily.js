const dailyByDate = {
  '01-01': `
    <p class="font-kazesawa-light">
      年の最初。<br>
      紙はまだ白い。
    </p>
  `,
  '01-07': `
    <p class="font-kazesawa-light">
      この日替わり文字列の機能が<br>
           実装された日です。
    </p>
  `,
  // 以下延々と追加
};

const specialConditions = [
  {
    name: 'leap-second',
    check: (date) => {
      // 実際の閏秒はJSでは直接検出不可なので「擬似条件」
      // 例：6/30 or 12/31 の 23:59
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const h = date.getHours();
      const min = date.getMinutes();
      return (
        (m === 6 && d === 30 || m === 12 && d === 31) &&
        h === 23 && min === 59
      );
    },
    html: `
      <p class="font-geosans">
        閏秒。<br>
        時間が一瞬だけ余る。
      </p>
    `
  },

  {
    name: 'friday-13',
    check: (date) => {
      return date.getDay() === 5 && date.getDate() === 13;
    },
    html: `
      <p class="font-fraktur">
        Freitag, der 13.<br>
        何も起きない。
      </p>
    `
  },

  {
    name: '0222',
    check: (date) => {
      return date.getHours() === 2 && date.getMinutes() === 22;
    },
    html: `
      <p class="font-suetter">
        02:22<br>
        誰も見ていない時間。
      </p>
    `
  }
];
