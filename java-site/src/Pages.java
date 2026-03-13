package site;

import site.data.DiaryData;

/**
 * 各ページのHTMLを生成するクラス。
 * ページのコンテンツを変更したい場合はここを編集してください。
 */
public class Pages {

    // =========================================================
    //  トップページ
    // =========================================================
    public static String indexPage() {

        String mainContent = """
                <div class="page-layout">

                  <!-- 左：本文 + ナビ -->
                  <div class="page-left">

                    <!-- 概要（言語別） -->
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

                    <!-- ナビゲーション -->
                    <section class="nav-section">
                      <h2 class="section-label font-geosans">Contents</h2>
                      <ul class="contents-list font-kazesawa">
                        <li><a href="art/index.html">絵置き場 / Art</a></li>
                        <li><a href="music/index.html">曲置き場 / Music</a></li>
                        <li><a href="text/index.html">字置き場 / Text</a></li>
                        <li><a href="diary/index.html">独り言 / Diary</a></li>
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
                  // 言語ボタンのアクティブ状態更新
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
                """;

        return Html.topPage(mainContent);
    }

    // =========================================================
    //  絵置き場
    // =========================================================
    public static String artPage() {
        String content = """
                <h1 class="page-title font-kazesawa">絵置き場</h1>

                <div class="art-grid">
                  <div class="art-item">
                    <img src="makomo.png" alt="マコモ湯の人" loading="lazy">
                    <p class="art-caption font-kazesawa-light">
                      マコモ湯の人
                      <span class="art-note">お風呂ガンジス川やんけ！</span>
                    </p>
                  </div>
                  <div class="art-item">
                    <img src="makina.jpg" alt="マキナ" loading="lazy">
                    <p class="art-caption font-kazesawa-light">
                      マキナ
                      <span class="art-note">冲永蒔那です。</span>
                    </p>
                  </div>
                </div>

                <a href="../index.html" class="back-link font-geosans">← トップへ</a>
                """;
        return Html.page("絵置き場", content, "../");
    }

    // =========================================================
    //  曲置き場
    // =========================================================
    public static String musicPage() {
        String content = """
                <h1 class="page-title font-kazesawa">曲置き場</h1>

                <div class="track">
                  <h3 class="font-geosans">Das Millennium der Mondgöttin</h3>
                  <audio controls>
                    <source src="Millennium.mp3" type="audio/mpeg">
                  </audio>
                  <p class="font-kazesawa-light">千年幻想郷のピアノアレンジです</p>
                </div>

                <div class="track">
                  <h3 class="font-geosans">Abend</h3>
                  <audio controls>
                    <source src="Abend.wav" type="audio/wav">
                  </audio>
                  <p class="font-kazesawa-light">訳のわからんピアノ曲もどきです。</p>
                </div>

                <a href="../index.html" class="back-link font-geosans">← トップへ</a>
                """;
        return Html.page("曲置き場", content, "../");
    }

    // =========================================================
    //  字置き場
    // =========================================================
    public static String textPage() {
        String content = """
                <h1 class="page-title font-kazesawa">字置き場</h1>

                <div class="text-entry">
                  <h3 class="font-kazesawa">外余擺線上のマキナ</h3>
                  <p class="font-kazesawa-light">鋭意執筆中です。</p>
                  <p style="margin-top:1rem;">
                    <a href="mamama.html" class="font-geosans">→ 本編を読む</a>
                  </p>
                </div>

                <a href="../index.html" class="back-link font-geosans">← トップへ</a>
                """;
        return Html.page("字置き場", content, "../");
    }

    // =========================================================
    //  外余擺線上のマキナ（執筆中）
    // =========================================================
    public static String mamamaPage() {
        String content = """
                <h1 class="page-title font-kazesawa">外余擺線上のマキナ</h1>

                <section>
                  <p class="font-kazesawa-light" style="color:#999;">（執筆中）</p>
                </section>

                <a href="index.html" class="back-link font-geosans">← 字置き場へ</a>
                """;
        return Html.page("外余擺線上のマキナ", content, "../");
    }

    // =========================================================
    //  独り言（日記）
    // =========================================================
    public static String diaryPage() {
        StringBuilder entries = new StringBuilder();
        for (DiaryData.Entry e : DiaryData.entries()) {
            entries.append("""
                    <div class="diary-entry">
                      <p class="diary-date font-geosans">%s &mdash; %s</p>
                      <p class="font-kazesawa-light">%s</p>
                    </div>
                    """.formatted(e.date(), e.title(), e.body()));
        }

        String content = """
                <h1 class="page-title font-kazesawa">独り言</h1>

                %s

                <a href="../index.html" class="back-link font-geosans">← トップへ</a>
                """.formatted(entries.toString());

        return Html.page("独り言", content, "../");
    }
}
