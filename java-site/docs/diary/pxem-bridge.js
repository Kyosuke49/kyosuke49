/**
 * pxem-bridge.js
 *
 * Java版 Pxem インタープリターの UI ブリッジ
 *
 * 使い方（GitHub Pages の HTML）:
 *   <script src="pxem-java.js"></script>       ← TeaVM が生成したファイル
 *   <script src="pxem-bridge.js"></script>     ← このファイル
 *
 * pxemRun() / pxemClear() が Java 実装を使うように上書きされます。
 * 既存の HTML の id 属性はそのまま維持できます。
 */
(function () {
    'use strict';

    function pxemRun() {
        var name  = (document.getElementById('pxemName')  || {}).value || '';
        var body  = (document.getElementById('pxemBody')  || {}).value || '';
        var stdin = (document.getElementById('pxemStdin') || {}).value || '';
        var outEl = document.getElementById('pxemOutput');
        var stEl  = document.getElementById('pxemStatus');
        var btn   = document.getElementById('pxemRunBtn');

        if (!name.trim()) {
            outEl.textContent = 'ファイル名を入力してください。';
            outEl.className   = 'tool-output muted';
            return;
        }

        btn.disabled    = true;
        btn.textContent = '▶ 実行中…';
        stEl.textContent = '';

        setTimeout(function () {
            try {
                if (typeof window.pxemJavaRun !== 'function') {
                    throw new Error('Java インタープリターがまだ読み込まれていません。しばらく待ってから再実行してください。');
                }
                var result = window.pxemJavaRun(name, body, stdin);
                var isError = typeof result === 'string' && result.indexOf('ERROR:') === 0;
                if (isError) {
                    outEl.textContent = 'エラー: ' + result.substring(6);
                    outEl.className   = 'tool-output muted';
                    stEl.textContent  = 'ERR';
                    stEl.style.color  = '#e83929';
                } else {
                    var hasOutput = result && result.length > 0;
                    outEl.textContent = hasOutput ? result : '（出力なし）';
                    outEl.className   = hasOutput ? 'tool-output' : 'tool-output muted';
                    stEl.textContent  = 'OK';
                    stEl.style.color  = 'var(--accent)';
                }
            } catch (err) {
                outEl.textContent = 'エラー: ' + err.message;
                outEl.className   = 'tool-output muted';
                stEl.textContent  = 'ERR';
                stEl.style.color  = '#e83929';
            } finally {
                btn.disabled    = false;
                btn.textContent = '▶ 実行';
            }
        }, 0);
    }

    function pxemClear() {
        document.getElementById('pxemName').value        = '';
        document.getElementById('pxemBody').value        = '';
        document.getElementById('pxemStdin').value       = '';
        document.getElementById('pxemOutput').textContent = '----';
        document.getElementById('pxemOutput').className  = 'tool-output muted';
        document.getElementById('pxemStatus').textContent = '';
    }

    window.pxemRun   = pxemRun;
    window.pxemClear = pxemClear;

    console.log('[Pxem] Java bridge loaded. Waiting for pxem-java.js to initialize...');
})();
