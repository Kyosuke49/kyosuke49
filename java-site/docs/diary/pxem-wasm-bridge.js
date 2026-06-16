/**
 * pxem-wasm-bridge.js
 *
 * TeaVM WebAssembly 版 Pxem インタープリターのブリッジ
 *
 * 使い方（GitHub Pages の HTML）:
 *   <script src="pxem.wasm-runtime.js"></script>   ← TeaVM ランタイム
 *   <script src="pxem-wasm-bridge.js"></script>     ← このファイル
 *
 * pxem.wasm は <script> タグと同じディレクトリに置いてください。
 * pxemRun() / pxemClear() を Java WASM 実装に差し替えます。
 */
(function () {
    'use strict';

    // ── 文字列変換ヘルパー ────────────────────────────────────────────────────

    /**
     * JS 文字列 → Java String ポインタ（WASM ヒープ上に確保）
     * TeaVM の dateToString() と同じパターンを使用
     */
    function jsToJavaString(teavm, str) {
        if (str === null || str === undefined) str = '';
        var ptr = teavm.allocateString(str.length);
        if (ptr === 0) throw new Error('WASM ヒープ不足 (allocateString)');
        var rawAddr = teavm.objectArrayData(teavm.stringData(ptr));
        var view = new Uint16Array(teavm.memory.buffer, rawAddr, str.length);
        for (var i = 0; i < str.length; i++) {
            view[i] = str.charCodeAt(i);
        }
        return ptr;
    }

    /**
     * Java String ポインタ → JS 文字列
     * TeaVM の logString() と同じパターンを使用
     */
    function javaToJsString(teavm, ptr) {
        if (ptr === 0) return '';
        var arrayPtr = teavm.stringData(ptr);
        var length   = teavm.arrayLength(arrayPtr);
        var charAddr = teavm.charArrayData(arrayPtr);
        var view     = new Uint16Array(teavm.memory.buffer, charAddr, length);
        var result   = '';
        for (var i = 0; i < length; i++) {
            result += String.fromCharCode(view[i]);
        }
        return result;
    }

    // ── WASM ロード ───────────────────────────────────────────────────────────

    // このスクリプトと同じディレクトリの pxem.wasm を使う
    var basePath = (function () {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].getAttribute('src') || '';
            if (src.indexOf('pxem-wasm-bridge.js') !== -1) {
                return src.substring(0, src.lastIndexOf('/') + 1);
            }
        }
        return '';
    })();

    var wasmPath = basePath + 'pxem.wasm';

    console.log('[Pxem WASM] Loading: ' + wasmPath);

    TeaVM.wasm.load(wasmPath).then(function (teavm) {
        var exports = teavm.instance.exports;

        /**
         * JS 側から呼ぶメイン関数
         * @param {string} name  - ファイル名（メインコード）
         * @param {string} body  - ファイルの中身（サブルーチン）
         * @param {string} stdin - 標準入力
         * @returns {string} 出力文字列、またはエラー時 "ERROR:..."
         */
        window.pxemJavaRun = function (name, body, stdin) {
            try {
                var namePtr  = jsToJavaString(teavm, name);
                var bodyPtr  = jsToJavaString(teavm, body);
                var stdinPtr = jsToJavaString(teavm, stdin);

                var resultPtr = exports.pxemRun(namePtr, bodyPtr, stdinPtr);

                // Java 例外チェック
                var ex = exports.teavm_catchException();
                if (ex !== 0) {
                    return 'ERROR:Java 例外が発生しました';
                }

                return javaToJsString(teavm, resultPtr);
            } catch (e) {
                return 'ERROR:' + (e.message || String(e));
            }
        };

        console.log('[Pxem WASM] Java WASM interpreter ready.');

    }).catch(function (e) {
        console.error('[Pxem WASM] 読み込み失敗:', e);
    });

    // ── UI ブリッジ ────────────────────────────────────────────────────────────
    // pxemRun / pxemClear を Java WASM 実装に差し替える

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
                    throw new Error('WASM がまだ読み込まれていません。しばらく待ってから再実行してください。');
                }
                var result  = window.pxemJavaRun(name, body, stdin);
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
        document.getElementById('pxemName').value         = '';
        document.getElementById('pxemBody').value         = '';
        document.getElementById('pxemStdin').value        = '';
        document.getElementById('pxemOutput').textContent = '----';
        document.getElementById('pxemOutput').className   = 'tool-output muted';
        document.getElementById('pxemStatus').textContent = '';
    }

    window.pxemRun   = pxemRun;
    window.pxemClear = pxemClear;

    console.log('[Pxem WASM] Bridge registered (pxemRun / pxemClear).');
})();
