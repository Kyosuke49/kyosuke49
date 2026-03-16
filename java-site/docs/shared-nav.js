(function () {

  /* =====================
     翻訳定義
  ===================== */
  var i18n = {
    ja: {
      logo: '偽造切手', logoClass: 'site-logo font-kazesawa',
      art: '絵置き場', music: '曲置き場', text: '字置き場',
      diary: '独り言', pastime: '暇つぶし'
    },
    de: {
      logo: 'LOS 49', logoClass: 'site-logo font-fraktur',
      art: 'Bilder', music: 'Musik', text: 'Romane',
      diary: 'Aufzeichnung', pastime: 'Zeitvertreib'
    },
    fi: {
      logo: 'ERÄ 49', logoClass: 'site-logo font-kazesawa',
      art: 'Kuvat', music: 'Musiikki', text: 'Tekstit',
      diary: 'Päiväkirja', pastime: 'Ajanviete'
    }
  };

  /* =====================
     ヘッダー・フッターHTML注入
  ===================== */
  var headerHTML =
    '<header class="site-header sub-header">' +
    '  <div class="container">' +
    '    <div class="sub-header-inner">' +
    '      <a href="../../../index.html" id="nav-logo" class="site-logo font-kazesawa">偽造切手</a>' +
    '      <nav>' +
    '        <ul>' +
    '          <li><a href="../art/index.html"     id="nav-art">絵置き場</a></li>' +
    '          <li><a href="../music/index.html"   id="nav-music">曲置き場</a></li>' +
    '          <li><a href="../text/index.html"    id="nav-text">字置き場</a></li>' +
    '          <li><a href="../diary/index.html"   id="nav-diary">独り言</a></li>' +
    '          <li><a href="../pastime/index.html" id="nav-pastime">暇つぶし</a></li>' +
    '        </ul>' +
    '      </nav>' +
    '    </div>' +
    '    <div class="sub-lang-switch">' +
    '      <button class="sub-lang-btn" data-lang="ja" onclick="setLang(\'ja\')">日本語</button>' +
    '      <button class="sub-lang-btn" data-lang="de" onclick="setLang(\'de\')">Deutsch</button>' +
    '      <button class="sub-lang-btn" data-lang="fi" onclick="setLang(\'fi\')">Suomi</button>' +
    '    </div>' +
    '  </div>' +
    '</header>';

  var footerHTML =
    '<footer class="site-footer">' +
    '  <p class="font-geosans">&copy; Kyosuke49 &mdash; 偽造切手 / LOS 49 / ER&Auml; 49</p>' +
    '</footer>';

  var headerEl = document.getElementById('shared-header');
  var footerEl = document.getElementById('shared-footer');
  if (headerEl) headerEl.innerHTML = headerHTML;
  if (footerEl) footerEl.innerHTML = footerHTML;

  /* =====================
     言語切替
  ===================== */
  var currentLang = localStorage.getItem('lang') || 'ja';

  function applyLang(lang) {
    var t = i18n[lang] || i18n['ja'];

    /* --- ロゴ --- */
    var logo = document.getElementById('nav-logo');
    if (logo) { logo.textContent = t.logo; logo.className = t.logoClass; }

    /* --- ナビリンク --- */
    var navIds = { 'nav-art': t.art, 'nav-music': t.music, 'nav-text': t.text,
                   'nav-diary': t.diary, 'nav-pastime': t.pastime };
    Object.keys(navIds).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = navIds[id];
    });

    /* --- 言語ボタンのアクティブ状態 --- */
    document.querySelectorAll('.sub-lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    /* --- .lang-block の表示切替 --- */
    document.querySelectorAll('.lang-block[data-lang]').forEach(function (block) {
      block.style.display = block.getAttribute('data-lang') === lang ? 'block' : 'none';
    });
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    applyLang(lang);
  }

  window.setLang = setLang;

  /* =====================
     初期化（DOM構築後に実行）
  ===================== */
  function init() { applyLang(currentLang); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
