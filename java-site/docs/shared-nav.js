(function () {
  var headerHTML =
    '<header class="site-header sub-header">' +
    '  <div class="container sub-header-inner">' +
    '    <a href="../../../index.html" class="site-logo font-kazesawa">偽造切手</a>' +
    '    <nav>' +
    '      <ul>' +
    '        <li><a href="../art/index.html">絵置き場</a></li>' +
    '        <li><a href="../music/index.html">曲置き場</a></li>' +
    '        <li><a href="../text/index.html">字置き場</a></li>' +
    '        <li><a href="../diary/index.html">独り言</a></li>' +
    '        <li><a href="../pastime/index.html">暇つぶし</a></li>' +
    '      </ul>' +
    '    </nav>' +
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
})();
