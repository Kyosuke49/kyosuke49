(function () {
  var headerHTML =
    '<header class="site-header sub-header">' +
    '  <div class="container">' +
    '    <div class="sub-header-inner">' +
    '      <a href="../../../index.html" class="site-logo font-kazesawa">偽造切手</a>' +
    '      <nav>' +
    '        <ul>' +
    '          <li><a href="../art/index.html">絵置き場</a></li>' +
    '          <li><a href="../music/index.html">曲置き場</a></li>' +
    '          <li><a href="../text/index.html">字置き場</a></li>' +
    '          <li><a href="../diary/index.html">独り言</a></li>' +
    '          <li><a href="../pastime/index.html">暇つぶし</a></li>' +
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

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    document.querySelectorAll('.sub-lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    document.querySelectorAll('.lang-block[data-lang]').forEach(function (block) {
      block.style.display = block.getAttribute('data-lang') === lang ? 'block' : 'none';
    });
  }

  window.setLang = setLang;

  document.addEventListener('DOMContentLoaded', function () {
    setLang(currentLang);
  });

  if (document.readyState !== 'loading') {
    setLang(currentLang);
  }
})();
