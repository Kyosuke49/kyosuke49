/* plotter-bridge.js  v3
   多関数・1:1アスペクト比・タップ詳細・交点表示
   依存: plotter-nim.js (nim js コンパイル出力)
*/

(function () {
  'use strict';

  /* ============================================================
     Nim 初期化待ち
  ============================================================ */
  let nimReady = false;

  function waitNim(cb) {
    if (nimReady) { cb(); return; }
    if (typeof evalExpr === 'function') { nimReady = true; cb(); return; }
    const t = setInterval(() => {
      if (typeof evalExpr === 'function') { nimReady = true; clearInterval(t); cb(); }
    }, 30);
  }

  /* ============================================================
     定数
  ============================================================ */
  // キャンバス高さ = 幅 × CANVAS_ASPECT（固定値）
  // これにより resize() と enforceAspect() の循環依存を完全排除する。
  // グラフの 1:1 単位アスペクト比は yRange = xRange × CANVAS_ASPECT で保証。
  const CANVAS_ASPECT = 0.6;   // H/W  (5:3 ランドスケープ)
  const MIN_X_RANGE   = 1e-8;  // ズームインの下限
  const MAX_X_RANGE   = 1e8;   // ズームアウトの上限

  /* ============================================================
     カラーパレット（サイバーパンク）
  ============================================================ */
  const PALETTE = [
    '#00c8f0', // cyan
    '#f07820', // orange
    '#78f040', // lime
    '#f040c8', // magenta
    '#f0c820', // gold
    '#8840f0', // violet
  ];

  /* ============================================================
     状態
  ============================================================ */
  const state = {
    fns: [{ expr: 'sin(x)', color: PALETTE[0], enabled: true, pts: [] }],
    mode: 'plot',
    lang: 'ja',
    viewXMin: -6.28,
    viewXMax:  6.28,
    viewYMin: -1.5,
    viewYMax:  1.5,
    // pan/zoom
    dragging:   false,
    didDrag:    false,
    dragStart:  null,
    pinchDist:  null,
    pinchCenter:null,
    // click detail
    selectedX:  null,
    // canvas size
    cw: 0, ch: 0,
  };

  /* ============================================================
     多言語テキスト
  ============================================================ */
  const T = {
    tabPlot:      { ja: 'グラフ',      de: 'Graph',          fi: 'Kuvaaja'         },
    tabCalc:      { ja: '計算',        de: 'Berechnen',      fi: 'Laske'           },
    tabDiff:      { ja: '微分・積分',   de: 'Diff/Int',       fi: 'Diff/Int'        },
    tabSum:       { ja: '和分・差分',   de: 'Summen',         fi: 'Summat'          },
    addFn:        { ja: '+ 関数を追加', de: '+ Funktion',     fi: '+ Lisää funktio' },
    plotBtn:      { ja: '描画',        de: 'Zeichnen',       fi: 'Piirrä'          },
    resetView:    { ja: 'リセット',    de: 'Reset',          fi: 'Nollaa'          },
    xMinLabel:    { ja: 'x 最小',      de: 'x min',          fi: 'x min'           },
    xMaxLabel:    { ja: 'x 最大',      de: 'x max',          fi: 'x max'           },
    discreteChk:  { ja: '整数 x（離散）', de: 'Diskret (ganzzahliges x)', fi: 'Diskreetti (kokonaisluku x)' },
    xLabel:       { ja: 'x =',        de: 'x =',            fi: 'x ='             },
    calcBtn:      { ja: '計算',        de: 'Berechnen',      fi: 'Laske'           },
    evalLabel:    { ja: 'f(x)',        de: 'f(x)',           fi: 'f(x)'            },
    derivLabel:   { ja: "f'(x)",       de: "f'(x)",          fi: "f'(x)"           },
    deriv2Label:  { ja: "f''(x)",      de: "f''(x)",         fi: "f''(x)"          },
    integLabel:   { ja: '∫ f(x) dx',  de: '∫ f(x) dx',     fi: '∫ f(x) dx'      },
    aLabel:       { ja: '下限 a =',   de: 'Untergrenze a =', fi: 'Alaraja a ='    },
    bLabel:       { ja: '上限 b =',   de: 'Obergrenze b =',  fi: 'Yläraja b ='    },
    integBtn:     { ja: '積分',        de: 'Integrieren',    fi: 'Integroi'        },
    sumLabel:     { ja: 'Σ f(x)',     de: 'Σ f(x)',         fi: 'Σ f(x)'         },
    antidiffLabel:{ ja: '不定和分 F(x)', de: 'Antidifferenz F(x)', fi: 'Antidifferenssi F(x)' },
    deltaLabel:   { ja: 'Δ f(x)',     de: 'Δ f(x)',         fi: 'Δ f(x)'         },
    nablaLabel:   { ja: '∇ f(x)',     de: '∇ f(x)',         fi: '∇ f(x)'         },
    orderLabel:   { ja: '次数 k =',   de: 'Ordnung k =',    fi: 'Aste k ='        },
    sumALabel:    { ja: 'a =',        de: 'a =',            fi: 'a ='             },
    sumBLabel:    { ja: 'b =',        de: 'b =',            fi: 'b ='             },
    sumBtn:       { ja: '定和分',     de: 'Bestimmte Summe', fi: 'Määrätty summa' },
    antidiffBtn:  { ja: '不定和分プロット', de: 'Antidiff. plotten', fi: 'Antidiff. kuvaaja' },
    baseLabel:    { ja: 'F(a)=0、a =', de: 'F(a)=0, a =',  fi: 'F(a)=0, a ='    },
    intersect:    { ja: '交点', de: 'Schnittpunkt', fi: 'Leikkauspiste' },
    tapHint:      { ja: 'グラフをタップ → 詳細', de: 'Graph antippen → Details', fi: 'Napauta kuvaajaa → tiedot' },
    exprLabel:    { ja: 'f(x) =',    de: 'f(x) =',         fi: 'f(x) ='          },
    helpTitle:    { ja: '使い方',     de: 'Hilfe',          fi: 'Ohje'            },
    helpText: {
      ja: `変数: x, n, pi, e, phi, tau
演算: + - * / ^ (べき乗)
関数: sin cos tan sec csc cot asin acos atan
      sinh cosh tanh asinh acosh atanh
      exp ln log log10 log2
      sqrt cbrt abs floor ceil round sgn
      fact(n)  C(n,k)  P(n,k)
      gamma(x) beta(a,b)
      fall(x,n) rise(x,n)
      H(n)  (調和数)
      delta(f(x))   (前進差分 Δ)
      nabla(f(x))   (後退差分 ∇)
      sum(f(x),a,b) (定和分)
      integ(f(x),a,b) (数値積分)
      sinc(x)  heaviside(x)`,
      de: `Variable: x, n, pi, e, phi, tau
Operatoren: + - * / ^ (Potenz)
Funktionen: sin cos tan asin acos atan
            sinh cosh tanh
            exp ln log sqrt abs floor ceil round
            fact(n) C(n,k) gamma(x)`,
      fi: `Muuttujat: x, n, pi, e, phi, tau
Operaattorit: + - * / ^ (potenssi)
Funktiot: sin cos tan asin acos atan
          sinh cosh tanh
          exp ln log sqrt abs floor ceil round
          fact(n) C(n,k) gamma(x)`,
    },
  };

  function t(key) {
    const lang = state.lang;
    if (!T[key]) return key;
    return T[key][lang] || T[key]['ja'] || key;
  }

  /* ============================================================
     パネル構築
  ============================================================ */
  function buildPanel() {
    const body = document.querySelector('#panel-plotter .tool-body');
    if (!body) return;
    body.innerHTML = '';
    body.style.padding = '0.8rem 1rem';

    // ── ヘルプ ──
    const helpRow = div('display:flex;justify-content:flex-end;margin-bottom:0.5rem;');
    const helpBtn = el('button', 'tool-btn', 'padding:0.25rem 0.55rem;font-size:0.65rem;');
    helpBtn.textContent = '?';
    helpBtn.title = t('helpTitle');
    helpBtn.addEventListener('click', toggleHelp);
    helpRow.appendChild(helpBtn);
    body.appendChild(helpRow);

    const helpBox = el('div', '', `
      display:none; background:var(--bg-surface); border:1px solid var(--border);
      border-left:2px solid var(--accent-mid); padding:0.6rem 0.8rem;
      font-family:var(--font-mono); font-size:0.6rem; color:var(--text-dim);
      white-space:pre; line-height:1.75; margin-bottom:0.6rem; overflow-x:auto;
    `);
    helpBox.id = 'pl-help';
    helpBox.textContent = t('helpText');
    body.appendChild(helpBox);

    // ── タブ行 ──
    const tabRow = div('display:flex;gap:0.3rem;margin-bottom:0.8rem;flex-wrap:wrap;');
    [['plot','tabPlot'],['calc','tabCalc'],['diff','tabDiff'],['sum','tabSum']].forEach(([mode, key]) => {
      const btn = el('button', 'lang-btn' + (mode === state.mode ? ' active' : ''), '');
      btn.id = 'pl-tab-' + mode;
      btn.textContent = t(key);
      btn.addEventListener('click', () => switchTab(mode));
      tabRow.appendChild(btn);
    });
    body.appendChild(tabRow);

    // ── TAB: グラフ ──
    const tabPlot = div('');
    tabPlot.id = 'pl-tab-content-plot';

    // 関数リスト
    const fnListWrap = div('margin-bottom:0.6rem;');
    fnListWrap.id = 'pl-fn-list';
    renderFnList(fnListWrap);
    tabPlot.appendChild(fnListWrap);

    // + 追加ボタン
    const addBtn = el('button', 'tool-btn', 'width:100%;margin-bottom:0.6rem;font-size:0.65rem;letter-spacing:0.1em;');
    addBtn.id = 'pl-add-fn';
    addBtn.textContent = t('addFn');
    addBtn.addEventListener('click', addFunction);
    tabPlot.appendChild(addBtn);

    // x 範囲
    const rangeRow = div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.5rem;flex-wrap:wrap;');
    rangeRow.append(
      makeNumInput('pl-xmin', t('xMinLabel'), state.viewXMin, 'flex:1;min-width:75px;'),
      makeNumInput('pl-xmax', t('xMaxLabel'), state.viewXMax, 'flex:1;min-width:75px;'),
    );
    const discLabel = el('label', '', 'display:flex;align-items:center;gap:0.3rem;font-size:0.58rem;color:var(--text-dim);font-family:var(--font-mono);white-space:nowrap;cursor:pointer;');
    const discChk = el('input', '', 'cursor:pointer;');
    discChk.type = 'checkbox';
    discChk.id = 'pl-discrete';
    discLabel.append(discChk, span(t('discreteChk'), ''));
    rangeRow.appendChild(discLabel);
    tabPlot.appendChild(rangeRow);

    // 描画ボタン行
    const plotBtnRow = div('display:flex;gap:0.4rem;margin-bottom:0.6rem;');
    const plotBtn = el('button', 'tool-btn', 'flex:1;text-align:center;letter-spacing:0.1em;');
    plotBtn.id = 'pl-plot-btn';
    plotBtn.textContent = t('plotBtn');
    plotBtn.addEventListener('click', doPlot);
    const resetBtn = el('button', 'tool-btn', 'padding:0.4rem 0.7rem;color:var(--text-dim);');
    resetBtn.id = 'pl-reset-btn';
    resetBtn.textContent = t('resetView');
    resetBtn.addEventListener('click', resetView);
    plotBtnRow.append(plotBtn, resetBtn);
    tabPlot.appendChild(plotBtnRow);

    // キャンバス
    const cvWrap = div('position:relative;background:#090c14;border:1px solid var(--border);margin-bottom:0.4rem;');
    const cv = el('canvas', '', 'display:block;width:100%;cursor:crosshair;touch-action:none;');
    cv.id = 'pl-canvas';
    cvWrap.appendChild(cv);
    const cvCoords = span('', 'position:absolute;top:4px;right:6px;font-family:var(--font-mono);font-size:0.5rem;color:var(--accent-mid);pointer-events:none;background:rgba(9,12,20,0.7);padding:1px 4px;');
    cvCoords.id = 'pl-coords';
    cvWrap.appendChild(cvCoords);
    tabPlot.appendChild(cvWrap);

    // タップ詳細パネル
    const infoBox = div(`
      background:var(--bg-surface); border:1px solid var(--border);
      border-left:2px solid var(--accent-mid); padding:0.4rem 0.7rem;
      font-family:var(--font-mono); font-size:0.6rem; margin-bottom:0.4rem;
      min-height:2rem; display:flex; align-items:center;
    `);
    infoBox.id = 'pl-info';
    infoBox.innerHTML = `<span style="color:var(--text-dim);font-size:0.55rem;letter-spacing:0.08em;">${t('tapHint')}</span>`;
    tabPlot.appendChild(infoBox);

    body.appendChild(tabPlot);

    // ── TAB: 計算 ──
    const tabCalc = div('display:none;');
    tabCalc.id = 'pl-tab-content-calc';

    const xRow = div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.7rem;flex-wrap:wrap;');
    xRow.append(makeNumInput('pl-calc-x', t('xLabel'), 0, 'flex:1;min-width:100px;'));
    const calcBtn2 = el('button', 'tool-btn', '');
    calcBtn2.textContent = t('calcBtn');
    calcBtn2.addEventListener('click', doCalc);
    xRow.appendChild(calcBtn2);
    tabCalc.appendChild(xRow);

    // 式入力（計算タブ用）
    const cExprRow = div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.6rem;');
    const cExprLbl = span(t('exprLabel'), 'font-size:0.65rem;color:var(--accent-mid);font-family:var(--font-mono);white-space:nowrap;');
    const cExprIn = el('input', 'tool-input', 'flex:1;padding:0.4rem 0.6rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;');
    cExprIn.id = 'pl-calc-expr';
    cExprIn.value = state.fns[0] ? state.fns[0].expr : 'sin(x)';
    cExprIn.placeholder = 'sin(x)';
    cExprRow.append(cExprLbl, cExprIn);
    tabCalc.appendChild(cExprRow);

    tabCalc.appendChild(makeResultTable([
      ['pl-res-fx', t('evalLabel')],
    ]));
    body.appendChild(tabCalc);

    // ── TAB: 微分・積分 ──
    const tabDiff = div('display:none;');
    tabDiff.id = 'pl-tab-content-diff';

    const dExprRow = div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.6rem;');
    const dExprLbl = span(t('exprLabel'), 'font-size:0.65rem;color:var(--accent-mid);font-family:var(--font-mono);white-space:nowrap;');
    const dExprIn = el('input', 'tool-input', 'flex:1;padding:0.4rem 0.6rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;');
    dExprIn.id = 'pl-diff-expr';
    dExprIn.value = state.fns[0] ? state.fns[0].expr : 'sin(x)';
    dExprIn.placeholder = 'sin(x)';
    dExprRow.append(dExprLbl, dExprIn);
    tabDiff.appendChild(dExprRow);

    const dxRow = div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.7rem;flex-wrap:wrap;');
    dxRow.append(makeNumInput('pl-diff-x', t('xLabel'), 0, 'flex:1;min-width:100px;'));
    const diffBtn2 = el('button', 'tool-btn', '');
    diffBtn2.textContent = t('calcBtn');
    diffBtn2.addEventListener('click', doDiff);
    dxRow.appendChild(diffBtn2);
    tabDiff.appendChild(dxRow);

    tabDiff.appendChild(makeResultTable([
      ['pl-res-deriv',  t('derivLabel')],
      ['pl-res-deriv2', t('deriv2Label')],
    ]));

    const sep = div('border-top:1px solid var(--border);margin:0.7rem 0;');
    tabDiff.appendChild(sep);

    const iExprRow = div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.6rem;');
    const iExprLbl = span(t('exprLabel'), 'font-size:0.65rem;color:var(--accent-mid);font-family:var(--font-mono);white-space:nowrap;');
    const iExprIn = el('input', 'tool-input', 'flex:1;padding:0.4rem 0.6rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;');
    iExprIn.id = 'pl-integ-expr';
    iExprIn.value = state.fns[0] ? state.fns[0].expr : 'sin(x)';
    iExprIn.placeholder = 'sin(x)';
    iExprRow.append(iExprLbl, iExprIn);
    tabDiff.appendChild(iExprRow);

    const integRow = div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;flex-wrap:wrap;');
    integRow.append(
      makeNumInput('pl-integ-a', t('aLabel'), -1, 'flex:1;min-width:80px;'),
      makeNumInput('pl-integ-b', t('bLabel'),  1, 'flex:1;min-width:80px;'),
    );
    const integBtn2 = el('button', 'tool-btn', '');
    integBtn2.textContent = t('integBtn');
    integBtn2.addEventListener('click', doInteg);
    integRow.appendChild(integBtn2);
    tabDiff.appendChild(integRow);

    tabDiff.appendChild(makeResultTable([
      ['pl-res-integ', t('integLabel')],
    ]));
    body.appendChild(tabDiff);

    // ── TAB: 和分・差分 ──
    const tabSum = div('display:none;');
    tabSum.id = 'pl-tab-content-sum';

    const sExprRow = div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.6rem;');
    const sExprLbl = span(t('exprLabel'), 'font-size:0.65rem;color:var(--accent-mid);font-family:var(--font-mono);white-space:nowrap;');
    const sExprIn = el('input', 'tool-input', 'flex:1;padding:0.4rem 0.6rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;');
    sExprIn.id = 'pl-sum-expr';
    sExprIn.value = state.fns[0] ? state.fns[0].expr : 'sin(x)';
    sExprIn.placeholder = 'x^2';
    sExprRow.append(sExprLbl, sExprIn);
    tabSum.appendChild(sExprRow);

    const sumXRow = div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;flex-wrap:wrap;');
    sumXRow.append(
      makeNumInput('pl-sum-x',     t('xLabel'),     3, 'flex:1;min-width:70px;'),
      makeNumInput('pl-sum-order', t('orderLabel'), 1, 'flex:1;min-width:70px;'),
    );
    const diffSumBtn = el('button', 'tool-btn', '');
    diffSumBtn.textContent = t('calcBtn');
    diffSumBtn.addEventListener('click', doSumCalc);
    sumXRow.appendChild(diffSumBtn);
    tabSum.appendChild(sumXRow);

    tabSum.appendChild(makeResultTable([
      ['pl-res-delta', t('deltaLabel')],
      ['pl-res-nabla', t('nablaLabel')],
    ]));

    const sep2 = div('border-top:1px solid var(--border);margin:0.7rem 0;');
    tabSum.appendChild(sep2);

    const defSumRow = div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;flex-wrap:wrap;');
    defSumRow.append(
      makeNumInput('pl-defsum-a', t('sumALabel'), 0, 'flex:1;min-width:70px;'),
      makeNumInput('pl-defsum-b', t('sumBLabel'), 9, 'flex:1;min-width:70px;'),
    );
    const defSumBtn = el('button', 'tool-btn', '');
    defSumBtn.textContent = t('sumBtn');
    defSumBtn.addEventListener('click', doDefSum);
    defSumRow.appendChild(defSumBtn);
    tabSum.appendChild(defSumRow);

    tabSum.appendChild(makeResultTable([['pl-res-defsum', t('sumLabel')]]));

    const sep3 = div('border-top:1px solid var(--border);margin:0.7rem 0;');
    tabSum.appendChild(sep3);

    const adRow = div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;flex-wrap:wrap;');
    adRow.append(
      makeNumInput('pl-ad-base', t('baseLabel'), 0,  'flex:1;min-width:80px;'),
      makeNumInput('pl-ad-xmax', t('xMaxLabel'),10,  'flex:1;min-width:80px;'),
    );
    const adBtn = el('button', 'tool-btn', 'width:100%;text-align:center;margin-bottom:0.4rem;');
    adBtn.textContent = t('antidiffBtn');
    adBtn.addEventListener('click', doAntiDiffPlot);
    tabSum.appendChild(adRow);
    tabSum.appendChild(adBtn);

    body.appendChild(tabSum);

    // キャンバス初期化
    requestAnimationFrame(() => { initCanvas(); doPlot(); });
  }

  /* ============================================================
     関数リスト UI
  ============================================================ */
  function renderFnList(container) {
    container.innerHTML = '';
    state.fns.forEach((fn, i) => {
      const row = div('display:flex;gap:0.35rem;align-items:center;margin-bottom:0.35rem;');

      // カラースウォッチ（クリックで色変更）
      const swatch = el('div', '', `
        width:14px;height:14px;min-width:14px;border-radius:2px;
        background:${fn.color};cursor:pointer;border:1px solid rgba(255,255,255,0.15);
        flex-shrink:0;
      `);
      swatch.title = '色を変更';
      swatch.addEventListener('click', () => cycleFnColor(i));

      // 式入力
      const inp = el('input', 'tool-input', `
        flex:1;padding:0.35rem 0.55rem;
        background:var(--bg-surface);border:1px solid ${fn.color}55;
        color:var(--text);font-family:var(--font-mono);outline:none;
        border-left:2px solid ${fn.color};
      `);
      inp.placeholder = 'sin(x)';
      inp.value = fn.expr;
      inp.dataset.fnIndex = i;
      inp.addEventListener('input', e => { state.fns[i].expr = e.target.value.trim(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') doPlot(); });

      // 有効/無効トグル
      const tog = el('button', '', `
        padding:0.2rem 0.4rem;font-size:0.6rem;font-family:var(--font-mono);
        background:${fn.enabled ? fn.color + '33' : 'transparent'};
        border:1px solid ${fn.color}88;color:${fn.enabled ? fn.color : 'var(--text-dim)'};
        cursor:pointer;border-radius:2px;
      `);
      tog.textContent = fn.enabled ? '●' : '○';
      tog.title = fn.enabled ? '非表示にする' : '表示する';
      tog.addEventListener('click', () => { fn.enabled = !fn.enabled; renderFnList(container); doPlot(); });

      // 削除ボタン（1関数以上あるときのみ）
      row.append(swatch, inp, tog);
      if (state.fns.length > 1) {
        const rm = el('button', 'tool-btn', 'padding:0.2rem 0.45rem;font-size:0.7rem;color:var(--text-dim);');
        rm.textContent = '✕';
        rm.addEventListener('click', () => { state.fns.splice(i, 1); renderFnList(container); doPlot(); });
        row.appendChild(rm);
      }
      container.appendChild(row);
    });
  }

  function addFunction() {
    const colorIdx = state.fns.length % PALETTE.length;
    state.fns.push({ expr: '', color: PALETTE[colorIdx], enabled: true, pts: [] });
    const list = document.getElementById('pl-fn-list');
    if (list) renderFnList(list);
  }

  function cycleFnColor(i) {
    const cur = PALETTE.indexOf(state.fns[i].color);
    state.fns[i].color = PALETTE[(cur + 1) % PALETTE.length];
    const list = document.getElementById('pl-fn-list');
    if (list) renderFnList(list);
    doPlot();
  }

  /* ============================================================
     UI ヘルパー
  ============================================================ */
  function el(tag, cls, style) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (style) e.style.cssText = style;
    return e;
  }
  function div(style) { return el('div', '', style); }
  function span(text, style) {
    const s = el('span', '', style);
    s.textContent = text;
    return s;
  }

  function makeNumInput(id, label, defVal, wrapStyle) {
    const wrap = div('display:flex;flex-direction:column;gap:0.12rem;' + wrapStyle);
    const lbl = span(label, 'font-size:0.52rem;color:var(--accent-mid);font-family:var(--font-mono);letter-spacing:0.08em;');
    const inp = el('input', 'tool-input', 'padding:0.32rem 0.48rem;');
    inp.type = 'number';
    inp.id = id;
    inp.step = 'any';
    inp.value = defVal;
    wrap.append(lbl, inp);
    return wrap;
  }

  function makeResultTable(rows) {
    const wrap = div('background:var(--bg-surface);border:1px solid var(--border);border-left:2px solid var(--accent-mid);padding:0.45rem 0.7rem;margin-bottom:0.5rem;');
    rows.forEach(([id, label]) => {
      const row = div('display:flex;justify-content:space-between;align-items:baseline;padding:0.2rem 0;border-bottom:1px solid rgba(0,200,240,0.05);');
      const lbl = span(label, 'font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);');
      const val = span('—', 'font-family:var(--font-mono);font-size:0.75rem;color:var(--accent);letter-spacing:0.04em;');
      val.id = id;
      row.append(lbl, val);
      wrap.appendChild(row);
    });
    return wrap;
  }

  function numVal(id, fallback) {
    const e = document.getElementById(id);
    if (!e) return fallback;
    const v = parseFloat(e.value);
    return isNaN(v) ? fallback : v;
  }

  function setResult(id, v) {
    const e = document.getElementById(id);
    if (!e) return;
    if (v === null || v === undefined || isNaN(v)) {
      e.textContent = 'undefined'; e.style.color = 'var(--text-dim)';
    } else if (!isFinite(v)) {
      e.textContent = v > 0 ? '+∞' : '−∞'; e.style.color = 'var(--gold)';
    } else {
      e.textContent = formatNum(v); e.style.color = 'var(--accent)';
    }
  }

  function formatNum(v) {
    if (Math.abs(v) >= 1e10 || (Math.abs(v) < 1e-4 && v !== 0)) return v.toExponential(6);
    const s = v.toPrecision(10);
    if (s.includes('.')) return s.replace(/\.?0+$/, '');
    return s;
  }

  function toggleHelp() {
    const h = document.getElementById('pl-help');
    if (h) h.style.display = h.style.display === 'none' ? 'block' : 'none';
  }

  function switchTab(mode) {
    state.mode = mode;
    ['plot','calc','diff','sum'].forEach(m => {
      const c = document.getElementById('pl-tab-content-' + m);
      const b = document.getElementById('pl-tab-' + m);
      if (c) c.style.display = m === mode ? '' : 'none';
      if (b) b.classList.toggle('active', m === mode);
    });
  }

  /* ============================================================
     キャンバス初期化
  ============================================================ */
  let canvas, ctx;
  let _clickTimer = null;

  function initCanvas() {
    canvas = document.getElementById('pl-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();

    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('mousedown',  onMouseDown);
    canvas.addEventListener('mouseup',    onMouseUp);
    canvas.addEventListener('mouseleave', () => { state.dragging = false; });
    canvas.addEventListener('wheel',      onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd);
    window.addEventListener('resize', () => { resize(); redraw(); });
  }

  function resize() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;
    const W    = rect.width;
    if (!W) return;
    // キャンバス高さは常に W × CANVAS_ASPECT（循環依存なし）
    const H = Math.round(W * CANVAS_ASPECT);
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.height = H + 'px';
    state.cw = canvas.width;
    state.ch = canvas.height;
    // 毎回 setTransform でリセットしてから scale（累積防止）
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  /* ============================================================
     座標変換
  ============================================================ */
  function toScreen(gx, gy) {
    const rect = canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    return {
      sx: (gx - state.viewXMin) / (state.viewXMax - state.viewXMin) * W,
      sy: H - (gy - state.viewYMin) / (state.viewYMax - state.viewYMin) * H,
    };
  }

  function toGraph(sx, sy) {
    const rect = canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    return {
      gx: sx / W * (state.viewXMax - state.viewXMin) + state.viewXMin,
      gy: (H - sy) / H * (state.viewYMax - state.viewYMin) + state.viewYMin,
    };
  }

  /* ============================================================
     描画
  ============================================================ */
  function redraw() {
    drawGraph();
  }

  function drawGraph() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    ctx.clearRect(0, 0, W, H);

    // 背景
    ctx.fillStyle = '#090c14';
    ctx.fillRect(0, 0, W, H);

    const { viewXMin: vxMin, viewXMax: vxMax, viewYMin: vyMin, viewYMax: vyMax } = state;

    drawGridAndAxes(W, H, vxMin, vxMax, vyMin, vyMax);

    const isDiscrete = document.getElementById('pl-discrete') && document.getElementById('pl-discrete').checked;

    // 各関数を描画
    state.fns.forEach(fn => {
      if (!fn.enabled || !fn.pts || fn.pts.length === 0) return;
      if (isDiscrete) {
        drawDiscrete(fn.pts, W, H, vxMin, vxMax, vyMin, vyMax, fn.color);
      } else {
        drawCurve(fn.pts, W, H, vxMin, vxMax, vyMin, vyMax, fn.color);
      }
    });

    // 交点
    const enabledFns = state.fns.filter(f => f.enabled && f.pts && f.pts.length > 0);
    for (let i = 0; i < enabledFns.length; i++) {
      for (let j = i + 1; j < enabledFns.length; j++) {
        const ixs = findIntersections(enabledFns[i].pts, enabledFns[j].pts, enabledFns[i].expr, enabledFns[j].expr);
        drawIntersections(ixs, W, H, vxMin, vxMax, vyMin, vyMax);
      }
    }

    // タップ選択ライン
    if (state.selectedX !== null) {
      drawHairline(state.selectedX, W, H, vxMin, vxMax, vyMin, vyMax);
    }
  }

  /* ============================================================
     グリッド・軸
  ============================================================ */
  function drawGridAndAxes(W, H, vxMin, vxMax, vyMin, vyMax) {
    const xRange = vxMax - vxMin;
    const yRange = vyMax - vyMin;
    const xStep = niceStep(xRange / 8);
    const yStep = niceStep(yRange / 6);
    const fontSize = Math.max(9, Math.min(W * 0.026, 11));

    // グリッド線（薄い）
    ctx.strokeStyle = 'rgba(0,200,240,0.06)';
    ctx.lineWidth = 1;
    for (let x = Math.ceil(vxMin / xStep) * xStep; x <= vxMax + 1e-9; x += xStep) {
      const sx = (x - vxMin) / xRange * W;
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.stroke();
    }
    for (let y = Math.ceil(vyMin / yStep) * yStep; y <= vyMax + 1e-9; y += yStep) {
      const sy = H - (y - vyMin) / yRange * H;
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke();
    }

    // 軸の画面上位置
    const hasXAxis = vyMin < 0 && vyMax > 0;
    const hasYAxis = vxMin < 0 && vxMax > 0;
    const axisY = hasXAxis ? H - (0 - vyMin) / yRange * H : (vyMin >= 0 ? H - 1 : 1);
    const axisX = hasYAxis ? (0 - vxMin) / xRange * W    : (vxMin >= 0 ?     1 : W - 1);

    // x軸
    ctx.strokeStyle = 'rgba(0,200,240,0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(W - 11, axisY); ctx.stroke();
    // x矢印
    ctx.fillStyle = 'rgba(0,200,240,0.65)';
    ctx.beginPath(); ctx.moveTo(W - 11, axisY); ctx.lineTo(W - 18, axisY - 4); ctx.lineTo(W - 18, axisY + 4); ctx.closePath(); ctx.fill();
    // x ラベル
    ctx.fillStyle = 'rgba(0,200,240,0.85)';
    ctx.font = `bold ${fontSize + 1}px "Fira Code", monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('x', W - 10, axisY - 5);

    // y軸
    ctx.strokeStyle = 'rgba(0,200,240,0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(axisX, H); ctx.lineTo(axisX, 11); ctx.stroke();
    // y矢印
    ctx.fillStyle = 'rgba(0,200,240,0.65)';
    ctx.beginPath(); ctx.moveTo(axisX, 11); ctx.lineTo(axisX - 4, 18); ctx.lineTo(axisX + 4, 18); ctx.closePath(); ctx.fill();
    // y ラベル
    ctx.fillStyle = 'rgba(0,200,240,0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('y', axisX, 10);

    // 原点マーク
    if (hasXAxis && hasYAxis) {
      ctx.fillStyle = 'rgba(0,200,240,0.9)';
      ctx.beginPath(); ctx.arc(axisX, axisY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,200,240,0.5)';
      ctx.font = `${fontSize}px "Fira Code", monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('0', axisX - 5, axisY + fontSize + 1);
    }

    // 目盛り
    ctx.font = `${fontSize}px "Fira Code", monospace`;
    ctx.fillStyle = 'rgba(0,200,240,0.42)';
    ctx.strokeStyle = 'rgba(0,200,240,0.38)';
    ctx.lineWidth = 1;

    ctx.textAlign = 'center';
    for (let x = Math.ceil(vxMin / xStep) * xStep; x <= vxMax + 1e-9; x += xStep) {
      if (Math.abs(x) < xStep * 0.01) continue;
      const sx = (x - vxMin) / xRange * W;
      if (sx < 6 || sx > W - 18) continue;
      ctx.beginPath(); ctx.moveTo(sx, axisY - 3); ctx.lineTo(sx, axisY + 3); ctx.stroke();
      const labelY = clamp(axisY + fontSize + 3, fontSize + 2, H - 2);
      ctx.fillText(formatLabel(x), sx, labelY);
    }
    ctx.textAlign = 'right';
    for (let y = Math.ceil(vyMin / yStep) * yStep; y <= vyMax + 1e-9; y += yStep) {
      if (Math.abs(y) < yStep * 0.01) continue;
      const sy = H - (y - vyMin) / yRange * H;
      if (sy < 14 || sy > H - 6) continue;
      ctx.beginPath(); ctx.moveTo(axisX - 3, sy); ctx.lineTo(axisX + 3, sy); ctx.stroke();
      const labelX = clamp(axisX - 5, 32, W - 4);
      ctx.fillText(formatLabel(y), labelX, sy + 3);
    }
  }

  /* ============================================================
     カーブ描画
  ============================================================ */
  function drawCurve(points, W, H, vxMin, vxMax, vyMin, vyMax, color) {
    const xRange = vxMax - vxMin;
    const yRange = vyMax - vyMin;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = color + '66';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    let penDown = false;
    let prevSy = null;
    for (const pt of points) {
      if (pt.y === null || pt.y === undefined || !isFinite(pt.y)) { penDown = false; continue; }
      const sx = (pt.x - vxMin) / xRange * W;
      const sy = H - (pt.y - vyMin) / yRange * H;
      // 不連続（垂直漸近線付近）の検出
      if (penDown && prevSy !== null && Math.abs(sy - prevSy) > H * 1.5) {
        penDown = false;
      }
      if (!penDown) { ctx.moveTo(sx, sy); penDown = true; }
      else ctx.lineTo(sx, sy);
      prevSy = sy;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawDiscrete(points, W, H, vxMin, vxMax, vyMin, vyMax, color) {
    const xRange = vxMax - vxMin;
    const yRange = vyMax - vyMin;
    const yZero = H - (0 - vyMin) / yRange * H;
    ctx.shadowColor = color + '88';
    ctx.shadowBlur = 5;
    for (const pt of points) {
      if (pt.y === null || !isFinite(pt.y)) continue;
      const sx = (pt.x - vxMin) / xRange * W;
      const sy = H - (pt.y - vyMin) / yRange * H;
      ctx.strokeStyle = color + '66';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(sx, yZero); ctx.lineTo(sx, sy); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  /* ============================================================
     交点検出・描画
  ============================================================ */
  function findIntersections(pts1, pts2, expr1, expr2) {
    const result = [];
    if (!pts1.length || !pts2.length) return result;

    // x 座標のマップを作成（pts1 のxに対してpts2を線形補間）
    const map2 = new Map();
    pts2.forEach(p => { if (p.y !== null && isFinite(p.y)) map2.set(p.x, p.y); });

    // pts1 を x でループし、差分の符号変化を検出
    let prev = null;
    for (const p of pts1) {
      if (p.y === null || !isFinite(p.y)) { prev = null; continue; }
      const y2 = map2.get(p.x);
      if (y2 === undefined || !isFinite(y2)) { prev = null; continue; }
      const diff = p.y - y2;
      if (prev !== null && prev.diff * diff < 0) {
        // 符号変化 → 二分法で精度向上
        const ix = bisectIntersect(expr1, expr2, prev.x, p.x);
        if (ix !== null) result.push(ix);
      }
      prev = { x: p.x, y: p.y, diff };
    }
    return result;
  }

  function bisectIntersect(expr1, expr2, xa, xb) {
    try {
      for (let i = 0; i < 30; i++) {
        const xm = (xa + xb) / 2;
        const fa = evalExpr(expr1, xa) - evalExpr(expr2, xa);
        const fm = evalExpr(expr1, xm) - evalExpr(expr2, xm);
        if (Math.abs(xb - xa) < 1e-8) {
          const y1 = evalExpr(expr1, xm);
          const y2 = evalExpr(expr2, xm);
          return { x: xm, y: (y1 + y2) / 2 };
        }
        if (fa * fm <= 0) xb = xm; else xa = xm;
      }
      const xm = (xa + xb) / 2;
      return { x: xm, y: (evalExpr(expr1, xm) + evalExpr(expr2, xm)) / 2 };
    } catch { return null; }
  }

  function drawIntersections(ixs, W, H, vxMin, vxMax, vyMin, vyMax) {
    const xRange = vxMax - vxMin;
    const yRange = vyMax - vyMin;
    ixs.forEach(ix => {
      if (ix.x < vxMin || ix.x > vxMax || ix.y < vyMin || ix.y > vyMax) return;
      const sx = (ix.x - vxMin) / xRange * W;
      const sy = H - (ix.y - vyMin) / yRange * H;
      // 白いリング
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(255,255,255,0.7)';
      ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;
      // 座標ラベル
      const label = `(${formatLabel(ix.x)}, ${formatLabel(ix.y)})`;
      const fontSize = 9;
      ctx.font = `${fontSize}px "Fira Code", monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      const lx = clamp(sx + 7, 4, W - label.length * 5.5 - 4);
      const ly = clamp(sy - 7, fontSize + 2, H - 2);
      ctx.fillText(label, lx, ly);
    });
  }

  /* ============================================================
     タップ詳細（ヘアライン）
  ============================================================ */
  function drawHairline(gx, W, H, vxMin, vxMax, vyMin, vyMax) {
    const xRange = vxMax - vxMin;
    const yRange = vyMax - vyMin;
    if (gx < vxMin || gx > vxMax) return;
    const sx = (gx - vxMin) / xRange * W;

    // 垂直点線
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.stroke();
    ctx.setLineDash([]);

    // 各関数の交点に丸を描く
    const enabledFns = state.fns.filter(f => f.enabled && f.pts && f.pts.length > 0);
    enabledFns.forEach(fn => {
      const y = evalExprSafe(fn.expr, gx);
      if (y === null) return;
      const sy = H - (y - vyMin) / yRange * H;
      if (sy < 0 || sy > H) return;
      ctx.fillStyle = fn.color;
      ctx.shadowColor = fn.color + 'aa';
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function evalExprSafe(expr, x) {
    try {
      const v = evalExpr(expr, x);
      return (isFinite(v) && !isNaN(v)) ? v : null;
    } catch { return null; }
  }

  function updateInfoBox(gx) {
    const box = document.getElementById('pl-info');
    if (!box) return;
    if (gx === null) {
      box.innerHTML = `<span style="color:var(--text-dim);font-size:0.55rem;letter-spacing:0.08em;">${t('tapHint')}</span>`;
      return;
    }
    const enabledFns = state.fns.filter(f => f.enabled);
    let html = `<span style="color:var(--accent-mid);font-family:var(--font-mono);font-size:0.58rem;">x = <b style="color:var(--text)">${formatLabel(gx)}</b></span>`;
    html += `<span style="display:flex;gap:0.8rem;flex-wrap:wrap;margin-left:0.8rem;">`;
    enabledFns.forEach(fn => {
      const y = evalExprSafe(fn.expr, gx);
      const yStr = y === null ? 'undef' : formatLabel(y);
      html += `<span style="font-family:var(--font-mono);font-size:0.58rem;">
        <span style="color:${fn.color};">■</span>
        <span style="color:var(--text-dim);">${fn.expr || '?'}</span>
        <span style="color:${fn.color};">= ${yStr}</span>
      </span>`;
    });
    html += `</span>`;
    box.style.display = 'flex';
    box.style.alignItems = 'center';
    box.style.flexWrap = 'wrap';
    box.style.gap = '0.3rem';
    box.innerHTML = html;
  }

  /* ============================================================
     イベント
  ============================================================ */
  function onMouseDown(e) {
    state.dragging  = true;
    state.didDrag   = false;
    const rect = canvas.getBoundingClientRect();
    state.dragStart = {
      x: e.clientX, y: e.clientY,
      vxMin: state.viewXMin, vxMax: state.viewXMax,
      vyMin: state.viewYMin, vyMax: state.viewYMax,
    };
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const g = toGraph(mx, my);
    const coords = document.getElementById('pl-coords');
    if (coords) coords.textContent = `(${formatLabel(g.gx)}, ${formatLabel(g.gy)})`;

    if (state.dragging && state.dragStart) {
      const dx = e.clientX - state.dragStart.x;
      const dy = e.clientY - state.dragStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) state.didDrag = true;
      const W = rect.width, H = rect.height;
      const xRange = state.dragStart.vxMax - state.dragStart.vxMin;
      const yRange = state.dragStart.vyMax - state.dragStart.vyMin;
      state.viewXMin = state.dragStart.vxMin - dx / W * xRange;
      state.viewXMax = state.dragStart.vxMax - dx / W * xRange;
      state.viewYMin = state.dragStart.vyMin + dy / H * yRange;
      state.viewYMax = state.dragStart.vyMax + dy / H * yRange;
      redraw();
    }
  }

  function onMouseUp(e) {
    if (!state.didDrag) {
      // クリック（ドラッグなし）→ 詳細表示
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const g = toGraph(mx, my);
      if (state.selectedX === g.gx) {
        state.selectedX = null; updateInfoBox(null);
      } else {
        state.selectedX = g.gx; updateInfoBox(g.gx);
      }
      redraw();
    }
    state.dragging = false;
    state.didDrag  = false;
  }

  function onWheel(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const g = toGraph(mx, my);
    const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
    zoom(g.gx, g.gy, factor);
  }

  function zoom(cx, cy, factor) {
    if (!isFinite(cx) || !isFinite(cy) || !isFinite(factor) || factor <= 0) return;
    const newXMin   = cx + (state.viewXMin - cx) * factor;
    const newXMax   = cx + (state.viewXMax - cx) * factor;
    const newXRange = newXMax - newXMin;
    // 範囲の上下限でクランプ（極端なズームでNaN/Inf防止）
    if (!isFinite(newXRange) || newXRange < MIN_X_RANGE || newXRange > MAX_X_RANGE) return;
    state.viewXMin = newXMin;
    state.viewXMax = newXMax;
    // y も同じ factor・同じ中心点でズーム → 1:1 が自動維持される
    state.viewYMin = cy + (state.viewYMin - cy) * factor;
    state.viewYMax = cy + (state.viewYMax - cy) * factor;
    // 数値誤差の蓄積を防ぐために毎回厳密に再計算
    enforceAspect();
    redraw(); // resize は不要（キャンバス高さは固定）
  }

  let _touchStartX = null, _touchStartY = null;

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      state.dragging = true;
      state.didDrag  = false;
      const t0 = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      _touchStartX = t0.clientX - rect.left;
      _touchStartY = t0.clientY - rect.top;
      state.dragStart = {
        x: t0.clientX, y: t0.clientY,
        vxMin: state.viewXMin, vxMax: state.viewXMax,
        vyMin: state.viewYMin, vyMax: state.viewYMax,
      };
    } else if (e.touches.length === 2) {
      state.dragging = false;
      state.pinchDist = pinchDistance(e.touches);
      state.pinchCenter = pinchCenter(e.touches, canvas.getBoundingClientRect());
    }
    e.preventDefault();
  }

  function onTouchMove(e) {
    if (e.touches.length === 1 && state.dragging && state.dragStart) {
      const t0 = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const dx = t0.clientX - state.dragStart.x;
      const dy = t0.clientY - state.dragStart.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) state.didDrag = true;
      const W = rect.width, H = rect.height;
      const xRange = state.dragStart.vxMax - state.dragStart.vxMin;
      const yRange = state.dragStart.vyMax - state.dragStart.vyMin;
      state.viewXMin = state.dragStart.vxMin - dx / W * xRange;
      state.viewXMax = state.dragStart.vxMax - dx / W * xRange;
      state.viewYMin = state.dragStart.vyMin + dy / H * yRange;
      state.viewYMax = state.dragStart.vyMax + dy / H * yRange;
      redraw();
    } else if (e.touches.length === 2 && state.pinchDist) {
      const d = pinchDistance(e.touches);
      const factor = state.pinchDist / d;
      state.pinchDist = d;
      const c = state.pinchCenter;
      zoom(c.gx, c.gy, factor);
    }
    e.preventDefault();
  }

  function onTouchEnd(e) {
    if (!state.didDrag && e.changedTouches.length === 1) {
      const t0 = e.changedTouches[0];
      const rect = canvas.getBoundingClientRect();
      const mx = t0.clientX - rect.left;
      const my = t0.clientY - rect.top;
      const g = toGraph(mx, my);
      state.selectedX = g.gx;
      updateInfoBox(g.gx);
      redraw();
    }
    state.dragging  = false;
    state.didDrag   = false;
    state.pinchDist = null;
  }

  function pinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function pinchCenter(touches, rect) {
    const mx = (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
    const my = (touches[0].clientY + touches[1].clientY) / 2 - rect.top;
    return toGraph(mx, my);
  }

  /* ============================================================
     1:1 アスペクト比の強制
     yRange = xRange × CANVAS_ASPECT を常に成立させる。
     循環依存を避けるため H の近似は一切使わない。
  ============================================================ */
  function enforceAspect() {
    const xRange = state.viewXMax - state.viewXMin;
    if (!isFinite(xRange) || xRange <= 0) return;
    const yRange  = xRange * CANVAS_ASPECT;
    let   yCen    = (state.viewYMin + state.viewYMax) / 2;
    if (!isFinite(yCen)) yCen = 0;
    state.viewYMin = yCen - yRange / 2;
    state.viewYMax = yCen + yRange / 2;
  }

  /* ============================================================
     プロット操作
  ============================================================ */
  function doPlot() {
    waitNim(() => {
      const xMin = numVal('pl-xmin', state.viewXMin);
      const xMax = numVal('pl-xmax', state.viewXMax);
      if (xMin >= xMax) return;
      state.viewXMin = xMin;
      state.viewXMax = xMax;

      const isDiscrete = document.getElementById('pl-discrete') && document.getElementById('pl-discrete').checked;

      // 各関数のプロット点を取得
      state.fns.forEach(fn => {
        if (!fn.expr) { fn.pts = []; return; }
        if (isDiscrete) {
          fn.pts = nimGetDiscrete(fn.expr, xMin, xMax);
        } else {
          fn.pts = nimGetPlot(fn.expr, xMin, xMax, 800);
        }
      });

      // y 範囲の自動決定（有効な全関数から）
      const allYs = state.fns
        .filter(f => f.enabled && f.pts)
        .flatMap(f => f.pts.map(p => p.y))
        .filter(y => y !== null && y !== undefined && isFinite(y));

      let yCen, yHalf;
      if (allYs.length === 0) { yCen = 0; yHalf = 1; }
      else {
        const mn = Math.min(...allYs);
        const mx = Math.max(...allYs);
        yCen  = (mn + mx) / 2;
        yHalf = (mx - mn) / 2 || 1;
        yHalf *= 1.15;
      }
      // y 中心を関数値から求め、yRange は xRange × CANVAS_ASPECT で確定
      const xRangeNew = xMax - xMin;
      const yRangeNew = xRangeNew * CANVAS_ASPECT;
      const safeYCen  = isFinite(yCen) ? yCen : 0;
      state.viewYMin  = safeYCen - yRangeNew / 2;
      state.viewYMax  = safeYCen + yRangeNew / 2;

      state.selectedX = null;
      updateInfoBox(null);
      redraw();
    });
  }

  function resetView() {
    state.viewXMin = numVal('pl-xmin', -6.28);
    state.viewXMax = numVal('pl-xmax',  6.28);
    state.selectedX = null;
    updateInfoBox(null);
    enforceAspect(); // viewYMin/Max を xRange に合わせて計算
    doPlot();
  }

  function doCalc() {
    waitNim(() => {
      const expr = (document.getElementById('pl-calc-expr') || {}).value || (state.fns[0] && state.fns[0].expr) || '';
      const x = numVal('pl-calc-x', 0);
      setResult('pl-res-fx', evalExpr(expr, x));
    });
  }

  function doDiff() {
    waitNim(() => {
      const expr = (document.getElementById('pl-diff-expr') || {}).value || (state.fns[0] && state.fns[0].expr) || '';
      const x = numVal('pl-diff-x', 0);
      setResult('pl-res-deriv',  getDeriv(expr, x));
      setResult('pl-res-deriv2', getSecondDeriv(expr, x));
    });
  }

  function doInteg() {
    waitNim(() => {
      const expr = (document.getElementById('pl-integ-expr') || {}).value || (state.fns[0] && state.fns[0].expr) || '';
      const a = numVal('pl-integ-a', -1);
      const b = numVal('pl-integ-b',  1);
      setResult('pl-res-integ', getIntegral(expr, a, b));
    });
  }

  function doSumCalc() {
    waitNim(() => {
      const expr = (document.getElementById('pl-sum-expr') || {}).value || (state.fns[0] && state.fns[0].expr) || '';
      const x     = numVal('pl-sum-x', 3);
      const order = Math.max(1, Math.round(numVal('pl-sum-order', 1)));
      setResult('pl-res-delta', getForwardDiff(expr, x, order));
      setResult('pl-res-nabla', getBackwardDiff(expr, x, order));
    });
  }

  function doDefSum() {
    waitNim(() => {
      const expr = (document.getElementById('pl-sum-expr') || {}).value || (state.fns[0] && state.fns[0].expr) || '';
      const a = Math.round(numVal('pl-defsum-a', 0));
      const b = Math.round(numVal('pl-defsum-b', 9));
      setResult('pl-res-defsum', getDefiniteSum(expr, a, b));
    });
  }

  function doAntiDiffPlot() {
    waitNim(() => {
      const expr  = (document.getElementById('pl-sum-expr') || {}).value || (state.fns[0] && state.fns[0].expr) || '';
      const base  = Math.round(numVal('pl-ad-base', 0));
      const xMaxA = Math.round(numVal('pl-ad-xmax', 10));
      // 不定和分を既存のfns[0]に追加（または新規）
      const adPts = nimGetAntiDiff(expr, base, xMaxA, base);
      const mainPts = nimGetPlot(expr, base - 1, xMaxA + 1, 600);

      // メイン関数を更新
      if (state.fns[0]) state.fns[0].pts = mainPts;
      // 不定和分を別関数として追加（すでに存在しなければ）
      let adFn = state.fns.find(f => f._isAntiDiff);
      if (!adFn) {
        adFn = { expr: '(不定和分)', color: '#c8a84a', enabled: true, pts: [], _isAntiDiff: true };
        state.fns.push(adFn);
        const list = document.getElementById('pl-fn-list');
        if (list) renderFnList(list);
      }
      adFn.pts = adPts;

      const allYs = [...mainPts, ...adPts].map(p => p.y).filter(y => y !== null && isFinite(y));
      if (allYs.length > 0) {
        const mn = Math.min(...allYs), mx = Math.max(...allYs);
        const yCen = (mn + mx) / 2, yHalf = (mx - mn) / 2 * 1.15 || 1;
        state.viewYMin = yCen - yHalf;
        state.viewYMax = yCen + yHalf;
      }
      state.viewXMin = base - 1;
      state.viewXMax = xMaxA + 1;
      enforceAspect();
      resize();
      redraw();
    });
  }

  /* ============================================================
     Nim ラッパー
  ============================================================ */
  function nimGetPlot(expr, xMin, xMax, steps) {
    try { return JSON.parse(getPlotPoints(expr, xMin, xMax, steps)); }
    catch { return []; }
  }
  function nimGetDiscrete(expr, xMin, xMax) {
    try { return JSON.parse(getDiscretePlotPoints(expr, xMin, xMax)); }
    catch { return []; }
  }
  function nimGetAntiDiff(expr, xMin, xMax, base) {
    try { return JSON.parse(getAntiDiffPoints(expr, xMin, xMax, base)); }
    catch { return []; }
  }

  /* ============================================================
     ユーティリティ
  ============================================================ */
  function niceStep(rough) {
    if (rough <= 0) return 1;
    const exp  = Math.floor(Math.log10(rough));
    const frac = rough / Math.pow(10, exp);
    let nice;
    if (frac < 1.5) nice = 1;
    else if (frac < 3.5) nice = 2;
    else if (frac < 7.5) nice = 5;
    else nice = 10;
    return nice * Math.pow(10, exp);
  }

  function formatLabel(v) {
    if (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0)) return v.toExponential(1);
    return String(parseFloat(v.toPrecision(4)));
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ============================================================
     言語切替（外部から呼ばれる）
  ============================================================ */
  window.plotterSetLang = function (lang) {
    state.lang = lang;
    const ids = [
      ['pl-tab-plot', 'tabPlot'], ['pl-tab-calc', 'tabCalc'],
      ['pl-tab-diff', 'tabDiff'], ['pl-tab-sum',  'tabSum'],
      ['pl-plot-btn', 'plotBtn'], ['pl-reset-btn','resetView'],
      ['pl-add-fn',   'addFn'],
    ];
    ids.forEach(([id, key]) => {
      const e = document.getElementById(id);
      if (e) e.textContent = t(key);
    });
    const help = document.getElementById('pl-help');
    if (help) help.textContent = t('helpText');
  };

  /* ============================================================
     公開 API
  ============================================================ */
  window.initPlotter = function (lang) {
    state.lang = lang || 'ja';
    buildPanel();
  };

})();
