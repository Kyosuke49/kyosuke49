package site;

/**
 * 各ページのHTMLを生成するクラス。
 * 現行サイト (java-site/docs/) の内容・機能をそのまま維持します。
 *
 * 【JS中のバックスラッシュについて】
 *   Javaテキストブロック内では \\d, \\s, \\n, \\t 等と書くと
 *   出力ファイルには \d, \s, \n, \t として出力されます。
 */
public class Pages {

    // =========================================================
    //  トップページ (docs/index.html)
    // =========================================================
    public static String indexPage() {
        return """
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>偽造切手</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
  <div class="container">
    <h1 class="site-title" data-lang="ja">偽造切手</h1>
    <h1 class="site-title" data-lang="de">LOS 49</h1>
    <h1 class="site-title" data-lang="fi">ERÄ 49</h1>
    <div class="lang-switch">
      <button onclick="setLang('ja')">日本語</button>
      <button onclick="setLang('de')">Deutsch</button>
      <button onclick="setLang('fi')">Suomi</button>
    </div>
  </div>
  </header>

  <div class="page-layout">

  <!-- 左：本文 + ナビ -->
  <div class="page-left">

    <section class="lang-section" data-lang="ja">
      <h2 class="font-kazesawa-bold section-label">概要</h2>
      <p class="font-kazesawa-light">ここは競介の個人サイトです。</p>
      <p class="font-kazesawa-light">作品や文章、音楽などを置いていく予定です。</p>
    </section>

    <section class="lang-section" data-lang="de">
      <h2 class="font-fraktur section-label">Überblick</h2>
      <p>Dies ist Kyosukes persönliche Website.</p>
      <p>Hier sammle ich Texte, Bilder und Musik.</p>
    </section>

    <section class="lang-section" data-lang="fi">
      <h2 class="section-label" style="font-family: system-ui;">Yleiskuva</h2>
      <p>Tämä on Kyosuken henkilökohtainen sivusto.</p>
      <p>Tänne kerään tekstejä, kuvia ja musiikkia.</p>
    </section>

    <section class="nav-section">
      <h2 class="section-label font-geosans">Contents</h2>
      <ul class="contents-list font-kazesawa">
        <li><a href="art/index.html">絵置き場 / Art</a></li>
        <li><a href="music/index.html">曲置き場 / Music</a></li>
        <li><a href="text/index.html">字置き場 / Text</a></li>
        <li><a href="diary/index.html">独り言 / Diary</a></li>
        <li><a href="pastime/index.html">暇つぶし</a></li>
      </ul>
    </section>

    <footer class="site-footer-top font-geosans">
      <p>© Kyosuke49 &mdash; 偽造切手 / LOS 49 / ERÄ 49</p>
      <p><a href="https://x.com/ningaesst?s=21">X (Twitter)</a></p>
    </footer>

  </div>

  <!-- 右：情報ウィンドウ -->
  <aside class="info-window">

    <div class="info-block info-date">
      <p class="info-label font-geosans">Daily</p>
      <div id="dateInfo" class="info-content"></div>
    </div>

    <div class="info-block info-topic">
      <p class="info-label font-geosans">Topic</p>
      <p id="topicInfo" class="info-content font-kazesawa-light"></p>
    </div>

    <div class="info-block info-random">
      <p class="info-label font-geosans">—</p>
      <p id="randomText" class="info-content font-kazesawa-light"></p>
    </div>

    <div class="info-block info-time">
      <p class="info-label font-geosans">Time / JD</p>
      <p id="timeInfo" class="info-content font-geosans"></p>
    </div>

  </aside>

</div>

<script src="js/daily.js"></script>
<script>
const timeZones = {
  ja: 'Asia/Tokyo',
  de: 'Europe/Berlin',
  fi: 'Europe/Helsinki'
};

const topics = {
  ja: '特になし',
  de: 'Gedanken über Papier und Tinte',
  fi: 'Ajatuksia paperista ja musteesta'
};

const randomTexts = [
  'ピンチョンを読みなさい',
  '( ﾟ∀ﾟ)o彡°',
  'ここの文章毎回違うんやで',
  '啜るー！',
  'Arcaeaの彩夢ちゃんかわいくね？',
  '競介は純日本人です',
  'Juhu! Wir treffen uns schon wieder!',
  'Meine Lieblingszahl ist 29!',
  'Was machst du eigentlich hier?',
  'Hallo, ich bin Hatsune Miku.',
  'Lies einen Roman von Pynchon',
  'Trink doch ZONe.',
  '君は右翼すぎて左翼になっている',
  'Saatko tarpeeksi auringonvaloa?',
  'Haluan lopettaa tupakoinnin',
  'Pidän Fis-molliasteikosta',
  'Japanin X on kaoottinen paikka',
  'Haluan tehdä persiljahilloa',
  'Anzeigechance etwa 5%.\\nSie haben Glück!'
];

let currentLang = 'ja';

function julianDate(date) {
  return (date / 86400000 + 2440587.5).toFixed(5);
}

function updateInfo(lang) {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('ja', {
    timeZone: timeZones[lang],
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById('timeInfo').innerHTML =
    'JD ' + julianDate(now) + '<br>' + formatter.format(now);
  document.getElementById('topicInfo').textContent = topics[lang];
}

function setRandomText() {
  const t = randomTexts[Math.floor(Math.random() * randomTexts.length)];
  document.getElementById('randomText').textContent = t;
}

function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-lang]').forEach(el => {
    el.style.display = el.dataset.lang === lang ? '' : 'none';
  });
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === ({ja:'日本語',de:'Deutsch',fi:'Suomi'}[lang]));
  });
  updateInfo(lang);
  loadDailyItem();
}

document.addEventListener('DOMContentLoaded', () => {
  setRandomText();
  setLang('ja');
  setInterval(() => {
    updateInfo(currentLang);
    loadDailyItem();
  }, 1000);
});
</script>
</body>
</html>
""";
    }

    // =========================================================
    //  絵置き場 (docs/art/index.html)
    // =========================================================
    public static String artPage() {
        return """
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>絵置き場 — 偽造切手</title>
  <link rel="stylesheet" href="../style.css">
  <style>
    .art-gallery {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
      margin: 1.5rem 0 2rem;
    }
    @media (max-width: 580px) {
      .art-gallery { grid-template-columns: 1fr; gap: 2.5rem; }
    }
    .art-card {
      border: 1px solid var(--border);
      background: var(--white);
      display: flex;
      flex-direction: column;
    }
    .art-card-img-wrap {
      overflow: hidden;
      background: #ebebeb;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 140px;
    }
    .art-card-img-wrap img {
      width: 100%;
      height: auto;
      max-height: 380px;
      object-fit: contain;
      display: block;
      transition: opacity 0.22s ease;
    }
    .art-card-img-wrap img:hover { opacity: 0.88; }
    .art-card-info {
      padding: 1.1rem 1.3rem 1.3rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .art-card-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.5rem;
    }
    .art-card-title {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 400;
      font-size: 1rem;
      letter-spacing: 0.06em;
      color: var(--fg);
      margin: 0;
    }
    .art-card-date {
      font-family: 'Geosans', sans-serif;
      font-size: 0.68rem;
      letter-spacing: 0.14em;
      color: var(--muted);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .art-card-desc {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 300;
      font-size: 0.855rem;
      color: var(--muted);
      line-height: 1.75;
      margin: 0;
    }
    .art-card-footer {
      margin-top: auto;
      padding-top: 0.8rem;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .art-tag {
      display: inline-block;
      font-family: 'Geosans', sans-serif;
      font-size: 0.62rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
      border: 1px solid var(--border);
      padding: 0.18rem 0.55rem;
    }
    .art-empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 0;
      color: var(--muted);
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 300;
      font-size: 0.9rem;
      letter-spacing: 0.08em;
    }
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 1rem 0 1.8rem;
    }
    .pagination-btn {
      background: none;
      border: 1px solid var(--border);
      padding: 0.38rem 1rem;
      cursor: pointer;
      color: var(--fg);
      font-family: 'Geosans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .pagination-btn:hover:not(:disabled) {
      background: var(--black);
      color: var(--white);
      border-color: var(--black);
    }
    .pagination-btn:disabled { opacity: 0.28; cursor: default; }
    .pagination-nums { display: flex; gap: 0.3rem; }
    .pagination-num {
      background: none;
      border: 1px solid transparent;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-family: 'Geosans', sans-serif;
      font-size: 0.8rem;
      letter-spacing: 0.06em;
      color: var(--muted);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .pagination-num:hover { color: var(--fg); border-color: var(--border); }
    .pagination-num.active {
      background: var(--black);
      color: var(--white);
      border-color: var(--black);
    }
  </style>
</head>
<body>
  <div id="shared-header"></div>
  <div class="container">
    <main class="sub-main">
      <h1 class="page-title font-kazesawa" id="art-page-title">絵置き場</h1>
      <div id="pagination-top" class="pagination"></div>
      <div id="art-gallery"   class="art-gallery"></div>
      <div id="pagination-bot" class="pagination"></div>
    </main>
    <div id="shared-footer"></div>
  </div>
  <script src="../shared-nav.js"></script>
<script>
/* ====================================================
   作品データ
   新しい作品を追加するには配列の先頭に追記してください。
   date: ISO形式 "YYYY-MM-DD"（新しい順に自動ソート）
   title / desc / medium は { ja, de, fi } 形式で多言語対応。
==================================================== */
const ARTWORKS = [
  {
    file: 'EDMOND.JPG',
    date: '2026-05-25',
    title:  { ja: 'エドモンド',           de: 'EDMOND!',  fi: 'EDMOND!' },
    desc:   { ja: '愛してるぞエドモンド！！', de: 'ICH LIEBE DICH, EDMOND!', fi: 'RAKASTAN SINUA, EDMOND!' },
    medium: { ja: 'JPG', de: 'JPG', fi: 'JPG' }
  },
  {
    file: 'edmond.png',
    date: '2026-05-18',
    title:  { ja: '前クソ8周年！', de: 'Edmond', fi: 'Edmond' },
    desc:   { ja: '最近はずっとⅣのアプデを待ってます。',
              de: 'Das ist Edmond. Er ist ein Charakter aus einem Spiel, das ich mag. Du solltest Edmond auch mögen.',
              fi: 'Tämä on Edmond. Hän on hahmo pelistä, josta pidän. Sinunkin pitäisi pitää Edmondista.' },
    medium: { ja: 'PNG', de: 'PNG', fi: 'PNG' }
  },
  {
    file: 'makomo.png',
    date: '2025-12-31',
    title:  { ja: 'マコモ湯の人',
              de: 'Eine in Japan bekannte Liebhaberin von Badezimmern.',
              fi: 'Japanissa tunnettu naispuolinen kylpyhuoneharrastaja.' },
    desc:   { ja: 'お風呂ガンジス川やんけ！',
              de: 'Sie ist dafür bekannt, dass sie das Wasser in der Badewanne, in der sie täglich badet, überhaupt nicht wechselt.',
              fi: 'Hän on tunnettu siitä, ettei vaihda lainkaan vettä kylpyammeessa, jossa hän kylpee päivittäin.' },
    medium: { ja: 'PNG', de: 'PNG', fi: 'PNG' }
  },
  {
    file: 'Juho.png',
    date: '2025-12-31',
    title:  { ja: 'フィンランドのやばい議員', de: 'Juho Eerola', fi: 'Juho Eerola' },
    desc:   { ja: 'なんだこいつ', de: 'Wer ist das denn', fi: 'Minä olen Sarah!' },
    medium: { ja: 'PNG', de: 'PNG', fi: 'PNG' }
  },
  {
    file: 'Takesima.jpg',
    date: '2025-11-10',
    title:  { ja: 'ありえないあいだみつを', de: 'Avantgardistische Typografie', fi: 'Avantgardistinen typografia' },
    desc:   { ja: '絵って言っていいんかこれ',
              de: 'Was auch immer andere sagen mögen, das hier ist Kunst.',
              fi: 'Mitä muut sitten sanovatkin, tämä on taidetta.' },
    medium: { ja: 'JPG', de: 'JPG', fi: 'JPG' }
  },
  {
    file: 'Lethe.jpg',
    date: '2025-10-12',
    title:  { ja: 'レーテー', de: 'Lethe', fi: 'Lethe' },
    desc:   { ja: '一時期アイコンにしてたやつ', de: 'Lethe.', fi: 'Lethe.' },
    medium: { ja: 'JPG', de: 'JPG', fi: 'JPG' }
  },
  {
    file: 'Chikawa.jpg',
    date: '2025-09-21',
    title:  { ja: 'ちいかわ', de: 'Chikawa', fi: 'Chikawa' },
    desc:   { ja: 'ちいかわですが何か？',
              de: 'Dieser Charakter heißt Chikawa. Merkt euch das bitte.',
              fi: 'Tämän hahmon nimi on Chikawa. Muistakaa se.' },
    medium: { ja: 'JPG', de: 'JPG', fi: 'JPG' }
  },
  {
    file: 'makina.jpg',
    date: '2025-07-13',
    title:  { ja: 'マキナ',    de: 'Makina', fi: 'Makina' },
    desc:   { ja: '冲永蒔那です。', de: 'Sie heißt Makina.', fi: 'Hän on Makina.' },
    medium: { ja: 'JPG', de: 'JPG', fi: 'JPG' }
  }
];

/* ====================================================
   UI文字列（言語ごと）
==================================================== */
const UI = {
  ja: { pageTitle: '絵置き場', prev: '← 前へ', next: '次へ →', empty: '作品はまだありません' },
  de: { pageTitle: 'Bilder',   prev: '← Zurück', next: 'Weiter →', empty: 'Noch keine Werke' },
  fi: { pageTitle: 'Kuvat',    prev: '← Edellinen', next: 'Seuraava →', empty: 'Ei teoksia vielä' }
};

const PER_PAGE = 4;
ARTWORKS.sort((a, b) => b.date.localeCompare(a.date));

let lang = localStorage.getItem('lang') || 'ja';
let currentPage = 1;

function t(obj) {
  if (!obj) return '';
  return obj[lang] || obj['ja'] || '';
}
function ui(key) {
  return (UI[lang] || UI['ja'])[key] || '';
}
function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  if (lang === 'de' || lang === 'fi') {
    return `${parseInt(d)}.${parseInt(m)}.${y}`;
  }
  return `${y}.${m}.${d}`;
}
function getPageFromHash() {
  const m = location.hash.match(/^#p(\\d+)$/);
  return m ? Math.max(1, parseInt(m[1])) : 1;
}
function setPageHash(n) {
  history.pushState(null, '', n > 1 ? '#p' + n : location.pathname + location.search);
}

function renderAll() {
  document.getElementById('art-page-title').textContent = ui('pageTitle');
  document.title = ui('pageTitle') + ' — 偽造切手';
  const total = ARTWORKS.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const items = ARTWORKS.slice(start, start + PER_PAGE);
  const gallery = document.getElementById('art-gallery');
  if (items.length === 0) {
    gallery.innerHTML = `<p class="art-empty">${ui('empty')}</p>`;
  } else {
    gallery.innerHTML = items.map(art => {
      const dateStr = formatDate(art.date);
      const desc    = t(art.desc);
      const medium  = t(art.medium);
      return (
        `<div class="art-card">` +
          `<div class="art-card-img-wrap">` +
            `<img src="${art.file}" alt="${t(art.title)}" loading="lazy">` +
          `</div>` +
          `<div class="art-card-info">` +
            `<div class="art-card-header">` +
              `<h2 class="art-card-title">${t(art.title)}</h2>` +
              `<time class="art-card-date" datetime="${art.date}">${dateStr}</time>` +
            `</div>` +
            (desc ? `<p class="art-card-desc">${desc}</p>` : '') +
            (medium ? `<div class="art-card-footer"><span class="art-tag">${medium}</span></div>` : '') +
          `</div>` +
        `</div>`
      );
    }).join('');
  }
  renderPagination('pagination-top', totalPages);
  renderPagination('pagination-bot', totalPages);
}

function renderPagination(id, totalPages) {
  const el = document.getElementById(id);
  if (totalPages <= 1) { el.innerHTML = ''; return; }
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  let nums = '';
  for (let i = 1; i <= totalPages; i++) {
    nums += `<button class="pagination-num${i === currentPage ? ' active' : ''}"
      onclick="goPage(${i})">${i}</button>`;
  }
  el.innerHTML =
    `<button class="pagination-btn" ${prevDisabled ? 'disabled' : ''}
      onclick="goPage(${currentPage - 1})">${ui('prev')}</button>` +
    `<div class="pagination-nums">${nums}</div>` +
    `<button class="pagination-btn" ${nextDisabled ? 'disabled' : ''}
      onclick="goPage(${currentPage + 1})">${ui('next')}</button>`;
}

function goPage(n) {
  currentPage = n;
  setPageHash(n);
  renderAll();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

(function () {
  const _orig = window.setLang;
  window.setLang = function (l) {
    lang = l;
    if (_orig) _orig(l);
    renderAll();
  };
})();

window.addEventListener('hashchange', function () {
  currentPage = getPageFromHash();
  renderAll();
});

currentPage = getPageFromHash();
renderAll();
</script>
</body>
</html>
""";
    }

    // =========================================================
    //  曲置き場 (docs/music/index.html)
    // =========================================================
    public static String musicPage() {
        return """
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>曲置き場 — 偽造切手</title>
  <link rel="stylesheet" href="../style.css">
  <style>
    .music-list {
      display: flex;
      flex-direction: column;
      gap: 2.2rem;
      margin: 1rem 0 2rem;
    }
    .track-card {
      border: 1px solid var(--border);
      background: var(--white);
      overflow: hidden;
    }
    .player-media {
      background: #111;
      line-height: 0;
      position: relative;
    }
    .player-media-inner {
      width: 100%;
      aspect-ratio: 16 / 9;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .player-jacket {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }
    .player-jacket-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(145deg, #0e0e0e, #1c1c1c);
    }
    .player-note {
      font-size: 4.5rem;
      color: rgba(255, 255, 255, 0.07);
      user-select: none;
      font-family: serif;
      line-height: 1;
    }
    .player-video {
      width: 100%;
      display: block;
    }
    .player-controls {
      background: #0d0d0d;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.55rem 0.9rem;
      border-top: 1px solid #1e1e1e;
    }
    .player-play-btn {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .player-play-btn:hover { background: rgba(255, 255, 255, 0.12); }
    .player-seek-wrap {
      flex: 1;
      padding: 0.6rem 0;
      cursor: pointer;
    }
    .player-seek-track {
      height: 3px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      position: relative;
      transition: height 0.12s;
    }
    .player-seek-wrap:hover .player-seek-track,
    .player-seek-wrap.dragging .player-seek-track { height: 5px; }
    .player-fill {
      position: absolute;
      top: 0; left: 0; bottom: 0;
      width: 0%;
      background: #ffffff;
      border-radius: 2px;
      pointer-events: none;
    }
    .player-thumb {
      position: absolute;
      top: 50%;
      left: 0%;
      width: 13px;
      height: 13px;
      background: #ffffff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.12s;
    }
    .player-seek-wrap:hover .player-thumb,
    .player-seek-wrap.dragging .player-thumb { opacity: 1; }
    .player-time {
      font-family: 'Geosans', sans-serif;
      font-size: 0.7rem;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.55);
      white-space: nowrap;
      flex-shrink: 0;
      min-width: 7rem;
      text-align: right;
    }
    .track-info {
      padding: 1rem 1.2rem 1.2rem;
    }
    .track-info-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.6rem;
      margin-bottom: 0.4rem;
    }
    .track-title {
      font-family: 'Geosans', sans-serif;
      font-weight: 400;
      font-size: 1rem;
      letter-spacing: 0.06em;
      color: var(--fg);
      margin: 0;
    }
    .track-date {
      font-family: 'Geosans', sans-serif;
      font-size: 0.68rem;
      letter-spacing: 0.14em;
      color: var(--muted);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .track-desc {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 300;
      font-size: 0.875rem;
      color: var(--muted);
      line-height: 1.75;
      margin: 0 0 0.7rem;
    }
    .track-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .track-tag {
      display: inline-block;
      font-family: 'Geosans', sans-serif;
      font-size: 0.62rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
      border: 1px solid var(--border);
      padding: 0.18rem 0.55rem;
    }
    .music-empty {
      text-align: center;
      padding: 4rem 0;
      color: var(--muted);
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 300;
      font-size: 0.9rem;
      letter-spacing: 0.08em;
    }
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 1rem 0 1.8rem;
    }
    .pagination-btn {
      background: none;
      border: 1px solid var(--border);
      padding: 0.38rem 1rem;
      cursor: pointer;
      color: var(--fg);
      font-family: 'Geosans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .pagination-btn:hover:not(:disabled) {
      background: var(--black);
      color: var(--white);
      border-color: var(--black);
    }
    .pagination-btn:disabled { opacity: 0.28; cursor: default; }
    .pagination-nums { display: flex; gap: 0.3rem; }
    .pagination-num {
      background: none;
      border: 1px solid transparent;
      width: 2rem; height: 2rem;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      font-family: 'Geosans', sans-serif;
      font-size: 0.8rem;
      color: var(--muted);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .pagination-num:hover { color: var(--fg); border-color: var(--border); }
    .pagination-num.active { background: var(--black); color: var(--white); border-color: var(--black); }
  </style>
</head>
<body>
  <div id="shared-header"></div>
  <div class="container">
    <main class="sub-main">
      <h1 class="page-title font-kazesawa" id="music-page-title">曲置き場</h1>
      <div id="pagination-top" class="pagination"></div>
      <div id="music-list"     class="music-list"></div>
      <div id="pagination-bot" class="pagination"></div>
    </main>
    <div id="shared-footer"></div>
  </div>
  <script src="../shared-nav.js"></script>
<script>
/* ====================================================
   曲データ
   新しい曲を追加するには配列の先頭に追記してください。
   type:   'audio' または 'video'
   jacket: 音声曲のジャケット画像パス（省略可）
   tags:   { ja, de, fi } 形式（省略可）
==================================================== */
var TRACKS = [
  {
    file:   'Yabaura.MP4',
    type:   'video',
    date:   '2026-01-14',
    title:  { ja: 'やばいクレーマーの地球の裏', de: 'Ein sinnloses YTPMV', fi: 'Tyhmä YTPMV' },
    desc:   { ja: '曲というよりクソ動画だよね。何がすごいって共テ前にこんなもん作ってたことだよ。',
              de: 'Das ist eher ein dummes Video als ein richtiger Song.',
              fi: 'Tämä on oikeastaan vain joku ihan turha video.' },
    tags:   [{ ja: '音MAD', de: 'YTPMV', fi: 'YTPMV' }]
  },
  {
    file:   'Millennium.mp3',
    type:   'audio',
    jacket: 'Mond.JPG',
    date:   '2025-12-25',
    title:  { ja: 'Das Millennium der Mondgöttin', de: 'Das Millennium der Mondgöttin', fi: 'Das Millennium der Mondgöttin' },
    desc:   { ja: '千年幻想郷のピアノアレンジです',
              de: 'Dies ist eine Klavierbearbeitung des Titelsongs von Eirin Yagokoro, einer Figur aus dem Touhou-Projekt.',
              fi: 'Tämä on pianosovitus Touhou-projektin hahmon Yagokoro Eirin teemakappaleesta.' },
    tags:   [
      { ja: 'ピアノ',   de: 'Klavier',     fi: 'Piano' },
      { ja: 'アレンジ', de: 'Arrangement', fi: 'Sovitus' }
    ]
  },
  {
    file:   'Abend.wav',
    type:   'audio',
    jacket: 'Abend.JPG',
    date:   '2024-11-20',
    title:  { ja: 'Abend', de: 'Abend', fi: 'Abend' },
    desc:   { ja: '訳のわからんピアノ曲もどきです。',
              de: 'Es handelt sich um ein sehr avantgardistisches Klavierstück.',
              fi: 'Kyseessä on hyvin avantgardistinen pianokappale.' },
    tags:   [
      { ja: 'ピアノ',     de: 'Klavier',  fi: 'Piano' },
      { ja: 'オリジナル', de: 'Original', fi: 'Alkuperäinen' }
    ]
  }
];

var UI = {
  ja: { pageTitle: '曲置き場', prev: '← 前へ', next: '次へ →', empty: '曲はまだありません' },
  de: { pageTitle: 'Musik',    prev: '← Zurück', next: 'Weiter →', empty: 'Noch keine Stücke' },
  fi: { pageTitle: 'Musiikki', prev: '← Edellinen', next: 'Seuraava →', empty: 'Ei musiikkia vielä' }
};

var PER_PAGE = 4;
TRACKS.sort(function(a, b) { return b.date.localeCompare(a.date); });

var lang        = localStorage.getItem('lang') || 'ja';
var currentPage = 1;
var _nowPlaying = null;
var _seekDrag   = null;

function t(obj) {
  if (!obj) return '';
  return obj[lang] || obj['ja'] || '';
}
function ui(key) {
  return ((UI[lang] || UI['ja'])[key]) || '';
}
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function fmtTime(s) {
  if (!isFinite(s) || isNaN(s)) return '--:--';
  var m   = Math.floor(s / 60);
  var sec = Math.floor(s % 60);
  return m + ':' + String(sec).padStart(2, '0');
}
function formatDate(iso) {
  var p = iso.split('-');
  if (lang === 'de' || lang === 'fi') return parseInt(p[2]) + '.' + parseInt(p[1]) + '.' + p[0];
  return p[0] + '.' + p[1] + '.' + p[2];
}
function getMime(file) {
  var ext = file.split('.').pop().toLowerCase();
  return { mp3:'audio/mpeg', wav:'audio/wav', ogg:'audio/ogg', flac:'audio/flac',
           mp4:'video/mp4', webm:'video/webm', mov:'video/quicktime' }[ext] || '';
}
function playIcon() {
  return '<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="6,3 20,12 6,21" fill="currentColor"/></svg>';
}
function pauseIcon() {
  return '<svg viewBox="0 0 24 24" width="16" height="16">' +
    '<rect x="5" y="3" width="4" height="18" rx="1" fill="currentColor"/>' +
    '<rect x="15" y="3" width="4" height="18" rx="1" fill="currentColor"/>' +
    '</svg>';
}
function getPageFromHash() {
  var m = location.hash.match(/^#p(\\d+)$/);
  return m ? Math.max(1, parseInt(m[1])) : 1;
}
function setPageHash(n) {
  history.pushState(null, '', n > 1 ? '#p' + n : location.pathname + location.search);
}

function buildCard(track) {
  var isVideo = track.type === 'video';
  var dateStr = formatDate(track.date);
  var mediaHTML;
  if (isVideo) {
    mediaHTML =
      '<div class="player-media">' +
        '<video class="player-video" preload="metadata" playsinline>' +
          '<source src="' + esc(track.file) + '" type="' + esc(getMime(track.file)) + '">' +
        '</video>' +
      '</div>';
  } else {
    var inner = track.jacket
      ? '<img class="player-jacket" src="' + esc(track.jacket) + '" alt="' + esc(t(track.title)) + '">'
      : '<div class="player-jacket-placeholder"><span class="player-note">♫</span></div>';
    mediaHTML =
      '<div class="player-media">' +
        '<audio preload="metadata" style="display:none">' +
          '<source src="' + esc(track.file) + '" type="' + esc(getMime(track.file)) + '">' +
        '</audio>' +
        '<div class="player-media-inner">' + inner + '</div>' +
      '</div>';
  }
  var tagsHTML = '';
  if (track.tags && track.tags.length) {
    tagsHTML = '<div class="track-tags">' +
      track.tags.map(function(tag) {
        return '<span class="track-tag">' + esc(t(tag)) + '</span>';
      }).join('') +
      '</div>';
  }
  return (
    '<div class="track-card">' +
      mediaHTML +
      '<div class="player-controls">' +
        '<button class="player-play-btn" aria-label="再生">' + playIcon() + '</button>' +
        '<div class="player-seek-wrap">' +
          '<div class="player-seek-track">' +
            '<div class="player-fill"></div>' +
            '<div class="player-thumb"></div>' +
          '</div>' +
        '</div>' +
        '<span class="player-time">0:00 / --:--</span>' +
      '</div>' +
      '<div class="track-info">' +
        '<div class="track-info-header">' +
          '<h2 class="track-title">' + esc(t(track.title)) + '</h2>' +
          '<time class="track-date" datetime="' + esc(track.date) + '">' + esc(dateStr) + '</time>' +
        '</div>' +
        (t(track.desc) ? '<p class="track-desc">' + esc(t(track.desc)) + '</p>' : '') +
        tagsHTML +
      '</div>' +
    '</div>'
  );
}

function setupPlayers() {
  document.querySelectorAll('.track-card').forEach(function(card) {
    var media    = card.querySelector('audio, video');
    var playBtn  = card.querySelector('.player-play-btn');
    var fill     = card.querySelector('.player-fill');
    var thumb    = card.querySelector('.player-thumb');
    var seekWrap = card.querySelector('.player-seek-wrap');
    var timeEl   = card.querySelector('.player-time');
    if (!media || !playBtn) return;

    media.addEventListener('timeupdate', function() {
      if (!media.duration) return;
      var pct = (media.currentTime / media.duration) * 100;
      fill.style.width  = pct + '%';
      thumb.style.left  = pct + '%';
      timeEl.textContent = fmtTime(media.currentTime) + ' / ' + fmtTime(media.duration);
    });
    media.addEventListener('loadedmetadata', function() {
      timeEl.textContent = '0:00 / ' + fmtTime(media.duration);
    });
    media.addEventListener('ended', function() {
      playBtn.innerHTML = playIcon();
      _nowPlaying = null;
    });

    playBtn.addEventListener('click', function() {
      if (media.paused) {
        if (_nowPlaying && _nowPlaying !== media) {
          _nowPlaying.pause();
          var otherCard = _nowPlaying.closest ? _nowPlaying.closest('.track-card') : null;
          if (otherCard) {
            var ob = otherCard.querySelector('.player-play-btn');
            if (ob) ob.innerHTML = playIcon();
          }
        }
        media.play();
        _nowPlaying = media;
        playBtn.innerHTML = pauseIcon();
      } else {
        media.pause();
        _nowPlaying = null;
        playBtn.innerHTML = playIcon();
      }
    });

    function seekToX(clientX) {
      var rect = seekWrap.getBoundingClientRect();
      var pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (media.duration) media.currentTime = pct * media.duration;
    }
    seekWrap.addEventListener('mousedown', function(e) {
      _seekDrag = { wrap: seekWrap, fn: seekToX };
      seekWrap.classList.add('dragging');
      seekToX(e.clientX);
    });
    seekWrap.addEventListener('touchstart', function(e) {
      seekToX(e.touches[0].clientX);
    }, { passive: true });
    seekWrap.addEventListener('touchmove', function(e) {
      seekToX(e.touches[0].clientX);
    }, { passive: true });
  });
}

document.addEventListener('mousemove', function(e) {
  if (_seekDrag) _seekDrag.fn(e.clientX);
});
document.addEventListener('mouseup', function() {
  if (_seekDrag) {
    var wrap = _seekDrag.wrap;
    if (wrap) wrap.classList.remove('dragging');
    _seekDrag = null;
  }
});

function renderPagination(id, totalPages) {
  var el = document.getElementById(id);
  if (totalPages <= 1) { el.innerHTML = ''; return; }
  var nums = '';
  for (var i = 1; i <= totalPages; i++) {
    nums += '<button class="pagination-num' + (i === currentPage ? ' active' : '') +
      '" onclick="goPage(' + i + ')">' + i + '</button>';
  }
  el.innerHTML =
    '<button class="pagination-btn"' + (currentPage <= 1 ? ' disabled' : '') +
    ' onclick="goPage(' + (currentPage - 1) + ')">' + ui('prev') + '</button>' +
    '<div class="pagination-nums">' + nums + '</div>' +
    '<button class="pagination-btn"' + (currentPage >= totalPages ? ' disabled' : '') +
    ' onclick="goPage(' + (currentPage + 1) + ')">' + ui('next') + '</button>';
}

function renderAll() {
  if (_nowPlaying) { _nowPlaying.pause(); _nowPlaying = null; }
  document.getElementById('music-page-title').textContent = ui('pageTitle');
  document.title = ui('pageTitle') + ' — 偽造切手';
  var total      = TRACKS.length;
  var totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  currentPage    = Math.min(currentPage, totalPages);
  var start = (currentPage - 1) * PER_PAGE;
  var items = TRACKS.slice(start, start + PER_PAGE);
  var listEl = document.getElementById('music-list');
  if (items.length === 0) {
    listEl.innerHTML = '<p class="music-empty">' + ui('empty') + '</p>';
  } else {
    listEl.innerHTML = items.map(buildCard).join('');
    setupPlayers();
  }
  renderPagination('pagination-top', totalPages);
  renderPagination('pagination-bot', totalPages);
}

function goPage(n) {
  currentPage = n;
  setPageHash(n);
  renderAll();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

(function() {
  var _orig = window.setLang;
  window.setLang = function(l) {
    lang = l;
    if (_orig) _orig(l);
    renderAll();
  };
})();

window.addEventListener('hashchange', function() {
  currentPage = getPageFromHash();
  renderAll();
});

currentPage = getPageFromHash();
renderAll();
</script>
</body>
</html>
""";
    }

    // =========================================================
    //  字置き場 (docs/text/index.html)
    // =========================================================
    public static String textPage() {
        return """
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>字置き場 — 偽造切手</title>
  <link rel="stylesheet" href="../style.css">
  <style>
    .novel-list {
      display: flex;
      flex-direction: column;
      gap: 1.8rem;
      margin: 1rem 0 2rem;
    }
    .novel-card {
      border: 1px solid var(--border);
      background: var(--white);
      display: grid;
      grid-template-columns: 130px 1fr;
      grid-template-rows: auto 1fr auto;
      overflow: hidden;
    }
    .novel-jacket {
      grid-column: 1;
      grid-row: 1 / 4;
      border-right: 1px solid var(--border);
      background: #f0f0f0;
      display: flex;
      flex-direction: column;
    }
    .novel-jacket-img {
      flex: 1;
      overflow: hidden;
      min-height: 120px;
    }
    .novel-jacket-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .novel-jacket-placeholder {
      width: 100%;
      height: 100%;
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .novel-jacket-placeholder span {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-size: 0.68rem;
      color: #bbb;
      letter-spacing: 0.12em;
      writing-mode: vertical-rl;
    }
    .novel-jacket-footer {
      flex-shrink: 0;
      border-top: 1px solid var(--border);
      padding: 0.42rem 0.6rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.4rem;
      background: var(--white);
    }
    .novel-jacket-date {
      font-family: 'Geosans', sans-serif;
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      color: var(--muted);
    }
    .novel-card-header {
      grid-column: 2;
      grid-row: 1;
      padding: 1.6rem 1.8rem 0.9rem;
      border-bottom: 1px solid var(--border);
    }
    .novel-card-synopsis {
      grid-column: 2;
      grid-row: 2;
      padding: 0.9rem 1.8rem;
    }
    .novel-card-foot {
      grid-column: 2;
      grid-row: 3;
      padding: 0 1.8rem 1.6rem;
    }
    .novel-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .novel-title {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 400;
      font-size: 1.2rem;
      letter-spacing: 0.06em;
      color: var(--fg);
      margin: 0;
      line-height: 1.5;
    }
    .novel-status {
      display: inline-block;
      font-family: 'Geosans', sans-serif;
      font-size: 0.58rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      padding: 0.14rem 0.55rem;
      border: 1px solid currentColor;
      white-space: nowrap;
    }
    .novel-status-wip  { color: #999; }
    .novel-status-done { color: var(--fg); }
    .novel-synopsis {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 300;
      font-size: 0.9rem;
      color: var(--muted);
      line-height: 1.9;
      margin: 0;
    }
    .novel-card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-top: 0.2rem;
    }
    .novel-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .novel-tag {
      display: inline-block;
      font-family: 'Geosans', sans-serif;
      font-size: 0.62rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
      border: 1px solid var(--border);
      padding: 0.18rem 0.55rem;
    }
    .novel-read-btn {
      display: inline-block;
      font-family: 'Geosans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      color: var(--fg);
      text-decoration: none;
      border: 1px solid var(--border);
      padding: 0.42rem 1.1rem;
      white-space: nowrap;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .novel-read-btn:hover {
      background: var(--black);
      color: var(--white);
      border-color: var(--black);
      opacity: 1;
    }
    .novel-empty {
      text-align: center;
      padding: 4rem 0;
      color: var(--muted);
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 300;
      font-size: 0.9rem;
      letter-spacing: 0.08em;
    }
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 1rem 0 1.8rem;
    }
    .pagination-btn {
      background: none;
      border: 1px solid var(--border);
      padding: 0.38rem 1rem;
      cursor: pointer;
      color: var(--fg);
      font-family: 'Geosans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .pagination-btn:hover:not(:disabled) {
      background: var(--black);
      color: var(--white);
      border-color: var(--black);
    }
    .pagination-btn:disabled { opacity: 0.28; cursor: default; }
    .pagination-nums { display: flex; gap: 0.3rem; }
    .pagination-num {
      background: none;
      border: 1px solid transparent;
      width: 2rem; height: 2rem;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      font-family: 'Geosans', sans-serif;
      font-size: 0.8rem;
      color: var(--muted);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .pagination-num:hover { color: var(--fg); border-color: var(--border); }
    .pagination-num.active { background: var(--black); color: var(--white); border-color: var(--black); }
    @media (max-width: 520px) {
      .novel-card { grid-template-columns: 1fr; grid-template-rows: auto auto auto auto; }
      .novel-card-header { grid-column: 1; grid-row: 1; padding: 1.2rem 1.2rem 0.9rem; }
      .novel-jacket { grid-column: 1; grid-row: 2; border-right: none; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
      .novel-jacket-img { min-height: 180px; max-height: 240px; }
      .novel-card-synopsis { grid-column: 1; grid-row: 3; padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border); }
      .novel-card-foot { grid-column: 1; grid-row: 4; padding: 0.9rem 1.2rem 1.2rem; }
      .novel-card-top { flex-direction: column; }
      .novel-card-bottom { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <div id="shared-header"></div>
  <div class="container">
    <main class="sub-main">
      <h1 class="page-title font-kazesawa" id="text-page-title">字置き場</h1>
      <div id="pagination-top" class="pagination"></div>
      <div id="novel-list"     class="novel-list"></div>
      <div id="pagination-bot" class="pagination"></div>
    </main>
    <div id="shared-footer"></div>
  </div>
  <script src="../shared-nav.js"></script>
<script>
/* ====================================================
   小説データ
   新しい作品を追加するときは配列の先頭に追記してください。
   status: 'wip'（執筆中） または 'done'（完成）
==================================================== */
var NOVELS = [
  {
    file:     'mamama.html',
    image:    'mamama.jpg',
    date:     null,
    status:   'wip',
    title:    { ja: '外余擺線上のマキナ' },
    synopsis: {
      ja: '（あらすじ執筆中）',
      de: '（Synopsis in Bearbeitung）',
      fi: '（Tiivistelmä kirjoitetaan）'
    },
    tags: [
      { ja: '日本語', de: 'Japanisch', fi: 'Japani' },
      { ja: '長編', de: 'Roman', fi: 'Romaani' }
    ]
  }
];

var UI = {
  ja: { pageTitle: '字置き場', read: '→ 本編を読む', prev: '← 前へ',       next: '次へ →',    wip: '執筆中', done: '完成', empty: '作品はまだありません' },
  de: { pageTitle: 'Romane',   read: '→ Zum Roman',  prev: '← Zurück',    next: 'Weiter →',   wip: 'In Arbeit', done: 'Fertig', empty: 'Noch keine Werke' },
  fi: { pageTitle: 'Tekstit',  read: '→ Lue teos',   prev: '← Edellinen', next: 'Seuraava →', wip: 'Kirjoitetaan', done: 'Valmis', empty: 'Ei teoksia vielä' }
};

var PER_PAGE = 8;
var lang        = localStorage.getItem('lang') || 'ja';
var currentPage = 1;

function t(obj) {
  if (!obj) return '';
  return obj[lang] || obj['ja'] || '';
}
function ui(key) {
  return ((UI[lang] || UI['ja'])[key]) || '';
}
function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatDate(iso) {
  var p = iso.split('-');
  if (lang === 'de' || lang === 'fi') return parseInt(p[2]) + '.' + parseInt(p[1]) + '.' + p[0];
  return p[0] + '.' + p[1] + '.' + p[2];
}
function getPageFromHash() {
  var m = location.hash.match(/^#p(\\d+)$/);
  return m ? Math.max(1, parseInt(m[1])) : 1;
}
function setPageHash(n) {
  history.pushState(null, '', n > 1 ? '#p' + n : location.pathname + location.search);
}

function buildCard(novel) {
  var statusClass = novel.status === 'done' ? 'novel-status-done' : 'novel-status-wip';
  var statusText  = novel.status === 'done' ? ui('done') : ui('wip');
  var dateStr     = novel.date ? formatDate(novel.date) : '';
  var tagsHTML = '';
  if (novel.tags && novel.tags.length) {
    tagsHTML = '<div class="novel-tags">' +
      novel.tags.map(function(tag) {
        return '<span class="novel-tag">' + esc(t(tag)) + '</span>';
      }).join('') +
      '</div>';
  }
  var jacketImgHTML = novel.image
    ? '<img src="' + esc(novel.image) + '" alt="' + esc(t(novel.title)) + '">'
    : '<div class="novel-jacket-placeholder"><span>' + esc(t(novel.title)) + '</span></div>';
  var jacketHTML =
    '<div class="novel-jacket">' +
      '<div class="novel-jacket-img">' + jacketImgHTML + '</div>' +
      '<div class="novel-jacket-footer">' +
        (novel.date ? '<time class="novel-jacket-date" datetime="' + esc(novel.date) + '">' + esc(dateStr) + '</time>' : '') +
        '<span class="novel-status ' + statusClass + '">' + esc(statusText) + '</span>' +
      '</div>' +
    '</div>';
  return (
    '<div class="novel-card">' +
      jacketHTML +
      '<div class="novel-card-header">' +
        '<h2 class="novel-title">' + esc(t(novel.title)) + '</h2>' +
      '</div>' +
      '<div class="novel-card-synopsis">' +
        (t(novel.synopsis) ? '<p class="novel-synopsis">' + esc(t(novel.synopsis)) + '</p>' : '') +
      '</div>' +
      '<div class="novel-card-foot">' +
        '<div class="novel-card-bottom">' +
          tagsHTML +
          '<a href="' + esc(novel.file) + '" class="novel-read-btn">' + ui('read') + '</a>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function renderPagination(id, totalPages) {
  var el = document.getElementById(id);
  if (totalPages <= 1) { el.innerHTML = ''; return; }
  var nums = '';
  for (var i = 1; i <= totalPages; i++) {
    nums += '<button class="pagination-num' + (i === currentPage ? ' active' : '') +
      '" onclick="goPage(' + i + ')">' + i + '</button>';
  }
  el.innerHTML =
    '<button class="pagination-btn"' + (currentPage <= 1 ? ' disabled' : '') +
    ' onclick="goPage(' + (currentPage - 1) + ')">' + ui('prev') + '</button>' +
    '<div class="pagination-nums">' + nums + '</div>' +
    '<button class="pagination-btn"' + (currentPage >= totalPages ? ' disabled' : '') +
    ' onclick="goPage(' + (currentPage + 1) + ')">' + ui('next') + '</button>';
}

function renderAll() {
  document.getElementById('text-page-title').textContent = ui('pageTitle');
  document.title = ui('pageTitle') + ' — 偽造切手';
  var total      = NOVELS.length;
  var totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  currentPage    = Math.min(currentPage, totalPages);
  var start = (currentPage - 1) * PER_PAGE;
  var items = NOVELS.slice(start, start + PER_PAGE);
  var listEl = document.getElementById('novel-list');
  listEl.innerHTML = items.length === 0
    ? '<p class="novel-empty">' + ui('empty') + '</p>'
    : items.map(buildCard).join('');
  renderPagination('pagination-top', totalPages);
  renderPagination('pagination-bot', totalPages);
}

function goPage(n) {
  currentPage = n;
  setPageHash(n);
  renderAll();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

(function() {
  var _orig = window.setLang;
  window.setLang = function(l) {
    lang = l;
    if (_orig) _orig(l);
    renderAll();
  };
})();

window.addEventListener('hashchange', function() {
  currentPage = getPageFromHash();
  renderAll();
});

currentPage = getPageFromHash();
renderAll();
</script>
</body>
</html>
""";
    }

    // =========================================================
    //  外余擺線上のマキナ 縦書きリーダー (docs/text/mamama.html)
    // =========================================================
    public static String mamamaPage() {
        return """
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>外余擺線上のマキナ — 偽造切手</title>
  <link rel="stylesheet" href="../style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400&display=swap" rel="stylesheet">
  <style>
    body { background: #f0ece2; }
    .novel-wrap {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 60px);
      min-height: 500px;
      background: #f0ece2;
    }
    .novel-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.6rem;
      height: 34px;
      border-bottom: 1px solid #c8bfb0;
      flex-shrink: 0;
    }
    .novel-back {
      font-family: 'Noto Serif JP', serif;
      font-size: 0.62rem;
      letter-spacing: 0.12em;
      color: #9a8e82;
      text-decoration: none;
      transition: color 0.15s;
      flex-shrink: 0;
    }
    .novel-back:hover { color: #2e2218; opacity: 1; }
    .novel-top-center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5em;
      overflow: hidden;
    }
    .novel-pillar {
      font-family: 'Noto Serif JP', 'Hiragino Mincho Pro', 'Yu Mincho', serif;
      font-weight: 300;
      font-size: 0.64rem;
      letter-spacing: 0.16em;
      color: #6e6256;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .novel-pillar-sep { color: #b0a496; font-size: 0.56rem; flex-shrink: 0; }
    .novel-page-indicator {
      font-family: 'Noto Serif JP', serif;
      font-size: 0.62rem;
      letter-spacing: 0.1em;
      color: #b0a496;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .novel-text-area {
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    .novel-page {
      display: none;
      writing-mode: vertical-rl;
      -webkit-writing-mode: vertical-rl;
      text-orientation: mixed;
      position: absolute;
      top: 0; bottom: 0; right: 0;
      box-sizing: border-box;
      font-family: 'Noto Serif JP', 'Hiragino Mincho Pro', 'Yu Mincho', serif;
      font-weight: 300;
      color: #1c1612;
      overflow: hidden;
    }
    .novel-page.active { display: block; }
    .novel-page p {
      display: block;
      margin: 0;
      padding: 0;
      white-space: nowrap;
    }
    .novel-chapter-head {
      font-weight: 400;
      color: #2e2218;
      letter-spacing: 0.22em !important;
    }
    .chapter-num {
      -webkit-text-combine: horizontal;
      -ms-text-combine-horizontal: all;
      text-combine-upright: all;
    }
    .novel-illus-page {
      display: none;
      position: absolute;
      inset: 0;
      align-items: center;
      justify-content: center;
      background: #f0ece2;
    }
    .novel-illus-page.active { display: flex; }
    .novel-illus-page img { max-height: 100%; max-width: 100%; object-fit: contain; }
    .novel-illus-caption {
      writing-mode: vertical-rl;
      font-family: 'Noto Serif JP', serif;
      font-size: 0.68rem;
      color: #9a8e82;
      letter-spacing: 0.1em;
      margin-left: 0.6rem;
      align-self: flex-end;
    }
    .novel-nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.6rem;
      height: 42px;
      border-top: 1px solid #c8bfb0;
      flex-shrink: 0;
    }
    .novel-nav-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-family: 'Noto Serif JP', serif;
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      color: #5a4e44;
      padding: 0.25rem 0.5rem;
      transition: color 0.12s;
      display: flex;
      align-items: center;
      gap: 0.3em;
    }
    .novel-nav-btn:hover:not(:disabled) { color: #1c1612; }
    .novel-nav-btn:disabled { opacity: 0.18; cursor: default; }
    .nav-arr { font-size: 0.65rem; }
    .novel-nav-center { display: flex; align-items: center; }
    .novel-toc-btn {
      background: none;
      border: none;
      font-family: 'Noto Serif JP', serif;
      font-size: 0.66rem;
      letter-spacing: 0.12em;
      color: #9a8e82;
      cursor: pointer;
      padding: 0.3rem 0.6rem;
      transition: color 0.12s;
    }
    .novel-toc-btn:hover { color: #2e2218; }
    .novel-toc-dropdown {
      display: none;
      position: fixed;
      bottom: 52px;
      left: 50%;
      transform: translateX(-50%);
      background: #f8f5ee;
      border: 1px solid #c8bfb0;
      padding: 0.4rem 0;
      min-width: 160px;
      max-width: 86vw;
      max-height: 42vh;
      overflow-y: auto;
      z-index: 100;
      box-shadow: 0 4px 18px rgba(28,22,18,0.14);
    }
    .novel-toc-dropdown.open { display: block; }
    .novel-toc-item {
      display: block;
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      padding: 0.42rem 1rem;
      font-family: 'Noto Serif JP', serif;
      font-weight: 300;
      font-size: 0.76rem;
      letter-spacing: 0.08em;
      color: #2e2218;
      cursor: pointer;
      box-sizing: border-box;
      transition: background 0.1s;
    }
    .novel-toc-item:hover { background: #e8e2d6; }
    .novel-toc-item.toc-chapter {
      font-weight: 400;
      font-size: 0.68rem;
      color: #8a7e72;
      border-top: 1px solid #dedad2;
      padding-top: 0.5rem;
    }
    .novel-toc-item.toc-chapter:first-child { border-top: none; }
    @media (max-width: 600px) {
      .novel-top-bar, .novel-nav-bar { padding: 0 0.9rem; }
    }
  </style>
</head>
<body>
  <div id="shared-header"></div>

  <div class="novel-wrap">
    <div class="novel-top-bar">
      <a href="index.html" class="novel-back">← 字置き場</a>
      <div class="novel-top-center">
        <span class="novel-pillar" id="novel-disp-title">外余擺線上のマキナ</span>
        <span class="novel-pillar-sep" id="novel-sep" style="display:none">—</span>
        <span class="novel-pillar" id="novel-disp-chapter"></span>
      </div>
      <span class="novel-page-indicator" id="novel-indicator">1 / 1</span>
    </div>

    <div class="novel-text-area" id="novel-text-area"></div>
    <div class="novel-toc-dropdown" id="novel-toc"></div>

    <div class="novel-nav-bar">
      <button class="novel-nav-btn" id="btn-next" onclick="nextPage()">
        <span class="nav-arr">◁</span> 次へ
      </button>
      <div class="novel-nav-center">
        <button class="novel-toc-btn" id="toc-toggle" onclick="toggleToc()">目次</button>
      </div>
      <button class="novel-nav-btn" id="btn-prev" onclick="prevPage()">
        前へ <span class="nav-arr">▷</span>
      </button>
    </div>
  </div>

  <script src="../shared-nav.js"></script>
  <script>
/* ====================================================
   小説データ
   CHAPTERS 配列に章を追加してください。
   段落は空行で区切ってください。
==================================================== */
var NOVEL_TITLE = '外余擺線上のマキナ';

var CHAPTERS = [
  {
    title: '一',
    illus: null,
    caption: null,
    text: `とある夏の昼下がり、蒔那という少女は石膏ボードの天井をぼやけた視界の背景にしながら、嘲るように笑った。窓から差す太陽光線は室内の明度を上昇させ、空間は熱を帯び、澱んだ空気は飽和して、蒔那の視界に広がる景色は白飛びした写真のようである。興奮した神経細胞がその正常な働きを徐々に取り戻していくにつれて、アドレナリンの離脱症状か、事態をようやく認識し始めたためか、蒔那の口角は下がり始める。どうしてアタシがこんな状況に置かれたのか、どうしてアタシがこんな目に遭っているのか──あまり深く考えないことにした。蒔那の性分では、その物思いに耽った結果が、「私が悪かった」であった日には、脳みそがきっと沸騰してしまうからである。部屋の時計はカチ、カチ、と、病的に六畳少しの部屋に響く。これが、フロイトの示した精神分析に関する症例の一つであるわけもない。まるで自分自身のパラノイアを知覚した気分だ。(今はここまでですよ。これでも一章のごくごく最初の方だけです。引き返すなら今のうちです。続きはそのうち更新します。)`
  }
];

var CHARS_PER_COL = 40;
var LINE_HEIGHT   = 1.50;

var PAGES          = [];
var currentPage    = 0;
var tocOpen        = false;
var chapterPageMap = [];

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function tcyWrap(s) {
  return String(s).replace(/(\\d{1,2})/g, '<span class="chapter-num">$1</span>');
}
function applyTcy(escaped) {
  return escaped.replace(/[0-9]{1,4}/g, function(m) {
    return '<span style="text-combine-upright:all;-webkit-text-combine:horizontal;">' + m + '</span>';
  });
}

var KINSOKU_HEAD = '、。，．）」』】〕〉》〙〗・：；！？…‥ー～';
var KINSOKU_TAIL = '（「『【〔〈《〘〖';

function splitIntoColumns(text) {
  var paras = text
    .split(/\\n[ \\t]*\\n/)
    .map(function(s){
      return s
        .replace(/^[ \\t\\n]+|[ \\t\\n]+$/g, '')
        .replace(/[ \\t]*\\n[ \\t]*/g, '');
    })
    .filter(function(s){ return s.length > 0; });

  var cols = [];
  paras.forEach(function(para) {
    var t = '\\u3000' + para;
    var i = 0;
    while (i < t.length) {
      var end = Math.min(i + CHARS_PER_COL, t.length);
      var pull = 0;
      while (end < t.length && KINSOKU_HEAD.indexOf(t[end]) >= 0 && pull < 2) {
        end++; pull++;
      }
      if (end < t.length && KINSOKU_TAIL.indexOf(t[end - 1]) >= 0) {
        end--;
      }
      cols.push(t.slice(i, end));
      i = end;
    }
  });
  return cols;
}

function buildPages(colsPerPage) {
  PAGES = [];
  chapterPageMap = [];
  CHAPTERS.forEach(function(chapter) {
    if (chapter.illus) {
      PAGES.push({ type: 'illus', chapter: chapter.title, illus: chapter.illus, caption: chapter.caption || null });
    }
    var allCols = splitIntoColumns(chapter.text || '');
    var isFirst = true;
    if (allCols.length === 0) allCols = [''];
    var i = 0;
    while (i < allCols.length) {
      var avail = isFirst ? colsPerPage - 1 : colsPerPage;
      avail = Math.max(1, avail);
      var slice = allCols.slice(i, i + avail);
      chapterPageMap.push({ title: chapter.title, pageIdx: PAGES.length });
      PAGES.push({ type: 'text', chapter: chapter.title, hasTitle: isFirst, cols: slice });
      i += avail;
      isFirst = false;
    }
  });
}

function renderPages(fontSize, colsPerPage) {
  var area = document.getElementById('novel-text-area');
  var padTop    = Math.round(fontSize * 1.6);
  var padBottom = Math.round(fontSize * 1.4);
  var padH      = Math.round(fontSize * 3.0);
  var colGap    = Math.round(fontSize * 0.4) + 'px';
  var titleGap  = Math.round(fontSize * 1.4) + 'px';
  var titleBorderPad = Math.round(fontSize * 0.4) + 'px';
  area.innerHTML = PAGES.map(function(page, idx) {
    var active = idx === 0 ? ' active' : '';
    if (page.type === 'illus') {
      var cap = page.caption ? '<span class="novel-illus-caption">' + esc(page.caption) + '</span>' : '';
      return '<div class="novel-illus-page' + active + '" id="novel-page-' + idx + '">' +
        '<img src="' + esc(page.illus) + '" alt="">' + cap + '</div>';
    }
    var colStyle = 'white-space:nowrap;margin:0;padding:0;display:block;margin-block-end:' + colGap + ';';
    var inner = '';
    if (page.hasTitle) {
      inner += '<p class="novel-chapter-head" style="' + colStyle +
        'margin-block-end:' + titleGap + ';' +
        'padding-block-end:' + titleBorderPad + ';' +
        'border-block-end:1px solid #b0a490;">' +
        tcyWrap(esc(page.chapter)) + '</p>';
    }
    inner += page.cols.map(function(col) {
      return '<p style="' + colStyle + '">' + applyTcy(esc(col)) + '</p>';
    }).join('');
    return '<div class="novel-page' + active + '" id="novel-page-' + idx + '" style="' +
      'font-size:' + fontSize + 'px;' +
      'line-height:' + LINE_HEIGHT + ';' +
      'letter-spacing:0.04em;' +
      'padding:' + padTop + 'px ' + padH + 'px ' + padBottom + 'px ' + padH + 'px;' +
      '">' + inner + '</div>';
  }).join('');
}

function buildToc() {
  var toc = document.getElementById('novel-toc');
  var seen = {}, items = [];
  chapterPageMap.forEach(function(item) {
    if (!seen[item.title]) { seen[item.title] = true; items.push(item); }
  });
  if (!items.length) {
    var b = document.getElementById('toc-toggle');
    if (b) b.style.display = 'none';
    return;
  }
  toc.innerHTML = items.map(function(item) {
    return '<button class="novel-toc-item toc-chapter" onclick="goToPage(' +
      item.pageIdx + ');closeToc();">' + esc(item.title) + '</button>';
  }).join('');
}

function init() {
  var area  = document.getElementById('novel-text-area');
  var areaH = area.clientHeight;
  var areaW = area.clientWidth;
  var fs = areaH / (CHARS_PER_COL * 1.04 + 3.0);
  fs = Math.max(10, Math.min(20, fs));
  fs = Math.round(fs * 10) / 10;
  var padH   = Math.round(fs * 1.2);
  var colW   = Math.round(fs * LINE_HEIGHT);
  var colGap = Math.round(fs * 0.4);
  var usableW = areaW - padH * 2;
  var cols   = Math.max(1, Math.floor(usableW / (colW + colGap)));
  buildPages(cols);
  renderPages(fs, cols);
  buildToc();
  currentPage = 0;
  updateUI();
}

function goToPage(idx) {
  if (idx < 0 || idx >= PAGES.length) return;
  var cur = document.getElementById('novel-page-' + currentPage);
  if (cur) cur.classList.remove('active');
  currentPage = idx;
  var nxt = document.getElementById('novel-page-' + currentPage);
  if (nxt) {
    nxt.classList.add('active');
    var area = document.getElementById('novel-text-area');
    if (area) { area.scrollTop = 0; area.scrollLeft = 0; }
    nxt.scrollTop = 0;
    nxt.scrollLeft = 0;
  }
  updateUI();
}
function prevPage() { goToPage(currentPage - 1); }
function nextPage() { goToPage(currentPage + 1); }

function updateUI() {
  document.getElementById('novel-indicator').textContent = (currentPage + 1) + ' / ' + PAGES.length;
  var label = '';
  for (var i = chapterPageMap.length - 1; i >= 0; i--) {
    if (chapterPageMap[i].pageIdx <= currentPage) { label = chapterPageMap[i].title; break; }
  }
  var sep  = document.getElementById('novel-sep');
  var chap = document.getElementById('novel-disp-chapter');
  sep.style.display  = label ? '' : 'none';
  chap.textContent   = label;
  document.getElementById('btn-prev').disabled = currentPage <= 0;
  document.getElementById('btn-next').disabled = currentPage >= PAGES.length - 1;
}

function toggleToc() {
  tocOpen = !tocOpen;
  document.getElementById('novel-toc').classList.toggle('open', tocOpen);
}
function closeToc() {
  tocOpen = false;
  document.getElementById('novel-toc').classList.remove('open');
}
document.addEventListener('click', function(e) {
  if (!tocOpen) return;
  var t = document.getElementById('novel-toc');
  var b = document.getElementById('toc-toggle');
  if (t && !t.contains(e.target) && b && !b.contains(e.target)) closeToc();
});

document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown')  nextPage();
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp')    prevPage();
  if (e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); nextPage(); }
  if (e.key === 'PageUp')                    { e.preventDefault(); prevPage(); }
});

(function() {
  var sx = 0, sy = 0;
  var area = document.getElementById('novel-text-area');
  area.addEventListener('touchstart', function(e) {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  area.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) nextPage(); else prevPage();
  }, { passive: true });
})();

var resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(init, 250);
});

window.addEventListener('DOMContentLoaded', function() {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    setTimeout(init, 500);
  }
});
  </script>
</body>
</html>
""";
    }

    // =========================================================
    //  独り言 (docs/diary/index.html)
    // =========================================================
    public static String diaryPage() {
        return """
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>独り言 — 偽造切手</title>
  <link rel="stylesheet" href="../style.css">
  <style>
    .diary-list { display: flex; flex-direction: column; gap: 1.2rem; margin: 1rem 0 2rem; }
    .diary-card {
      border: 1px solid var(--border);
      background: var(--white);
      padding: 1.6rem 1.8rem;
    }
    .diary-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.8rem;
      margin-bottom: 0.75rem;
    }
    .diary-date-title { flex: 1; min-width: 0; }
    .diary-entry-date {
      display: block;
      font-family: 'Geosans', sans-serif;
      font-size: 0.68rem;
      letter-spacing: 0.16em;
      color: var(--muted);
      margin-bottom: 0.3rem;
    }
    .diary-entry-title {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 400;
      font-size: 1.05rem;
      letter-spacing: 0.06em;
      color: var(--fg);
      margin: 0;
      line-height: 1.5;
    }
    .diary-entry-body { margin-bottom: 0.9rem; }
    .entry-body-text {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 300;
      font-size: 0.95rem;
      color: var(--fg);
      line-height: 1.9;
      margin: 0;
    }
    .diary-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .diary-tag {
      display: inline-block;
      font-family: 'Geosans', sans-serif;
      font-size: 0.62rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
      border: 1px solid var(--border);
      padding: 0.18rem 0.55rem;
    }
    .entry-lang-btns {
      display: flex;
      gap: 0.22rem;
      flex-shrink: 0;
      align-self: flex-start;
      margin-top: 0.1rem;
    }
    .entry-lang-btn {
      background: none;
      border: 1px solid #ddd;
      color: #ccc;
      font-family: 'Geosans', sans-serif;
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      text-transform: lowercase;
      padding: 0.15rem 0.42rem;
      cursor: pointer;
      transition: border-color 0.12s, color 0.12s;
      line-height: 1.4;
    }
    .entry-lang-btn:hover { border-color: #999; color: #555; }
    .entry-lang-btn.active { border-color: var(--black); color: var(--black); }
    .entry-body-scroll { overflow: hidden; white-space: nowrap; }
    .entry-body-scroll .entry-body-text {
      display: inline-block;
      animation: entryBodyScroll 7s linear infinite;
    }
    @keyframes entryBodyScroll {
      0%   { transform: translateX(110%); }
      100% { transform: translateX(-110%); }
    }
    #quiz-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 9000;
      align-items: center;
      justify-content: center;
    }
    #quiz-overlay.open { display: flex; }
    #quiz-dialog {
      background: var(--white);
      border: 1px solid var(--border);
      padding: 2rem 2.2rem;
      width: min(88vw, 400px);
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }
    #quiz-question {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-size: 0.95rem;
      line-height: 1.85;
      color: var(--fg);
      margin: 0;
      letter-spacing: 0.04em;
    }
    #quiz-input {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-size: 0.9rem;
      border: none;
      border-bottom: 1px solid var(--border);
      padding: 0.4rem 0;
      outline: none;
      width: 100%;
      background: transparent;
      color: var(--fg);
      transition: border-color 0.12s;
    }
    #quiz-input:focus { border-color: var(--fg); }
    #quiz-dialog-btns { display: flex; justify-content: flex-end; }
    #quiz-submit {
      font-family: 'Geosans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      border: 1px solid var(--border);
      background: none;
      padding: 0.38rem 1.1rem;
      cursor: pointer;
      color: var(--fg);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    #quiz-submit:hover { background: var(--black); color: var(--white); border-color: var(--black); }
    .diary-empty {
      text-align: center;
      padding: 4rem 0;
      color: var(--muted);
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 300;
      font-size: 0.9rem;
      letter-spacing: 0.08em;
    }
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 1rem 0 1.8rem;
    }
    .pagination-btn {
      background: none;
      border: 1px solid var(--border);
      padding: 0.38rem 1rem;
      cursor: pointer;
      color: var(--fg);
      font-family: 'Geosans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .pagination-btn:hover:not(:disabled) { background: var(--black); color: var(--white); border-color: var(--black); }
    .pagination-btn:disabled { opacity: 0.28; cursor: default; }
    .pagination-nums { display: flex; gap: 0.3rem; }
    .pagination-num {
      background: none;
      border: 1px solid transparent;
      width: 2rem; height: 2rem;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      font-family: 'Geosans', sans-serif;
      font-size: 0.8rem;
      color: var(--muted);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .pagination-num:hover { color: var(--fg); border-color: var(--border); }
    .pagination-num.active { background: var(--black); color: var(--white); border-color: var(--black); }
  </style>
</head>
<body>
  <div id="shared-header"></div>
  <div class="container">
    <main class="sub-main">
      <h1 class="page-title font-kazesawa" id="diary-page-title">独り言</h1>
      <div id="pagination-top" class="pagination"></div>
      <div id="diary-list"     class="diary-list"></div>
      <div id="pagination-bot" class="pagination"></div>
    </main>
    <div id="shared-footer"></div>
  </div>
  <script src="../shared-nav.js"></script>
<script>
/* ====================================================
   エントリーデータ
   新しい独り言を追加するときは配列の先頭に追記してください。

   【翻訳版も用意する場合（エントリー内に言語切替ボタンが現れる）】
     body: { ja: '...', de: '...', fi: '...' }

   animate: 'scroll'  → テキストが横スクロールするアニメーション
   tap:     { ja:'...' }  → タップ/クリックで本文が切り替わる仕掛け
   quiz:    true     → クリックでクイズモーダルが開く
==================================================== */
var ENTRIES = [
  {
    date:  '2026-05-25',
    title: { ja: 'スペシャルサンクスを追加' },
    body:  { ja: 'ありがとう！！みんな、ありがとう！！' },
    tags:  [{ ja: '感謝！', de: 'DANKE!', fi: 'KIITOS!' }]
  },
  {
    date:  '2026-05-24',
    title: { ja: 'いつもの独り言だと思うじゃん？', de: 'Du denkst, das ist ein normaler Eintrag?', fi: 'Luuletko tämän olevan tavallinen merkintä?' },
    body:  { ja: 'あなたはだあれ？', de: 'Wer bist du?', fi: 'Kuka olet?' },
    quiz:  true,
    tags:  [{ ja: '？', de: '？', fi: '？' }]
  },
  {
    date:  '2026-05-23',
    title: { ja: 'なにこれ！楽しい！(2)' },
    body:  { ja: 'ここの文字動かせるやんけ！' },
    animate: 'scroll',
    tags:  [{ ja: '技術', de: 'Technik', fi: 'Tekniikka' }]
  },
  {
    date:  '2026-05-23',
    title: { ja: '何これ！楽しい！' },
    body:  { ja: 'ここの文タップしてみ？' },
    tap:   { ja: 'へへ！びっくりした？' },
    tags:  [{ ja: '技術', de: 'Technik', fi: 'Tekniikka' }]
  },
  {
    date:  '2026-05-22',
    title: { ja: '幻リプのガチャで大爆死した' },
    body:  { ja: '全部が全部意味のある独り言だと思うなよ。' },
    tags:  [{ ja: '雑談', de: 'Gelaber', fi: 'Höpinää' }]
  },
  {
    date:  '2026-05-22',
    title: { ja: '公開範囲を拡大！' },
    body:  { ja: '一部のネッ友たちに公開してみました。みんなのアドバイスを待ってるよ！',
             de: 'Ich habe die Seite ein paar Freunden gezeigt. Bin gespannt auf eure Vorschläge!',
             fi: 'Julkaisin sivuston jo muutamille nettikavereille. Odotan teidän kommenttejanne!' },
    tags:  [{ ja: 'お知らせ', de: 'Mitteilung', fi: 'Ilmoitus' }]
  },
  {
    date:  '2026-05-21',
    title: { ja: '☆大改革☆' },
    body:  { ja: '本当はこれまでもちょくちょく更新してたんですよ？独り言ページに記述し忘れてただけで…' },
    tags:  [{ ja: 'サイト更新', de: 'Siteupdate', fi: 'Sivupäivitys' }]
  },
  {
    date:  '2026-01-06',
    title: { ja: '他言語・フォント追加' },
    body:  { ja: 'ドイツ語版をクレント体にしてみました。すごく読みづらいですね。' },
    tags:  [{ ja: 'サイト更新', de: 'Siteupdate', fi: 'Sivupäivitys' }]
  },
  {
    date:  '2026-01-05',
    title: { ja: '更新' },
    body:  { ja: 'それらしくなり始めたみたいやね' },
    tags:  [{ ja: 'サイト更新', de: 'Siteupdate', fi: 'Sivupäivitys' }]
  },
  {
    date:  '2025-12-31',
    title: { ja: '作った' },
    body:  { ja: '2025のうちに作っといた方がいいことあるかなって' },
    tags:  [{ ja: 'サイト更新', de: 'Siteupdate', fi: 'Sivupäività' }]
  }
];

var UI = {
  ja: { pageTitle: '独り言',       prev: '← 前へ',       next: '次へ →',    empty: '独り言はまだありません' },
  de: { pageTitle: 'Aufzeichnung', prev: '← Zurück',    next: 'Weiter →',   empty: 'Noch keine Einträge' },
  fi: { pageTitle: 'Päiväkirja',   prev: '← Edellinen', next: 'Seuraava →', empty: 'Ei merkintöjä vielä' }
};

var PER_PAGE = 4;
ENTRIES.sort(function(a, b) { return b.date.localeCompare(a.date); });

var lang        = localStorage.getItem('lang') || 'ja';
var currentPage = 1;
var entryLangs  = {};
var tapRevealed = {};

function t(obj) {
  if (!obj) return '';
  return obj[lang] || obj['ja'] || '';
}
function ui(key) {
  return ((UI[lang] || UI['ja'])[key]) || '';
}
function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatDate(iso) {
  var p = iso.split('-');
  if (lang === 'de' || lang === 'fi') return parseInt(p[2]) + '.' + parseInt(p[1]) + '.' + p[0];
  return p[0] + '.' + p[1] + '.' + p[2];
}
function getPageFromHash() {
  var m = location.hash.match(/^#p(\\d+)$/);
  return m ? Math.max(1, parseInt(m[1])) : 1;
}
function setPageHash(n) {
  history.pushState(null, '', n > 1 ? '#p' + n : location.pathname + location.search);
}

function buildCard(entry, absIdx) {
  var bodyLangs  = Object.keys(entry.body || {});
  var titleLangs = Object.keys(entry.title || {});
  var entryLang  = entryLangs[absIdx] || bodyLangs[0] || 'ja';

  var titleHTML = titleLangs.map(function(l) {
    var hidden = l !== entryLang ? ' style="display:none"' : '';
    return '<span class="entry-title-text" data-lang="' + l + '"' + hidden + '>' + esc(entry.title[l]) + '</span>';
  }).join('');

  var isTapEntry    = !!entry.tap;
  var isQuizEntry   = !!entry.quiz;
  var isTapRevealed = isTapEntry && !!tapRevealed[absIdx];
  var bodyHTML = bodyLangs.map(function(l) {
    var hidden = l !== entryLang ? ' style="display:none"' : '';
    if (isQuizEntry) {
      var qs = l !== entryLang ? ' style="display:none;cursor:pointer;"' : ' style="cursor:pointer;"';
      return '<p class="entry-body-text" data-lang="' + l + '"' + qs +
        ' onclick="openQuiz()">' + esc(entry.body[l] || '').replace(/\\n/g, '<br>') + '</p>';
    }
    var text = isTapRevealed
      ? esc(entry.tap[l] || entry.tap['ja'] || '').replace(/\\n/g, '<br>')
      : esc(entry.body[l] || '').replace(/\\n/g, '<br>');
    var tapAttr = (isTapEntry && !isTapRevealed)
      ? ' onclick="revealTap(' + absIdx + ')" style="cursor:pointer;' + (l !== entryLang ? 'display:none;' : '') + '"'
      : hidden;
    if (isTapEntry && !isTapRevealed) {
      return '<p class="entry-body-text" data-lang="' + l + '"' + tapAttr + '>' + text + '</p>';
    }
    return '<p class="entry-body-text" data-lang="' + l + '"' + hidden + '>' + text + '</p>';
  }).join('');

  var langBtnsHTML = '';
  if (bodyLangs.length > 1) {
    langBtnsHTML = '<div class="entry-lang-btns">' +
      bodyLangs.map(function(l) {
        var active = l === entryLang ? ' active' : '';
        return '<button class="entry-lang-btn' + active + '" data-lang="' + l + '" ' +
          'onclick="switchEntryLang(' + absIdx + ',\\'' + l + '\\')">' + esc(l) + '</button>';
      }).join('') +
      '</div>';
  }

  var tagsHTML = '';
  if (entry.tags && entry.tags.length) {
    tagsHTML = '<div class="diary-tags">' +
      entry.tags.map(function(tag) { return '<span class="diary-tag">' + esc(t(tag)) + '</span>'; }).join('') +
      '</div>';
  }

  return (
    '<div class="diary-card" data-entry-idx="' + absIdx + '">' +
      '<div class="diary-card-top">' +
        '<div class="diary-date-title">' +
          '<time class="diary-entry-date" datetime="' + esc(entry.date) + '">' + esc(formatDate(entry.date)) + '</time>' +
          '<h2 class="diary-entry-title">' + titleHTML + '</h2>' +
        '</div>' +
        langBtnsHTML +
      '</div>' +
      '<div class="diary-entry-body' + (entry.animate === 'scroll' ? ' entry-body-scroll' : '') + '">' + bodyHTML + '</div>' +
      tagsHTML +
    '</div>'
  );
}

function revealTap(absIdx) {
  tapRevealed[absIdx] = true;
  var card = document.querySelector('[data-entry-idx="' + absIdx + '"]');
  if (!card) return;
  var entry = ENTRIES[absIdx];
  if (!entry || !entry.tap) return;
  card.querySelectorAll('.entry-body-text').forEach(function(p) {
    var l = p.getAttribute('data-lang');
    var tapText = esc(entry.tap[l] || entry.tap['ja'] || '').replace(/\\n/g, '<br>');
    p.innerHTML  = tapText;
    p.style.cursor = '';
    p.onclick = null;
  });
}

function switchEntryLang(absIdx, newLang) {
  entryLangs[absIdx] = newLang;
  var card = document.querySelector('[data-entry-idx="' + absIdx + '"]');
  if (!card) return;
  card.querySelectorAll('.entry-title-text[data-lang], .entry-body-text[data-lang]').forEach(function(el) {
    el.style.display = el.getAttribute('data-lang') === newLang ? '' : 'none';
  });
  card.querySelectorAll('.entry-lang-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === newLang);
  });
}

function renderPagination(id, totalPages) {
  var el = document.getElementById(id);
  if (totalPages <= 1) { el.innerHTML = ''; return; }
  var nums = '';
  for (var i = 1; i <= totalPages; i++) {
    nums += '<button class="pagination-num' + (i === currentPage ? ' active' : '') +
      '" onclick="goPage(' + i + ')">' + i + '</button>';
  }
  el.innerHTML =
    '<button class="pagination-btn"' + (currentPage <= 1 ? ' disabled' : '') +
    ' onclick="goPage(' + (currentPage - 1) + ')">' + ui('prev') + '</button>' +
    '<div class="pagination-nums">' + nums + '</div>' +
    '<button class="pagination-btn"' + (currentPage >= totalPages ? ' disabled' : '') +
    ' onclick="goPage(' + (currentPage + 1) + ')">' + ui('next') + '</button>';
}

function renderAll() {
  document.getElementById('diary-page-title').textContent = ui('pageTitle');
  document.title = ui('pageTitle') + ' — 偽造切手';
  var total      = ENTRIES.length;
  var totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  currentPage    = Math.min(currentPage, totalPages);
  var start = (currentPage - 1) * PER_PAGE;
  var items = ENTRIES.slice(start, start + PER_PAGE);
  var listEl = document.getElementById('diary-list');
  listEl.innerHTML = items.length === 0
    ? '<p class="diary-empty">' + ui('empty') + '</p>'
    : items.map(function(entry, i) { return buildCard(entry, start + i); }).join('');
  renderPagination('pagination-top', totalPages);
  renderPagination('pagination-bot', totalPages);
}

function goPage(n) {
  currentPage = n;
  setPageHash(n);
  renderAll();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

(function() {
  var _orig = window.setLang;
  window.setLang = function(l) {
    lang = l;
    if (_orig) _orig(l);
    renderAll();
  };
})();

window.addEventListener('hashchange', function() {
  currentPage = getPageFromHash();
  renderAll();
});

currentPage = getPageFromHash();
renderAll();

/* ====================================================
   クイズモーダル
   答えはSHA-256ハッシュ化済みです。
   ソースコード見て答えを知ろうと思ったあなたは賢いですね。
==================================================== */
(function() {
  var overlay = document.createElement('div');
  overlay.id = 'quiz-overlay';
  overlay.innerHTML =
    '<div id="quiz-dialog">' +
      '<p id="quiz-question"></p>' +
      '<input id="quiz-input" type="text" autocomplete="off" spellcheck="false">' +
      '<div id="quiz-dialog-btns"><button id="quiz-submit">→</button></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var quizStep = 0;
  var quizPath = null;
  var H = {
    step1: [
      '543e33c48b3c23d3b3ef151358533bc206fa0225ba66b89933a795451f016479'
    ],
    step2: [
      '6e0b1be2a81bcbe9d08ccf03dfd28cfdc4bad37ee6bf4fc7e3131415a58855ff',
      '5741143da164ff7dac2e63a31912a0b922059a557c26d2a3c8c6f5b3804e1193',
      '66b0fbb12e4d8f2baf6c325839fa06365b5d7edcdafa36f59440de323751848c',
      '3daf3064e699483c225d155b22bbb7ee5c3675cf5d120a3e35cc4ce28c6e987d'
    ],
    step3_oedipa: [
      '6a9be37c64fdd0a4191b8f52ae39cfb2e893904989c48614639278f407615663',
      '2213ef363d675360b9cd892959dae3c849db68087ebd60908e9aad72664bfef0',
      'dec701935bde39d7d60439ebe78e5c89d978f1cbe6558191b423226913da5f32',
      '7731113c180782fccac6877a9357493d997a0f19203b7d91c89c22f9a81fa595'
    ],
    step3_tonio: [
      '3ce7429acfbe25067e35e5a0fc227c30ffe62ededbce326d119264d62fd45cd0'
    ],
    step4_oedipa: [
      'e81de341385623daaad3511d196c1808f2cb1d3b7ac2d6bece0151b2596775b5',
      'a558fdc8b8f3cc014e70922ac011b7150399b6023b9124c569b5c35dfe6919a8',
      '09ce3b1f10913394ebab89dfaeb0c622abd48632a662e99be0c915caac61dad6',
      '631e198109d7db211427843efb4c0fe5023942bfbeee492fdd772fe669d158db'
    ],
    step4_tonio: [
      '1ab27950901e74c7426a06b5e894dea503546865cb82223087ca8016200835ea',
      '0e71fddbdb1d8565ca66a671fedd458a6ccad6307dccceb68de3bfbfb5ffe8e1'
    ],
    step5: 'e99ecd955e7648433b86bfeeec9a235cfbe5caae601589b778b7369f56d00a49'
  };

  var ENCODED_URLS = {
    oedipa: '5a4858185c4d5c5d',
    tonio:  '455059571a51455c5b'
  };

  var QS = {
    ja: {
      q1:    '競介の好きな飲み物は？',
      q2:    '競介の好きな銘柄は？',
      q3:    '競介の好きな作家は？',
      q3a:   'その作家の作品で競介が一番好きなものは？',
      q3b:   '…その作家の作品で競介が一番好きなものは？',
      q4:    '魔法の番号を入力してね',
      wrong: '残念…'
    },
    de: {
      q1:    'Was trinkt Kyōsuke am liebsten?',
      q2:    'Welche Marke mag Kyōsuke am liebsten?',
      q3:    'Wer ist Kyōsukes Lieblingsautor?',
      q3a:   'Welches Werk dieses Autors mag Kyōsuke am meisten?',
      q3b:   '…Welches Werk dieses Autors mag Kyōsuke am meisten?',
      q4:    'Gib die magische Zahl ein',
      wrong: 'Schade…'
    },
    fi: {
      q1:    'Mikä on Kyōsuken suosijuoma?',
      q2:    'Mikä on Kyōsuken suosimerkki?',
      q3:    'Kuka on Kyōsuken suosikirjailija?',
      q3a:   'Mikä on Kyōsuken suositeos tältä kirjailijalta?',
      q3b:   '…Mikä on Kyōsuken suositeos tältä kirjailijalta?',
      q4:    'Syötä taikanluku',
      wrong: 'Harmi…'
    }
  };

  function qq(key) { return ((QS[lang] || QS['ja'])[key]) || ''; }

  function norm(s) {
    return s.trim()
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .toLowerCase()
      .replace(/\\s+/g, ' ');
  }

  async function sha256hex(s) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf))
      .map(function(b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  async function hashMatches(val, hashes) {
    var h = await sha256hex(val);
    var list = Array.isArray(hashes) ? hashes : [hashes];
    return list.indexOf(h) !== -1;
  }

  function xorDecode(hex, key) {
    var keyBytes = Array.from(new TextEncoder().encode(key));
    var bytes    = hex.match(/.{2}/g).map(function(h) { return parseInt(h, 16); });
    return new TextDecoder().decode(
      new Uint8Array(bytes.map(function(b, i) { return b ^ keyBytes[i % keyBytes.length]; }))
    );
  }

  function showInput(v) {
    document.getElementById('quiz-input').style.display       = v ? '' : 'none';
    document.getElementById('quiz-dialog-btns').style.display = v ? '' : 'none';
  }

  window.openQuiz = function() {
    quizStep = 1; quizPath = null;
    document.getElementById('quiz-question').textContent = qq('q1');
    document.getElementById('quiz-input').value = '';
    showInput(true);
    overlay.classList.add('open');
    setTimeout(function() { document.getElementById('quiz-input').focus(); }, 50);
  };

  function closeQuiz() { overlay.classList.remove('open'); }

  function wrongAnswer() {
    document.getElementById('quiz-question').textContent = qq('wrong');
    showInput(false);
    setTimeout(closeQuiz, 1600);
  }

  function nextQ(key) {
    document.getElementById('quiz-question').textContent = qq(key);
    document.getElementById('quiz-input').value = '';
    setTimeout(function() { document.getElementById('quiz-input').focus(); }, 20);
  }

  async function handleSubmit() {
    if (quizStep === 0) return;
    var val = norm(document.getElementById('quiz-input').value);
    if (!val) return;
    var btn = document.getElementById('quiz-submit');
    btn.disabled = true;

    if (quizStep === 1) {
      (await hashMatches(val, H.step1))
        ? (quizStep = 2, nextQ('q2'))
        : wrongAnswer();
    } else if (quizStep === 2) {
      (await hashMatches(val, H.step2))
        ? (quizStep = 3, nextQ('q3'))
        : wrongAnswer();
    } else if (quizStep === 3) {
      if      (await hashMatches(val, H.step3_oedipa)) { quizPath = 'oedipa'; quizStep = 4; nextQ('q3a'); }
      else if (await hashMatches(val, H.step3_tonio))  { quizPath = 'tonio';  quizStep = 4; nextQ('q3b'); }
      else                                              { wrongAnswer(); }
    } else if (quizStep === 4) {
      var hset = quizPath === 'oedipa' ? H.step4_oedipa : H.step4_tonio;
      (await hashMatches(val, hset))
        ? (quizStep = 5, nextQ('q4'))
        : wrongAnswer();
    } else if (quizStep === 5) {
      if (await hashMatches(val, H.step5)) {
        closeQuiz();
        var h = await sha256hex(val);
        var suffix = quizPath === 'oedipa' ? ':kyo' : ':tana';
        var token = await sha256hex(h + suffix);
        location.href = xorDecode(ENCODED_URLS[quizPath], val) + '?t=' + token;
      } else {
        wrongAnswer();
      }
    }
    btn.disabled = false;
  }

  document.getElementById('quiz-submit').addEventListener('click', handleSubmit);
  document.getElementById('quiz-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleSubmit();
  });
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeQuiz();
  });
})();
</script>
</body>
</html>
""";
    }

    // =========================================================
    //  暇つぶし (docs/pastime/index.html)
    // =========================================================
    public static String pastimePage() {
        return """
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>暇つぶし — 偽造切手</title>
  <link rel="stylesheet" href="../style.css">
  <style>
    .pastime-list { display: flex; flex-direction: column; gap: 1.2rem; margin: 1rem 0 2rem; }
    .pastime-card {
      border: 1px solid var(--border);
      background: var(--white);
      padding: 1.6rem 1.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .pastime-title {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 400;
      font-size: 1.15rem;
      letter-spacing: 0.06em;
      color: var(--fg);
      margin: 0;
      line-height: 1.5;
    }
    .pastime-desc {
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 300;
      font-size: 0.9rem;
      color: var(--muted);
      line-height: 1.9;
      margin: 0;
    }
    .pastime-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-top: 0.2rem;
    }
    .pastime-langs { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .pastime-lang-tag {
      display: inline-block;
      font-family: 'Geosans', sans-serif;
      font-size: 0.62rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
      border: 1px solid var(--border);
      padding: 0.18rem 0.55rem;
    }
    .pastime-play-btn {
      display: inline-block;
      font-family: 'Geosans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      color: var(--fg);
      text-decoration: none;
      border: 1px solid var(--border);
      padding: 0.42rem 1.1rem;
      white-space: nowrap;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .pastime-play-btn:hover {
      background: var(--black);
      color: var(--white);
      border-color: var(--black);
      opacity: 1;
    }
    .pastime-empty {
      text-align: center;
      padding: 4rem 0;
      color: var(--muted);
      font-family: 'Kazesawa', system-ui, sans-serif;
      font-weight: 300;
      font-size: 0.9rem;
      letter-spacing: 0.08em;
    }
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      padding: 1rem 0 1.8rem;
    }
    .pagination-btn {
      background: none;
      border: 1px solid var(--border);
      padding: 0.38rem 1rem;
      cursor: pointer;
      color: var(--fg);
      font-family: 'Geosans', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      white-space: nowrap;
    }
    .pagination-btn:hover:not(:disabled) { background: var(--black); color: var(--white); border-color: var(--black); }
    .pagination-btn:disabled { opacity: 0.28; cursor: default; }
    .pagination-nums { display: flex; gap: 0.3rem; }
    .pagination-num {
      background: none;
      border: 1px solid transparent;
      width: 2rem; height: 2rem;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      font-family: 'Geosans', sans-serif;
      font-size: 0.8rem;
      color: var(--muted);
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .pagination-num:hover { color: var(--fg); border-color: var(--border); }
    .pagination-num.active { background: var(--black); color: var(--white); border-color: var(--black); }
    @media (max-width: 520px) {
      .pastime-card { padding: 1.2rem 1.2rem; }
      .pastime-card-footer { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <div id="shared-header"></div>
  <div class="container">
    <main class="sub-main">
      <h1 class="page-title font-kazesawa" id="pastime-page-title">暇つぶし</h1>
      <div id="pagination-top" class="pagination"></div>
      <div id="pastime-list"   class="pastime-list"></div>
      <div id="pagination-bot" class="pagination"></div>
    </main>
    <div id="shared-footer"></div>
  </div>
  <script src="../shared-nav.js"></script>
<script>
/* ====================================================
   暇つぶしデータ
   新しいコンテンツを追加するときは配列の先頭に追記してください。
   langs: そのコンテンツが対応している自然言語コードの配列
==================================================== */
var ITEMS = [
  {
    file:  'minesweeper.html',
    title: { ja: 'マインスイーパー', de: 'Minesweeper', fi: 'Minesweeper' },
    desc:  {
      ja: '前作の変なFizzBuzzが不評だったため、代わりに用意されたマインスイーパーです。',
      de: 'Es ist einfach nur „Minesweeper".',
      fi: 'Tämä on pelkkä Minesweeper.'
    },
    langs: ['All']
  },
  {
    file:  'solitaire.html',
    title: { ja: 'ソリティア', de: 'Solitär', fi: 'Solitaire' },
    desc:  {
      ja: 'ソリティア。',
      de: 'Solitär.',
      fi: 'Solitaire.'
    },
    langs: ['All']
  },
  {
    file:  'omikuji.html',
    title: { ja: 'Omikuji' },
    desc:  {
      ja: 'あなたの運値はどれくらい？',
      de: 'Wie viel Glück hast du heute?',
      fi: 'Kuinka onnekas olet tänään?'
    },
    langs: ['ja']
  }
];

var UI = {
  ja: {
    pageTitle: '暇つぶし',
    play:      '→ 遊ぶ',
    prev:      '← 前へ',
    next:      '次へ →',
    empty:     'コンテンツはまだありません',
    langNames: { ja: '日本語', de: 'Deutsch', fi: 'Suomi' }
  },
  de: {
    pageTitle: 'Zeitvertreib',
    play:      '→ Spielen',
    prev:      '← Zurück',
    next:      'Weiter →',
    empty:     'Noch keine Inhalte',
    langNames: { ja: 'Japanisch', de: 'Deutsch', fi: 'Finnisch' }
  },
  fi: {
    pageTitle: 'Ajanviete',
    play:      '→ Pelata',
    prev:      '← Edellinen',
    next:      'Seuraava →',
    empty:     'Ei sisältöä vielä',
    langNames: { ja: 'Japani', de: 'Saksa', fi: 'Suomi' }
  }
};

var PER_PAGE = 8;
var lang        = localStorage.getItem('lang') || 'ja';
var currentPage = 1;

function t(obj) {
  if (!obj) return '';
  return obj[lang] || obj['ja'] || '';
}
function ui(key) {
  return ((UI[lang] || UI['ja'])[key]) || '';
}
function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function langName(code) {
  var names = ((UI[lang] || UI['ja']).langNames) || {};
  return names[code] || code;
}
function getPageFromHash() {
  var m = location.hash.match(/^#p(\\d+)$/);
  return m ? Math.max(1, parseInt(m[1])) : 1;
}
function setPageHash(n) {
  history.pushState(null, '', n > 1 ? '#p' + n : location.pathname + location.search);
}

function buildCard(item) {
  var langsHTML = '';
  if (item.langs && item.langs.length) {
    langsHTML = '<div class="pastime-langs">' +
      item.langs.map(function(code) {
        return '<span class="pastime-lang-tag">' + esc(langName(code)) + '</span>';
      }).join('') +
      '</div>';
  } else {
    langsHTML = '<div class="pastime-langs"></div>';
  }
  return (
    '<div class="pastime-card">' +
      '<h2 class="pastime-title">' + esc(t(item.title)) + '</h2>' +
      (t(item.desc) ? '<p class="pastime-desc">' + esc(t(item.desc)) + '</p>' : '') +
      '<div class="pastime-card-footer">' +
        langsHTML +
        '<a href="' + esc(item.file) + '" class="pastime-play-btn">' + ui('play') + '</a>' +
      '</div>' +
    '</div>'
  );
}

function renderPagination(id, totalPages) {
  var el = document.getElementById(id);
  if (totalPages <= 1) { el.innerHTML = ''; return; }
  var nums = '';
  for (var i = 1; i <= totalPages; i++) {
    nums += '<button class="pagination-num' + (i === currentPage ? ' active' : '') +
      '" onclick="goPage(' + i + ')">' + i + '</button>';
  }
  el.innerHTML =
    '<button class="pagination-btn"' + (currentPage <= 1 ? ' disabled' : '') +
    ' onclick="goPage(' + (currentPage - 1) + ')">' + ui('prev') + '</button>' +
    '<div class="pagination-nums">' + nums + '</div>' +
    '<button class="pagination-btn"' + (currentPage >= totalPages ? ' disabled' : '') +
    ' onclick="goPage(' + (currentPage + 1) + ')">' + ui('next') + '</button>';
}

function renderAll() {
  document.getElementById('pastime-page-title').textContent = ui('pageTitle');
  document.title = ui('pageTitle') + ' — 偽造切手';
  var total      = ITEMS.length;
  var totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  currentPage    = Math.min(currentPage, totalPages);
  var start = (currentPage - 1) * PER_PAGE;
  var items = ITEMS.slice(start, start + PER_PAGE);
  var listEl = document.getElementById('pastime-list');
  listEl.innerHTML = items.length === 0
    ? '<p class="pastime-empty">' + ui('empty') + '</p>'
    : items.map(buildCard).join('');
  renderPagination('pagination-top', totalPages);
  renderPagination('pagination-bot', totalPages);
}

function goPage(n) {
  currentPage = n;
  setPageHash(n);
  renderAll();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

(function() {
  var _orig = window.setLang;
  window.setLang = function(l) {
    lang = l;
    if (_orig) _orig(l);
    renderAll();
  };
})();

window.addEventListener('hashchange', function() {
  currentPage = getPageFromHash();
  renderAll();
});

currentPage = getPageFromHash();
renderAll();
</script>
</body>
</html>
""";
    }
}
