/* plotter-bridge.js  v4
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
    const ti = setInterval(() => {
      if (typeof evalExpr === 'function') { nimReady = true; clearInterval(ti); cb(); }
    }, 30);
  }

  /* ============================================================
     定数
  ============================================================ */
  const CANVAS_ASPECT = 0.6;   // canvas H/W (固定、循環依存なし)
  const MIN_X_RANGE   = 1e-8;
  const MAX_X_RANGE   = 1e8;

  /* ============================================================
     記号計算エンジン (Symbolic CAS)
     parse(str) → AST  →  diff(AST) / integ(AST)  →  print(AST)
  ============================================================ */
  const _sym = (() => {
    const N=(v)=>({t:'n',v:+v}); const X=()=>({t:'x'});
    const Add=(l,r)=>({t:'+',l,r}); const Sub=(l,r)=>({t:'-',l,r});
    const Mul=(l,r)=>({t:'*',l,r}); const Div=(l,r)=>({t:'/',l,r});
    const Pow=(b,e)=>({t:'^',b,e}); const Neg=(u)=>({t:'neg',u});
    const Fun=(f,a)=>({t:'fn',f,a});
    const CONSTS={pi:Math.PI,e:Math.E,tau:2*Math.PI,phi:(1+Math.sqrt(5))/2};

    function tok(s){
      const ts=[];let i=0;
      while(i<s.length){
        if(/\s/.test(s[i])){i++;continue;}
        if(/[0-9]/.test(s[i])||(s[i]==='.'&&/[0-9]/.test(s[i+1]||''))){
          let j=i;while(j<s.length&&/[0-9.]/.test(s[j]))j++;
          if(j<s.length&&(s[j]==='e'||s[j]==='E')){j++;if(j<s.length&&(s[j]==='+'||s[j]==='-'))j++;while(j<s.length&&/[0-9]/.test(s[j]))j++;}
          ts.push(['n',parseFloat(s.slice(i,j))]);i=j;
        }else if(/[a-zA-Z_]/.test(s[i])){
          let j=i;while(j<s.length&&/[a-zA-Z0-9_]/.test(s[j]))j++;
          ts.push(['w',s.slice(i,j)]);i=j;
        }else{ts.push([s[i],s[i]]);i++;}
      }
      ts.push(['$','']);return ts;
    }

    function parse(s){
      const ts=tok(s||'0');let p=0;
      const peek=()=>ts[p][0], eat=()=>ts[p++];
      const ex1=k=>{if(ts[p][0]!==k)throw 0;return eat();};
      function expr(){return add();}
      function add(){let n=mul();while(peek()==='+'||peek()==='-'){const op=eat()[0];const r=mul();n=op==='+'?Add(n,r):Sub(n,r);}return n;}
      function mul(){let n=una();while(peek()==='*'||peek()==='/'){const op=eat()[0];const r=una();n=op==='*'?Mul(n,r):Div(n,r);}return n;}
      function una(){if(peek()==='-'){eat();return Neg(una());}return pw();}
      function pw(){const b=atm();if(peek()==='^'){eat();return Pow(b,una());}return b;}
      function atm(){
        const[k,v]=ts[p];
        if(k==='n'){eat();return N(v);}
        if(k==='('){eat();const e=expr();ex1(')');return e;}
        if(k==='w'){eat();if(CONSTS[v]!==undefined)return N(CONSTS[v]);if(v==='x'||v==='n'||v==='k')return X();if(peek()==='('){eat();const a=expr();ex1(')');return Fun(v,a);}return X();}
        return N(0);
      }
      try{return expr();}catch{return N(0);}
    }

    function simp(n){
      if(!n)return N(0);
      switch(n.t){
        case 'n':case 'x':return n;
        case '+':{const l=simp(n.l),r=simp(n.r);if(l.t==='n'&&r.t==='n')return N(l.v+r.v);if(l.t==='n'&&l.v===0)return r;if(r.t==='n'&&r.v===0)return l;if(r.t==='neg')return simp(Sub(l,r.u));return Add(l,r);}
        case '-':{const l=simp(n.l),r=simp(n.r);if(l.t==='n'&&r.t==='n')return N(l.v-r.v);if(r.t==='n'&&r.v===0)return l;if(l.t==='n'&&l.v===0)return simp(Neg(r));if(pr(l)===pr(r))return N(0);return Sub(l,r);}
        case '*':{const l=simp(n.l),r=simp(n.r);if(l.t==='n'&&r.t==='n')return N(l.v*r.v);if((l.t==='n'&&l.v===0)||(r.t==='n'&&r.v===0))return N(0);if(l.t==='n'&&l.v===1)return r;if(r.t==='n'&&r.v===1)return l;if(l.t==='n'&&l.v===-1)return simp(Neg(r));if(r.t==='n'&&r.v===-1)return simp(Neg(l));return Mul(l,r);}
        case '/':{const l=simp(n.l),r=simp(n.r);if(l.t==='n'&&r.t==='n'&&r.v!==0)return N(l.v/r.v);if(l.t==='n'&&l.v===0)return N(0);if(r.t==='n'&&r.v===1)return l;if(pr(l)===pr(r))return N(1);return Div(l,r);}
        case '^':{const b=simp(n.b),e=simp(n.e);if(b.t==='n'&&e.t==='n'){const v=Math.pow(b.v,e.v);if(isFinite(v))return N(v);}if(e.t==='n'&&e.v===0)return N(1);if(e.t==='n'&&e.v===1)return b;if(b.t==='n'&&b.v===1)return N(1);return Pow(b,e);}
        case 'neg':{const u=simp(n.u);if(u.t==='n')return N(-u.v);if(u.t==='neg')return u.u;return Neg(u);}
        case 'fn':{
          const a=simp(n.a);
          if(a.t==='n'){try{const fs={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,exp:Math.exp,ln:Math.log,log:x=>Math.log10(x),log2:Math.log2,sqrt:Math.sqrt,cbrt:Math.cbrt,abs:Math.abs};if(fs[n.f]){const v=fs[n.f](a.v);if(isFinite(v))return N(v);}}catch{}}
          return Fun(n.f,a);
        }
        default:return n;
      }
    }
    function pr(n){return print(n,99);}

    function diff(n){
      if(!n)return N(0);
      switch(n.t){
        case 'n':return N(0);
        case 'x':return N(1);
        case '+':return simp(Add(diff(n.l),diff(n.r)));
        case '-':return simp(Sub(diff(n.l),diff(n.r)));
        case 'neg':return simp(Neg(diff(n.u)));
        case '*':return simp(Add(Mul(diff(n.l),n.r),Mul(n.l,diff(n.r))));
        case '/':return simp(Div(Sub(Mul(diff(n.l),n.r),Mul(n.l,diff(n.r))),Pow(n.r,N(2))));
        case '^':{
          const{b,e}=n;
          if(e.t==='n')return simp(Mul(Mul(N(e.v),Pow(b,N(e.v-1))),diff(b)));
          if(b.t==='n')return simp(Mul(Mul(Pow(b,e),Fun('ln',b)),diff(e)));
          return simp(Mul(Pow(b,e),Add(Mul(diff(e),Fun('ln',b)),Mul(e,Div(diff(b),b)))));
        }
        case 'fn':{
          const{f,a}=n,da=diff(a);
          let df;
          switch(f){
            case 'sin': df=Fun('cos',a);break;
            case 'cos': df=Neg(Fun('sin',a));break;
            case 'tan': df=Div(N(1),Pow(Fun('cos',a),N(2)));break;
            case 'asin':df=Div(N(1),Fun('sqrt',Sub(N(1),Pow(a,N(2)))));break;
            case 'acos':df=Neg(Div(N(1),Fun('sqrt',Sub(N(1),Pow(a,N(2))))));break;
            case 'atan':df=Div(N(1),Add(N(1),Pow(a,N(2))));break;
            case 'sinh':df=Fun('cosh',a);break;
            case 'cosh':df=Fun('sinh',a);break;
            case 'tanh':df=Div(N(1),Pow(Fun('cosh',a),N(2)));break;
            case 'exp': df=Fun('exp',a);break;
            case 'ln':  df=Div(N(1),a);break;
            case 'log': df=Div(N(1),Mul(Fun('ln',N(10)),a));break;
            case 'log2':df=Div(N(1),Mul(Fun('ln',N(2)),a));break;
            case 'sqrt':df=Div(N(1),Mul(N(2),Fun('sqrt',a)));break;
            case 'cbrt':df=Div(N(1),Mul(N(3),Pow(Fun('cbrt',a),N(2))));break;
            case 'abs': df=Div(a,Fun('abs',a));break;
            default:return N(0);
          }
          if(da.t==='n'&&da.v===1)return simp(df);
          return simp(Mul(df,da));
        }
        default:return N(0);
      }
    }

    function linChk(n){
      if(!n)return null;
      if(n.t==='n')return{a:0,b:n.v};
      if(n.t==='x')return{a:1,b:0};
      if(n.t==='neg'){const u=linChk(n.u);return u?{a:-u.a,b:-u.b}:null;}
      if(n.t==='+'){const l=linChk(n.l),r=linChk(n.r);return(l&&r)?{a:l.a+r.a,b:l.b+r.b}:null;}
      if(n.t==='-'){const l=linChk(n.l),r=linChk(n.r);return(l&&r)?{a:l.a-r.a,b:l.b-r.b}:null;}
      if(n.t==='*'){const l=linChk(n.l),r=linChk(n.r);if(l&&l.a===0&&r)return{a:l.b*r.a,b:l.b*r.b};if(r&&r.a===0&&l)return{a:r.b*l.a,b:r.b*l.b};}
      if(n.t==='/'&&n.r.t==='n'&&n.r.v!==0){const l=linChk(n.l);return l?{a:l.a/n.r.v,b:l.b/n.r.v}:null;}
      return null;
    }

    function integ(n){
      if(!n)return null;
      n=simp(n);
      switch(n.t){
        case 'n':return simp(Mul(n,X()));
        case 'x':return simp(Div(Pow(X(),N(2)),N(2)));
        case 'neg':{const u=integ(n.u);return u?simp(Neg(u)):null;}
        case '+':{const l=integ(n.l),r=integ(n.r);return(l&&r)?simp(Add(l,r)):null;}
        case '-':{const l=integ(n.l),r=integ(n.r);return(l&&r)?simp(Sub(l,r)):null;}
        case '*':{
          if(n.l.t==='n'){const ir=integ(n.r);return ir?simp(Mul(n.l,ir)):null;}
          if(n.r.t==='n'){const il=integ(n.l);return il?simp(Mul(il,n.r)):null;}
          return null;
        }
        case '/':{
          // c/x → c·ln|x|
          if(n.r.t==='x'){const lnAbs=Fun('ln',Fun('abs',X()));return simp(n.l.t==='n'&&n.l.v===1?lnAbs:Mul(n.l,lnAbs));}
          // f(x)/c → integ(f)/c
          if(n.r.t==='n'&&n.r.v!==0){const il=integ(n.l);return il?simp(Div(il,n.r)):null;}
          // c/g(x) — 特定パターンのみ対応（∫(1/g)dx ≠ ∫g dx なので一般化不可）
          if(n.l.t==='n'){
            const s=print(n.r,0);
            // 1/(1+x^2) → atan(x)
            if(s==='1 + x^2'||s==='x^2 + 1') return simp(n.l.v===1?Fun('atan',X()):Mul(n.l,Fun('atan',X())));
            // 1/sqrt(1-x^2) → asin(x)
            if(s==='sqrt(1 - x^2)'||s==='sqrt(-x^2 + 1)') return simp(n.l.v===1?Fun('asin',X()):Mul(n.l,Fun('asin',X())));
          }
          return null;
        }
        case '^':{
          if(n.b.t==='x'&&n.e.t==='n'&&n.e.v!==-1)return simp(Div(Pow(X(),N(n.e.v+1)),N(n.e.v+1)));
          if(n.b.t==='x'&&n.e.t==='n'&&n.e.v===-1)return Fun('ln',Fun('abs',X()));
          if(n.b.t==='n'&&n.e.t==='x')return simp(Div(Pow(n.b,X()),Fun('ln',n.b)));
          return null;
        }
        case 'fn':{
          const lu=linChk(n.a);if(!lu||lu.a===0)return null;
          const{a,b}=lu;const u=n.a;let F=null;
          switch(n.f){
            case 'sin': F=Neg(Fun('cos',u));break;
            case 'cos': F=Fun('sin',u);break;
            case 'tan': F=Neg(Fun('ln',Fun('abs',Fun('cos',u))));break;
            case 'exp': F=Fun('exp',u);break;
            case 'sqrt':F=Mul(Div(N(2),N(3)),Pow(u,N(1.5)));break;
            case 'ln':  F=Sub(Mul(u,Fun('ln',u)),u);break;
            case 'sinh':F=Fun('cosh',u);break;
            case 'cosh':F=Fun('sinh',u);break;
            case 'tanh':F=Fun('ln',Fun('cosh',u));break;
            case 'asin':if(a===1&&b===0)F=Add(Mul(X(),Fun('asin',X())),Fun('sqrt',Sub(N(1),Pow(X(),N(2)))));break;
            case 'acos':if(a===1&&b===0)F=Sub(Mul(X(),Fun('acos',X())),Fun('sqrt',Sub(N(1),Pow(X(),N(2)))));break;
            case 'atan':if(a===1&&b===0)F=Sub(Mul(X(),Fun('atan',X())),Div(Fun('ln',Add(N(1),Pow(X(),N(2)))),N(2)));break;
            default:return null;
          }
          if(!F)return null;
          return simp(a===1?F:Div(F,N(a)));
        }
        default:return null;
      }
    }

    function print(n,outerPrec){
      if(!n)return'0';
      const op=outerPrec===undefined?0:outerPrec;
      function ns(v){if(!isFinite(v))return String(v);if(Number.isInteger(v)&&Math.abs(v)<1e9)return String(v);return parseFloat(v.toPrecision(6)).toString();}
      switch(n.t){
        case 'n':return ns(n.v);
        case 'x':return'x';
        case '+':{const s=`${print(n.l,1)} + ${print(n.r,1)}`;return op>1?`(${s})`:s;}
        case '-':{const rP=n.r.t==='+'||n.r.t==='-';const s=`${print(n.l,1)} - ${rP?`(${print(n.r,0)})`:print(n.r,1)}`;return op>1?`(${s})`:s;}
        case '*':{const lP=n.l.t==='+'||n.l.t==='-'||n.l.t==='neg';const rP=n.r.t==='+'||n.r.t==='-';const s=`${lP?`(${print(n.l,0)})`:print(n.l,2)}·${rP?`(${print(n.r,0)})`:print(n.r,2)}`;return op>2?`(${s})`:s;}
        case '/':{const lP=n.l.t==='+'||n.l.t==='-';const rP=n.r.t!=='n'&&n.r.t!=='x'&&n.r.t!=='fn';return`${lP?`(${print(n.l,0)})`:print(n.l,2)}/${rP?`(${print(n.r,0)})`:print(n.r,2)}`;}
        case '^':{const bP=n.b.t==='+'||n.b.t==='-'||n.b.t==='*'||n.b.t==='/'||n.b.t==='neg'||n.b.t==='^';const eP=n.e.t==='+'||n.e.t==='-'||n.e.t==='neg';return`${bP?`(${print(n.b,0)})`:print(n.b,3)}^${eP?`(${print(n.e,0)})`:print(n.e,3)}`;}
        case 'neg':{const u=n.u;if(u.t==='n'||u.t==='x'||u.t==='fn')return`-${print(u,4)}`;return`-(${print(u,0)})`;}
        case 'fn':return`${n.f}(${print(n.a,0)})`;
        default:return'?';
      }
    }

    return{parse,diff,integ,simp,print};
  })();

  function symbolicDeriv(expr){
    try{const a=_sym.parse(expr);return _sym.print(_sym.simp(_sym.diff(a)));}catch{return null;}
  }
  function symbolicInteg(expr){
    try{const a=_sym.parse(expr);const F=_sym.integ(a);return F?_sym.print(_sym.simp(F))+' + C':null;}catch{return null;}
  }

  /* ============================================================
     数値極限
  ============================================================ */
  function computeLimit(expr,a,side){
    try{
      if(!expr)return null;
      if(side==='pinf'){
        const vs=[1e6,1e8,1e10].map(x=>evalExpr(expr,x)).filter(isFinite);
        if(vs.length<2)return null;
        if(Math.abs(vs[vs.length-1]-vs[vs.length-2])>Math.abs(vs[vs.length-1])*1e-3+1e-5)return null;
        return vs[vs.length-1];
      }
      if(side==='ninf'){
        const vs=[-1e6,-1e8,-1e10].map(x=>evalExpr(expr,x)).filter(isFinite);
        if(vs.length<2)return null;
        if(Math.abs(vs[vs.length-1]-vs[vs.length-2])>Math.abs(vs[vs.length-1])*1e-3+1e-5)return null;
        return vs[vs.length-1];
      }
      const eps=1e-8;
      const vR=evalExpr(expr,a+eps),vL=evalExpr(expr,a-eps);
      if(side==='right')return isFinite(vR)?vR:null;
      if(side==='left') return isFinite(vL)?vL:null;
      if(!isFinite(vR)||!isFinite(vL))return null;
      if(Math.abs(vR-vL)>Math.abs(vR)*1e-3+1e-5)return null;
      return(vR+vL)/2;
    }catch{return null;}
  }

  /* ============================================================
     数値無限和
  ============================================================ */
  function computeInfSum(expr,startN){
    try{
      if(!expr)return null;
      let sum=0;
      const MAX=100000;
      for(let n=startN;n<=startN+MAX;n++){
        const v=evalExpr(expr,n);
        if(!isFinite(v))return null;
        sum+=v;
        if(n>startN+200&&Math.abs(v)<1e-12*(1+Math.abs(sum)))return sum;
        if(Math.abs(sum)>1e15)return null;
      }
      return null;
    }catch{return null;}
  }

  /* ============================================================
     x スナップ（ニッキー値）
  ============================================================ */
  function snapToNice(gx,xRange,W){
    const pixW=xRange/W;
    const snapR=5*pixW;
    const mags=[1e4,1e3,1e2,50,20,10,5,2,1,0.5,0.25,0.2,0.1,0.05,0.02,0.01,0.005,0.002,0.001,1e-4,1e-5];
    for(const m of mags){
      if(m<pixW*0.3)break;
      const nearest=Math.round(gx/m)*m;
      if(Math.abs(nearest-gx)<snapR)return nearest;
    }
    return gx;
  }

  /* ============================================================
     状態
  ============================================================ */
  const state={
    mode:'plot',
    fns:[{expr:'sin(x)',color:'#00c8f0',enabled:true,pts:[]}],
    lang:'ja',
    viewXMin:-6.28, viewXMax:6.28,
    viewYMin:-1.5,  viewYMax:1.5,
    dragging:false, didDrag:false, dragStart:null,
    pinchDist:null, pinchCenter:null,
    selectedX:null,
    showIx:false,      // 交点マーカー表示
    showIxCoords:false, // 交点座標ラベル表示
    cw:0, ch:0,
  };

  /* ============================================================
     多言語テキスト
  ============================================================ */
  const T={
    tabPlot:      {ja:'グラフ',      de:'Graph',          fi:'Kuvaaja'     },
    tabCalc:      {ja:'計算',        de:'Berechnen',      fi:'Laske'       },
    tabDiff:      {ja:'微分・積分',   de:'Diff/Int',       fi:'Diff/Int'    },
    tabSum:       {ja:'和分・差分',   de:'Summen',         fi:'Summat'      },
    tabLimit:     {ja:'極限・∞',     de:'Grenzwerte',     fi:'Rajat/∞'     },
    addFn:        {ja:'+ 関数を追加', de:'+ Funktion',     fi:'+ Lisää fn'  },
    plotBtn:      {ja:'描画',        de:'Zeichnen',       fi:'Piirrä'      },
    resetView:    {ja:'リセット',    de:'Reset',          fi:'Nollaa'      },
    xMinLabel:    {ja:'x 最小',      de:'x min',          fi:'x min'       },
    xMaxLabel:    {ja:'x 最大',      de:'x max',          fi:'x max'       },
    discreteChk:  {ja:'整数 x（離散）',de:'Diskret',      fi:'Diskreetti'  },
    xLabel:       {ja:'x =',        de:'x =',            fi:'x ='         },
    calcBtn:      {ja:'計算',        de:'Berechnen',      fi:'Laske'       },
    evalLabel:    {ja:'f(x)',        de:'f(x)',           fi:'f(x)'        },
    derivLabel:   {ja:"f'(x)数値",   de:"f'(x) num.",    fi:"f'(x) num."  },
    deriv2Label:  {ja:"f''(x)数値",  de:"f''(x) num.",   fi:"f''(x) num." },
    integLabel:   {ja:'∫f(x)dx 数値',de:'∫f(x)dx num.',  fi:'∫f(x)dx num.'},
    aLabel:       {ja:'下限 a =',   de:'a =',            fi:'a ='         },
    bLabel:       {ja:'上限 b =',   de:'b =',            fi:'b ='         },
    integBtn:     {ja:'数値積分',    de:'Num. Integral',  fi:'Num. integr.'},
    sumLabel:     {ja:'Σ f(x)',     de:'Σ f(x)',         fi:'Σ f(x)'      },
    antidiffLabel:{ja:'不定和分',    de:'Antidiff.',      fi:'Antidiff.'   },
    deltaLabel:   {ja:'Δ f(x)',     de:'Δ f(x)',         fi:'Δ f(x)'      },
    nablaLabel:   {ja:'∇ f(x)',     de:'∇ f(x)',         fi:'∇ f(x)'      },
    orderLabel:   {ja:'次数 k =',   de:'k =',            fi:'k ='         },
    sumALabel:    {ja:'a =',        de:'a =',            fi:'a ='         },
    sumBLabel:    {ja:'b =',        de:'b =',            fi:'b ='         },
    sumBtn:       {ja:'定和分',     de:'Bestimmte Summe',fi:'Määrätty'    },
    antidiffBtn:  {ja:'不定和分プロット',de:'Antidiff. plot',fi:'Antidiff. kuva'},
    baseLabel:    {ja:'F(a)=0, a =',de:'F(a)=0, a =',   fi:'F(a)=0, a =' },
    intersect:    {ja:'交点',       de:'Schnittpunkt',   fi:'Leikkauspiste'},
    tapHint:      {ja:'タップで詳細 / x= で指定入力',de:'Tippen→Details',fi:'Napauta→tiedot'},
    exprLabel:    {ja:'f(x) =',     de:'f(x) =',         fi:'f(x) ='      },
    helpTitle:    {ja:'使い方',     de:'Hilfe',          fi:'Ohje'        },
    showIx:       {ja:'交点',       de:'Schnittpunkte',  fi:'Leikkaukset' },
    showIxC:      {ja:'座標',       de:'Koordinaten',    fi:'Koordinaatit'},
    symDerivHdr:  {ja:'d/dx =',     de:'d/dx =',         fi:'d/dx ='      },
    symIntegHdr:  {ja:'∫dx =',     de:'∫dx =',          fi:'∫dx ='       },
    noClosedForm: {ja:'閉じた形なし',de:'Kein Ausdruck', fi:'Ei sulj. muotoa'},
    limitHdr:     {ja:'── 極限 ──', de:'── Grenzwerte ──',fi:'── Rajat ──' },
    limitApprLbl: {ja:'x → a の値',de:'Punkt a',         fi:'Piste a'     },
    limitSideLbl: {ja:'方向',       de:'Richtung',       fi:'Suunta'      },
    limitBtn:     {ja:'極限を計算', de:'Grenzwert',      fi:'Laske raja'  },
    limitRes:     {ja:'lim f(x) =', de:'lim f(x) =',    fi:'lim f(x) ='  },
    limitDiverg:  {ja:'発散（または極限なし）',de:'Divergiert',fi:'Hajaantuu'},
    infSumHdr:    {ja:'── 無限和 ──',de:'── Unend. Summe ──',fi:'── Ääretön ──'},
    infSumN:      {ja:'n 開始 =',  de:'n start =',      fi:'n alku ='    },
    infSumBtn:    {ja:'計算',       de:'Berechnen',      fi:'Laske'       },
    infSumRes:    {ja:'Σ f(n) =',  de:'Σ f(n) =',       fi:'Σ f(n) ='    },
    infSumDiverg: {ja:'発散（収束せず）',de:'Divergiert',fi:'Hajaantuu'   },
    xSnapLabel:   {ja:'x 指定',    de:'x-Wert',         fi:'x-arvo'      },
    helpText:{
      ja:`変数: x, n, pi, e, phi, tau
演算: + - * / ^ (べき乗)
関数: sin cos tan sec csc cot asin acos atan
      sinh cosh tanh asinh acosh atanh
      exp ln log log10 log2
      sqrt cbrt abs floor ceil round sgn
      fact(n)  C(n,k)  P(n,k)
      gamma(x) beta(a,b)
      fall(x,n) rise(x,n)  H(n)
      delta(f(x))  nabla(f(x))
      sum(f(x),a,b)  integ(f(x),a,b)
      sinc(x)  heaviside(x)`,
      de:`Variable: x, n, pi, e, phi, tau
Operatoren: + - * / ^ (Potenz)
Funktionen: sin cos tan asin acos atan sinh cosh tanh
            exp ln log sqrt abs floor ceil fact(n) C(n,k) gamma(x)`,
      fi:`Muuttujat: x, n, pi, e, phi, tau
Operaattorit: + - * / ^ (potenssi)
Funktiot: sin cos tan asin acos atan sinh cosh tanh
          exp ln log sqrt abs floor ceil fact(n) C(n,k) gamma(x)`,
    },
  };
  function t(key){const l=state.lang;if(!T[key])return key;return T[key][l]||T[key]['ja']||key;}

  /* ============================================================
     カラーパレット（サイバーパンク）
  ============================================================ */
  const PALETTE=['#00c8f0','#f07820','#78f040','#f040c8','#c8a82a','#a040f0'];

  /* ============================================================
     パネル構築
  ============================================================ */
  function buildPanel(){
    const body=document.querySelector('#panel-plotter .tool-body');
    if(!body)return;
    body.innerHTML='';
    body.style.padding='0.8rem 1rem';

    // ヘルプ
    const helpRow=div('display:flex;justify-content:flex-end;margin-bottom:0.5rem;');
    const helpBtn=el('button','tool-btn','padding:0.25rem 0.55rem;font-size:0.65rem;');
    helpBtn.textContent='?';helpBtn.title=t('helpTitle');
    helpBtn.addEventListener('click',toggleHelp);
    helpRow.appendChild(helpBtn);body.appendChild(helpRow);
    const helpBox=el('div','',`display:none;background:var(--bg-surface);border:1px solid var(--border);border-left:2px solid var(--accent-mid);padding:0.6rem 0.8rem;font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);white-space:pre;line-height:1.75;margin-bottom:0.6rem;overflow-x:auto;`);
    helpBox.id='pl-help';helpBox.textContent=t('helpText');body.appendChild(helpBox);

    // タブ行
    const tabRow=div('display:flex;gap:0.3rem;margin-bottom:0.8rem;flex-wrap:wrap;');
    [['plot','tabPlot'],['calc','tabCalc'],['diff','tabDiff'],['sum','tabSum'],['limit','tabLimit']].forEach(([mode,key])=>{
      const btn=el('button','lang-btn'+(mode===state.mode?' active':''),'');
      btn.id='pl-tab-'+mode;btn.textContent=t(key);
      btn.addEventListener('click',()=>switchTab(mode));
      tabRow.appendChild(btn);
    });
    body.appendChild(tabRow);

    // ── TAB: グラフ ──
    const tabPlot=div('');tabPlot.id='pl-tab-content-plot';

    const fnListWrap=div('margin-bottom:0.6rem;');fnListWrap.id='pl-fn-list';
    renderFnList(fnListWrap);tabPlot.appendChild(fnListWrap);

    const addBtn=el('button','tool-btn','width:100%;margin-bottom:0.6rem;font-size:0.65rem;letter-spacing:0.1em;');
    addBtn.id='pl-add-fn';addBtn.textContent=t('addFn');
    addBtn.addEventListener('click',addFunction);tabPlot.appendChild(addBtn);

    const rangeRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.5rem;flex-wrap:wrap;');
    rangeRow.append(makeNumInput('pl-xmin',t('xMinLabel'),state.viewXMin,'flex:1;min-width:75px;'),makeNumInput('pl-xmax',t('xMaxLabel'),state.viewXMax,'flex:1;min-width:75px;'));
    const discLabel=el('label','','display:flex;align-items:center;gap:0.3rem;font-size:0.58rem;color:var(--text-dim);font-family:var(--font-mono);white-space:nowrap;cursor:pointer;');
    const discChk=el('input','','cursor:pointer;');discChk.type='checkbox';discChk.id='pl-discrete';
    discLabel.append(discChk,span(t('discreteChk'),''));rangeRow.appendChild(discLabel);
    tabPlot.appendChild(rangeRow);

    const plotBtnRow=div('display:flex;gap:0.4rem;margin-bottom:0.5rem;');
    const plotBtn=el('button','tool-btn','flex:1;text-align:center;letter-spacing:0.1em;');
    plotBtn.id='pl-plot-btn';plotBtn.textContent=t('plotBtn');plotBtn.addEventListener('click',doPlot);
    const resetBtn=el('button','tool-btn','padding:0.4rem 0.7rem;color:var(--text-dim);');
    resetBtn.id='pl-reset-btn';resetBtn.textContent=t('resetView');resetBtn.addEventListener('click',resetView);
    // 交点トグルボタン
    const ixBtn=el('button','tool-btn','padding:0.4rem 0.55rem;font-size:0.62rem;');
    ixBtn.id='pl-ix-btn';ixBtn.title=t('showIx');ixBtn.textContent='⊕ '+t('showIx');
    ixBtn.style.opacity=state.showIx?'1':'0.45';
    ixBtn.addEventListener('click',()=>{state.showIx=!state.showIx;ixBtn.style.opacity=state.showIx?'1':'0.45';if(!state.showIx){state.showIxCoords=false;ixCBtn.style.opacity='0.45';}redraw();});
    const ixCBtn=el('button','tool-btn','padding:0.4rem 0.55rem;font-size:0.62rem;');
    ixCBtn.id='pl-ixc-btn';ixCBtn.title=t('showIxC');ixCBtn.textContent=t('showIxC');
    ixCBtn.style.opacity=state.showIxCoords?'1':'0.45';
    ixCBtn.addEventListener('click',()=>{if(!state.showIx){state.showIx=true;ixBtn.style.opacity='1';}state.showIxCoords=!state.showIxCoords;ixCBtn.style.opacity=state.showIxCoords?'1':'0.45';redraw();});
    plotBtnRow.append(plotBtn,resetBtn,ixBtn,ixCBtn);
    tabPlot.appendChild(plotBtnRow);

    // キャンバス
    const cvWrap=div('position:relative;background:#090c14;border:1px solid var(--border);margin-bottom:0.4rem;');
    const cv=el('canvas','','display:block;width:100%;cursor:crosshair;touch-action:none;');
    cv.id='pl-canvas';cvWrap.appendChild(cv);
    const cvCoords=span('','position:absolute;top:4px;right:6px;font-family:var(--font-mono);font-size:0.5rem;color:var(--accent-mid);pointer-events:none;background:rgba(9,12,20,0.7);padding:1px 4px;');
    cvCoords.id='pl-coords';cvWrap.appendChild(cvCoords);
    tabPlot.appendChild(cvWrap);

    // タップ詳細パネル
    const infoBox=div(`background:var(--bg-surface);border:1px solid var(--border);border-left:2px solid var(--accent-mid);padding:0.4rem 0.7rem;font-family:var(--font-mono);font-size:0.6rem;margin-bottom:0.3rem;min-height:2rem;display:flex;align-items:center;`);
    infoBox.id='pl-info';
    infoBox.innerHTML=`<span style="color:var(--text-dim);font-size:0.55rem;letter-spacing:0.08em;">${t('tapHint')}</span>`;
    tabPlot.appendChild(infoBox);

    // x 指定入力（スナップ）
    const snapRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;');
    const snapLbl=span(t('xSnapLabel')+':','font-size:0.55rem;color:var(--text-dim);font-family:var(--font-mono);white-space:nowrap;');
    const snapInp=el('input','tool-input','flex:1;padding:0.3rem 0.5rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;font-size:0.7rem;');
    snapInp.id='pl-snap-x';snapInp.placeholder='0';snapInp.type='number';snapInp.step='any';
    const snapGoBtn=el('button','tool-btn','padding:0.3rem 0.6rem;font-size:0.65rem;');
    snapGoBtn.textContent='→';
    const doSnap=()=>{const v=parseFloat(snapInp.value);if(isFinite(v)){state.selectedX=v;updateInfoBox(v);redraw();}};
    snapInp.addEventListener('keydown',e=>{if(e.key==='Enter')doSnap();});
    snapGoBtn.addEventListener('click',doSnap);
    snapRow.append(snapLbl,snapInp,snapGoBtn);
    tabPlot.appendChild(snapRow);

    body.appendChild(tabPlot);

    // ── TAB: 計算 ──
    const tabCalc=div('display:none;');tabCalc.id='pl-tab-content-calc';
    const xRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.7rem;flex-wrap:wrap;');
    xRow.append(makeNumInput('pl-calc-x',t('xLabel'),0,'flex:1;min-width:100px;'));
    const calcBtn2=el('button','tool-btn','');calcBtn2.textContent=t('calcBtn');
    calcBtn2.addEventListener('click',doCalc);xRow.appendChild(calcBtn2);tabCalc.appendChild(xRow);
    const cExprRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.6rem;');
    const cExprIn=el('input','tool-input','flex:1;padding:0.4rem 0.6rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;');
    cExprIn.id='pl-calc-expr';cExprIn.value=state.fns[0]?state.fns[0].expr:'sin(x)';cExprIn.placeholder='sin(x)';
    cExprRow.append(span(t('exprLabel'),'font-size:0.65rem;color:var(--accent-mid);font-family:var(--font-mono);white-space:nowrap;'),cExprIn);
    tabCalc.appendChild(cExprRow);
    tabCalc.appendChild(makeResultTable([['pl-res-fx',t('evalLabel')]]));
    body.appendChild(tabCalc);

    // ── TAB: 微分・積分 ──
    const tabDiff=div('display:none;');tabDiff.id='pl-tab-content-diff';

    // 式入力（微分タブ）
    const dExprIn=el('input','tool-input','flex:1;padding:0.4rem 0.6rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;');
    dExprIn.id='pl-diff-expr';dExprIn.value=state.fns[0]?state.fns[0].expr:'sin(x)';dExprIn.placeholder='sin(x)';
    const dExprRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;');
    dExprRow.append(span(t('exprLabel'),'font-size:0.65rem;color:var(--accent-mid);font-family:var(--font-mono);white-space:nowrap;'),dExprIn);
    tabDiff.appendChild(dExprRow);

    // 記号微分結果（ライム色ボックス）
    const symDBox=makeSymBox('pl-sym-deriv',t('symDerivHdr'));tabDiff.appendChild(symDBox);

    const dxRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.5rem;flex-wrap:wrap;');
    dxRow.append(makeNumInput('pl-diff-x',t('xLabel'),0,'flex:1;min-width:100px;'));
    const diffBtn2=el('button','tool-btn','');diffBtn2.textContent=t('calcBtn');
    diffBtn2.addEventListener('click',doDiff);dxRow.appendChild(diffBtn2);tabDiff.appendChild(dxRow);
    tabDiff.appendChild(makeResultTable([['pl-res-deriv',t('derivLabel')],['pl-res-deriv2',t('deriv2Label')]]));

    tabDiff.appendChild(div('border-top:1px solid var(--border);margin:0.7rem 0;'));

    // 式入力（積分タブ）
    const iExprIn=el('input','tool-input','flex:1;padding:0.4rem 0.6rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;');
    iExprIn.id='pl-integ-expr';iExprIn.value=state.fns[0]?state.fns[0].expr:'sin(x)';iExprIn.placeholder='sin(x)';
    const iExprRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;');
    iExprRow.append(span(t('exprLabel'),'font-size:0.65rem;color:var(--accent-mid);font-family:var(--font-mono);white-space:nowrap;'),iExprIn);
    tabDiff.appendChild(iExprRow);

    // 記号積分結果
    const symIBox=makeSymBox('pl-sym-integ',t('symIntegHdr'));tabDiff.appendChild(symIBox);

    const integRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;flex-wrap:wrap;');
    integRow.append(makeNumInput('pl-integ-a',t('aLabel'),-1,'flex:1;min-width:80px;'),makeNumInput('pl-integ-b',t('bLabel'),1,'flex:1;min-width:80px;'));
    const integBtn2=el('button','tool-btn','');integBtn2.textContent=t('integBtn');
    integBtn2.addEventListener('click',doInteg);integRow.appendChild(integBtn2);
    tabDiff.appendChild(integRow);
    tabDiff.appendChild(makeResultTable([['pl-res-integ',t('integLabel')]]));

    // 式変更 → 記号結果リアルタイム更新
    const updateSym=()=>{
      const exD=(document.getElementById('pl-diff-expr')||{}).value||'';
      const exI=(document.getElementById('pl-integ-expr')||{}).value||'';
      setSymBox('pl-sym-deriv',symbolicDeriv(exD),t('noClosedForm'));
      setSymBox('pl-sym-integ',symbolicInteg(exI),t('noClosedForm'));
    };
    dExprIn.addEventListener('input',updateSym);iExprIn.addEventListener('input',updateSym);
    setTimeout(updateSym,50);

    body.appendChild(tabDiff);

    // ── TAB: 和分・差分 ──
    const tabSum=div('display:none;');tabSum.id='pl-tab-content-sum';
    const sExprIn=el('input','tool-input','flex:1;padding:0.4rem 0.6rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;');
    sExprIn.id='pl-sum-expr';sExprIn.value=state.fns[0]?state.fns[0].expr:'x^2';sExprIn.placeholder='x^2';
    const sExprRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.6rem;');
    sExprRow.append(span(t('exprLabel'),'font-size:0.65rem;color:var(--accent-mid);font-family:var(--font-mono);white-space:nowrap;'),sExprIn);
    tabSum.appendChild(sExprRow);
    const sumXRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;flex-wrap:wrap;');
    sumXRow.append(makeNumInput('pl-sum-x',t('xLabel'),3,'flex:1;min-width:70px;'),makeNumInput('pl-sum-order',t('orderLabel'),1,'flex:1;min-width:70px;'));
    const diffSumBtn=el('button','tool-btn','');diffSumBtn.textContent=t('calcBtn');
    diffSumBtn.addEventListener('click',doSumCalc);sumXRow.appendChild(diffSumBtn);
    tabSum.appendChild(sumXRow);
    tabSum.appendChild(makeResultTable([['pl-res-delta',t('deltaLabel')],['pl-res-nabla',t('nablaLabel')]]));
    tabSum.appendChild(div('border-top:1px solid var(--border);margin:0.7rem 0;'));
    const defSumRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;flex-wrap:wrap;');
    defSumRow.append(makeNumInput('pl-defsum-a',t('sumALabel'),0,'flex:1;min-width:70px;'),makeNumInput('pl-defsum-b',t('sumBLabel'),9,'flex:1;min-width:70px;'));
    const defSumBtn=el('button','tool-btn','');defSumBtn.textContent=t('sumBtn');
    defSumBtn.addEventListener('click',doDefSum);defSumRow.appendChild(defSumBtn);
    tabSum.appendChild(defSumRow);
    tabSum.appendChild(makeResultTable([['pl-res-defsum',t('sumLabel')]]));
    tabSum.appendChild(div('border-top:1px solid var(--border);margin:0.7rem 0;'));
    const adRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem;flex-wrap:wrap;');
    adRow.append(makeNumInput('pl-ad-base',t('baseLabel'),0,'flex:1;min-width:80px;'),makeNumInput('pl-ad-xmax',t('xMaxLabel'),10,'flex:1;min-width:80px;'));
    const adBtn=el('button','tool-btn','width:100%;text-align:center;margin-bottom:0.4rem;');
    adBtn.textContent=t('antidiffBtn');adBtn.addEventListener('click',doAntiDiffPlot);
    tabSum.append(adRow,adBtn);
    body.appendChild(tabSum);

    // ── TAB: 極限・∞ ──
    const tabLimit=div('display:none;');tabLimit.id='pl-tab-content-limit';

    // 極限セクション
    const lHdr=div('font-family:var(--font-mono);font-size:0.6rem;color:var(--accent-mid);margin-bottom:0.5rem;letter-spacing:0.1em;');
    lHdr.textContent=t('limitHdr');tabLimit.appendChild(lHdr);

    const lExprIn=el('input','tool-input','flex:1;padding:0.4rem 0.6rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;');
    lExprIn.id='pl-lim-expr';lExprIn.value=state.fns[0]?state.fns[0].expr:'sin(x)/x';lExprIn.placeholder='sin(x)/x';
    const lExprRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.5rem;');
    lExprRow.append(span(t('exprLabel'),'font-size:0.65rem;color:var(--accent-mid);font-family:var(--font-mono);white-space:nowrap;'),lExprIn);
    tabLimit.appendChild(lExprRow);

    const lParamRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.5rem;flex-wrap:wrap;');
    lParamRow.append(makeNumInput('pl-lim-a',t('limitApprLbl'),0,'flex:1;min-width:80px;'));
    // 方向セレクタ
    const lSideWrap=div('display:flex;flex-direction:column;gap:0.12rem;flex:1;min-width:90px;');
    lSideWrap.append(span(t('limitSideLbl'),'font-size:0.52rem;color:var(--accent-mid);font-family:var(--font-mono);'));
    const lSide=el('select','tool-input','padding:0.32rem 0.48rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;');
    lSide.id='pl-lim-side';
    [['both','両側 (x→a)'],['right','右側 (x→a+)'],['left','左側 (x→a−)'],['pinf','x→+∞'],['ninf','x→−∞']].forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;lSide.appendChild(o);});
    lSideWrap.appendChild(lSide);lParamRow.appendChild(lSideWrap);
    const lBtn=el('button','tool-btn','align-self:flex-end;padding:0.38rem 0.8rem;');
    lBtn.textContent=t('limitBtn');lBtn.addEventListener('click',doLimit);lParamRow.appendChild(lBtn);
    tabLimit.appendChild(lParamRow);
    tabLimit.appendChild(makeResultTable([['pl-res-lim',t('limitRes')]]));

    // 無限和セクション
    tabLimit.appendChild(div('border-top:1px solid var(--border);margin:0.8rem 0;'));
    const isHdr=div('font-family:var(--font-mono);font-size:0.6rem;color:var(--accent-mid);margin-bottom:0.5rem;letter-spacing:0.1em;');
    isHdr.textContent=t('infSumHdr');tabLimit.appendChild(isHdr);

    const isExprIn=el('input','tool-input','flex:1;padding:0.4rem 0.6rem;background:var(--bg-surface);border:1px solid var(--border);color:var(--text);font-family:var(--font-mono);outline:none;');
    isExprIn.id='pl-infsum-expr';isExprIn.value='1/x^2';isExprIn.placeholder='1/x^2';
    const isExprRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.5rem;');
    isExprRow.append(span(t('exprLabel'),'font-size:0.65rem;color:var(--accent-mid);font-family:var(--font-mono);white-space:nowrap;'),isExprIn);
    tabLimit.appendChild(isExprRow);

    const isParamRow=div('display:flex;gap:0.4rem;align-items:center;margin-bottom:0.5rem;flex-wrap:wrap;');
    isParamRow.append(makeNumInput('pl-infsum-n',t('infSumN'),1,'flex:1;min-width:90px;'));
    const isBtn=el('button','tool-btn','align-self:flex-end;padding:0.38rem 0.8rem;');
    isBtn.textContent=t('infSumBtn');isBtn.addEventListener('click',doInfSum);isParamRow.appendChild(isBtn);
    tabLimit.appendChild(isParamRow);
    tabLimit.appendChild(makeResultTable([['pl-res-infsum',t('infSumRes')]]));

    body.appendChild(tabLimit);

    // キャンバス初期化
    requestAnimationFrame(()=>{initCanvas();doPlot();});
  }

  /* ============================================================
     記号結果表示ボックス
  ============================================================ */
  function makeSymBox(id,label){
    const w=div('background:rgba(120,240,64,0.04);border-left:2px solid #78f040;padding:0.3rem 0.6rem;margin-bottom:0.5rem;');
    const lbl=span(label+' ','font-family:var(--font-mono);font-size:0.55rem;color:#78f04099;');
    const val=el('span','','font-family:var(--font-mono);font-size:0.68rem;color:#78f040;word-break:break-all;');
    val.id=id;val.textContent='—';
    w.append(lbl,val);return w;
  }
  function setSymBox(id,result,fallback){
    const el2=document.getElementById(id);
    if(!el2)return;
    el2.textContent=result!==null&&result!==undefined?result:(fallback||'—');
    el2.style.opacity=result?'1':'0.45';
  }

  /* ============================================================
     関数リスト UI
  ============================================================ */
  function renderFnList(container){
    container.innerHTML='';
    state.fns.forEach((fn,i)=>{
      const row=div('display:flex;gap:0.35rem;align-items:center;margin-bottom:0.35rem;');
      const swatch=el('div','',`width:14px;height:14px;min-width:14px;border-radius:2px;background:${fn.color};cursor:pointer;border:1px solid rgba(255,255,255,0.15);flex-shrink:0;`);
      swatch.addEventListener('click',()=>cycleFnColor(i));
      const inp=el('input','tool-input',`flex:1;padding:0.35rem 0.55rem;background:var(--bg-surface);border:1px solid ${fn.color}55;color:var(--text);font-family:var(--font-mono);outline:none;border-left:2px solid ${fn.color};`);
      inp.placeholder='sin(x)';inp.value=fn.expr;
      inp.addEventListener('input',e=>{state.fns[i].expr=e.target.value.trim();});
      inp.addEventListener('keydown',e=>{if(e.key==='Enter')doPlot();});
      const tog=el('button','',`padding:0.2rem 0.4rem;font-size:0.6rem;font-family:var(--font-mono);background:${fn.enabled?fn.color+'33':'transparent'};border:1px solid ${fn.color}88;color:${fn.enabled?fn.color:'var(--text-dim)'};cursor:pointer;border-radius:2px;`);
      tog.textContent=fn.enabled?'●':'○';
      tog.addEventListener('click',()=>{fn.enabled=!fn.enabled;renderFnList(container);doPlot();});
      row.append(swatch,inp,tog);
      if(state.fns.length>1){
        const rm=el('button','tool-btn','padding:0.2rem 0.45rem;font-size:0.7rem;color:var(--text-dim);');
        rm.textContent='✕';
        rm.addEventListener('click',()=>{state.fns.splice(i,1);renderFnList(container);doPlot();});
        row.appendChild(rm);
      }
      container.appendChild(row);
    });
  }
  function addFunction(){
    const colorIdx=state.fns.length%PALETTE.length;
    state.fns.push({expr:'',color:PALETTE[colorIdx],enabled:true,pts:[]});
    const list=document.getElementById('pl-fn-list');if(list)renderFnList(list);
  }
  function cycleFnColor(i){
    const cur=PALETTE.indexOf(state.fns[i].color);
    state.fns[i].color=PALETTE[(cur+1)%PALETTE.length];
    const list=document.getElementById('pl-fn-list');if(list)renderFnList(list);doPlot();
  }

  /* ============================================================
     UI ヘルパー
  ============================================================ */
  function el(tag,cls,style){const e=document.createElement(tag);if(cls)e.className=cls;if(style)e.style.cssText=style;return e;}
  function div(style){return el('div','',style);}
  function span(text,style){const s=el('span','',style);s.textContent=text;return s;}
  function makeNumInput(id,label,defVal,wrapStyle){
    const wrap=div('display:flex;flex-direction:column;gap:0.12rem;'+(wrapStyle||''));
    const lbl=span(label,'font-size:0.52rem;color:var(--accent-mid);font-family:var(--font-mono);letter-spacing:0.08em;');
    const inp=el('input','tool-input','padding:0.32rem 0.48rem;');
    inp.type='number';inp.id=id;inp.step='any';inp.value=defVal;
    wrap.append(lbl,inp);return wrap;
  }
  function makeResultTable(rows){
    const wrap=div('background:var(--bg-surface);border:1px solid var(--border);border-left:2px solid var(--accent-mid);padding:0.45rem 0.7rem;margin-bottom:0.5rem;');
    rows.forEach(([id,label])=>{
      const row=div('display:flex;justify-content:space-between;align-items:baseline;padding:0.2rem 0;border-bottom:1px solid rgba(0,200,240,0.05);');
      const lbl=span(label,'font-family:var(--font-mono);font-size:0.6rem;color:var(--text-dim);');
      const val=span('—','font-family:var(--font-mono);font-size:0.75rem;color:var(--accent);letter-spacing:0.04em;');
      val.id=id;row.append(lbl,val);wrap.appendChild(row);
    });
    return wrap;
  }
  function numVal(id,fallback){const e=document.getElementById(id);if(!e)return fallback;const v=parseFloat(e.value);return isNaN(v)?fallback:v;}
  function setResult(id,v){
    const e=document.getElementById(id);if(!e)return;
    if(v===null||v===undefined){e.textContent='undef';return;}
    if(!isFinite(v)){e.textContent=v>0?'∞':'-∞';return;}
    e.textContent=Math.abs(v)<1e-9?'0':parseFloat(v.toPrecision(10)).toString();
  }
  function toggleHelp(){const b=document.getElementById('pl-help');if(b)b.style.display=b.style.display==='none'?'block':'none';}

  /* ============================================================
     タブ切替
  ============================================================ */
  function switchTab(mode){
    state.mode=mode;
    ['plot','calc','diff','sum','limit'].forEach(m=>{
      const btn=document.getElementById('pl-tab-'+m);
      const content=document.getElementById('pl-tab-content-'+m);
      if(btn)btn.classList.toggle('active',m===mode);
      if(content)content.style.display=m===mode?'':'none';
    });
  }

  /* ============================================================
     キャンバス初期化
  ============================================================ */
  let canvas=null, ctx=null;
  function initCanvas(){
    canvas=document.getElementById('pl-canvas');
    if(!canvas)return;
    ctx=canvas.getContext('2d');
    resize();
    canvas.addEventListener('mousedown',onMouseDown);
    canvas.addEventListener('mousemove',onMouseMove);
    canvas.addEventListener('mouseup',onMouseUp);
    canvas.addEventListener('mouseleave',()=>{state.dragging=false;});
    canvas.addEventListener('wheel',onWheel,{passive:false});
    canvas.addEventListener('touchstart',onTouchStart,{passive:false});
    canvas.addEventListener('touchmove',onTouchMove,{passive:false});
    canvas.addEventListener('touchend',onTouchEnd);
    window.addEventListener('resize',()=>{resize();redraw();});
  }

  function resize(){
    if(!canvas)return;
    const rect=canvas.getBoundingClientRect();
    const dpr=window.devicePixelRatio||1;
    const W=rect.width;if(!W)return;
    const H=Math.round(W*CANVAS_ASPECT);
    canvas.width=Math.round(W*dpr);
    canvas.height=Math.round(H*dpr);
    canvas.style.height=H+'px';
    state.cw=canvas.width;state.ch=canvas.height;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr,dpr);
  }

  /* ============================================================
     座標変換
  ============================================================ */
  function toScreen(gx,gy){
    const rect=canvas.getBoundingClientRect();
    const W=rect.width,H=rect.height;
    return{sx:(gx-state.viewXMin)/(state.viewXMax-state.viewXMin)*W,sy:H-(gy-state.viewYMin)/(state.viewYMax-state.viewYMin)*H};
  }
  function toGraph(sx,sy){
    const rect=canvas.getBoundingClientRect();
    const W=rect.width,H=rect.height;
    return{gx:sx/W*(state.viewXMax-state.viewXMin)+state.viewXMin,gy:(H-sy)/H*(state.viewYMax-state.viewYMin)+state.viewYMin};
  }

  /* ============================================================
     描画
  ============================================================ */
  function redraw(){drawGraph();}

  function drawGraph(){
    if(!canvas||!ctx)return;
    const rect=canvas.getBoundingClientRect();
    const W=rect.width,H=rect.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#090c14';ctx.fillRect(0,0,W,H);
    const{viewXMin:vxMin,viewXMax:vxMax,viewYMin:vyMin,viewYMax:vyMax}=state;
    drawGridAndAxes(W,H,vxMin,vxMax,vyMin,vyMax);
    const isDisc=document.getElementById('pl-discrete')&&document.getElementById('pl-discrete').checked;
    state.fns.forEach(fn=>{
      if(!fn.enabled||!fn.pts||fn.pts.length===0)return;
      if(isDisc)drawDiscrete(fn.pts,W,H,vxMin,vxMax,vyMin,vyMax,fn.color);
      else drawCurve(fn.pts,W,H,vxMin,vxMax,vyMin,vyMax,fn.color);
    });
    // 交点（トグルONのときのみ計算・描画）
    if(state.showIx){
      const efs=state.fns.filter(f=>f.enabled&&f.pts&&f.pts.length>0);
      for(let i=0;i<efs.length;i++){
        for(let j=i+1;j<efs.length;j++){
          const ixs=findIntersections(efs[i].pts,efs[j].pts,efs[i].expr,efs[j].expr);
          drawIntersections(ixs,W,H,vxMin,vxMax,vyMin,vyMax,efs[i].color,efs[j].color);
        }
      }
    }
    if(state.selectedX!==null)drawHairline(state.selectedX,W,H,vxMin,vxMax,vyMin,vyMax);
  }

  /* ============================================================
     グリッド・軸
  ============================================================ */
  function drawGridAndAxes(W,H,vxMin,vxMax,vyMin,vyMax){
    const xRange=vxMax-vxMin,yRange=vyMax-vyMin;
    const xStep=niceStep(xRange/8),yStep=niceStep(yRange/6);
    const fontSize=Math.max(9,Math.min(W*0.026,11));
    ctx.strokeStyle='rgba(0,200,240,0.06)';ctx.lineWidth=1;
    for(let x=Math.ceil(vxMin/xStep)*xStep;x<=vxMax+1e-9;x+=xStep){const sx=(x-vxMin)/xRange*W;ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,H);ctx.stroke();}
    for(let y=Math.ceil(vyMin/yStep)*yStep;y<=vyMax+1e-9;y+=yStep){const sy=H-(y-vyMin)/yRange*H;ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(W,sy);ctx.stroke();}
    const hasX=vyMin<0&&vyMax>0,hasY=vxMin<0&&vxMax>0;
    const axisY=hasX?H-(0-vyMin)/yRange*H:(vyMin>=0?H-1:1);
    const axisX=hasY?(0-vxMin)/xRange*W:(vxMin>=0?1:W-1);
    ctx.strokeStyle='rgba(0,200,240,0.65)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(0,axisY);ctx.lineTo(W-11,axisY);ctx.stroke();
    ctx.fillStyle='rgba(0,200,240,0.65)';ctx.beginPath();ctx.moveTo(W-11,axisY);ctx.lineTo(W-18,axisY-4);ctx.lineTo(W-18,axisY+4);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(0,200,240,0.85)';ctx.font=`bold ${fontSize+1}px "Fira Code",monospace`;ctx.textAlign='left';ctx.fillText('x',W-10,axisY-5);
    ctx.strokeStyle='rgba(0,200,240,0.65)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(axisX,H);ctx.lineTo(axisX,11);ctx.stroke();
    ctx.fillStyle='rgba(0,200,240,0.65)';ctx.beginPath();ctx.moveTo(axisX,11);ctx.lineTo(axisX-4,18);ctx.lineTo(axisX+4,18);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(0,200,240,0.85)';ctx.textAlign='center';ctx.fillText('y',axisX,10);
    if(hasX&&hasY){ctx.fillStyle='rgba(0,200,240,0.9)';ctx.beginPath();ctx.arc(axisX,axisY,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(0,200,240,0.5)';ctx.font=`${fontSize}px "Fira Code",monospace`;ctx.textAlign='right';ctx.fillText('0',axisX-5,axisY+fontSize+1);}
    ctx.font=`${fontSize}px "Fira Code",monospace`;ctx.fillStyle='rgba(0,200,240,0.42)';ctx.strokeStyle='rgba(0,200,240,0.38)';ctx.lineWidth=1;
    ctx.textAlign='center';
    for(let x=Math.ceil(vxMin/xStep)*xStep;x<=vxMax+1e-9;x+=xStep){if(Math.abs(x)<xStep*0.01)continue;const sx=(x-vxMin)/xRange*W;if(sx<6||sx>W-18)continue;ctx.beginPath();ctx.moveTo(sx,axisY-3);ctx.lineTo(sx,axisY+3);ctx.stroke();const labelY=clamp(axisY+fontSize+3,fontSize+2,H-2);ctx.fillText(formatLabel(x),sx,labelY);}
    ctx.textAlign='right';
    for(let y=Math.ceil(vyMin/yStep)*yStep;y<=vyMax+1e-9;y+=yStep){if(Math.abs(y)<yStep*0.01)continue;const sy=H-(y-vyMin)/yRange*H;if(sy<14||sy>H-6)continue;ctx.beginPath();ctx.moveTo(axisX-3,sy);ctx.lineTo(axisX+3,sy);ctx.stroke();const labelX=clamp(axisX-5,32,W-4);ctx.fillText(formatLabel(y),labelX,sy+3);}
  }

  /* ============================================================
     カーブ描画
  ============================================================ */
  function drawCurve(points,W,H,vxMin,vxMax,vyMin,vyMax,color){
    const xRange=vxMax-vxMin,yRange=vyMax-vyMin;
    ctx.strokeStyle=color;ctx.lineWidth=1.8;ctx.shadowColor=color+'66';ctx.shadowBlur=5;
    ctx.beginPath();let penDown=false,prevSy=null;
    for(const pt of points){
      if(pt.y===null||pt.y===undefined||!isFinite(pt.y)){penDown=false;continue;}
      const sx=(pt.x-vxMin)/xRange*W,sy=H-(pt.y-vyMin)/yRange*H;
      if(penDown&&prevSy!==null&&Math.abs(sy-prevSy)>H*1.5)penDown=false;
      if(!penDown){ctx.moveTo(sx,sy);penDown=true;}else ctx.lineTo(sx,sy);
      prevSy=sy;
    }
    ctx.stroke();ctx.shadowBlur=0;
  }
  function drawDiscrete(points,W,H,vxMin,vxMax,vyMin,vyMax,color){
    const xRange=vxMax-vxMin,yRange=vyMax-vyMin;
    const yZero=H-(0-vyMin)/yRange*H;
    ctx.shadowColor=color+'88';ctx.shadowBlur=5;
    for(const pt of points){
      if(pt.y===null||!isFinite(pt.y))continue;
      const sx=(pt.x-vxMin)/xRange*W,sy=H-(pt.y-vyMin)/yRange*H;
      ctx.strokeStyle=color+'66';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx,yZero);ctx.lineTo(sx,sy);ctx.stroke();
      ctx.fillStyle=color;ctx.beginPath();ctx.arc(sx,sy,3,0,Math.PI*2);ctx.fill();
    }
    ctx.shadowBlur=0;
  }

  /* ============================================================
     交点検出・描画
     ★ 白丸なし・小さな十字マーク + 座標はトグルのみ
  ============================================================ */
  function findIntersections(pts1,pts2,expr1,expr2){
    const result=[];if(!pts1.length||!pts2.length)return result;
    const map2=new Map();
    pts2.forEach(p=>{if(p.y!==null&&isFinite(p.y))map2.set(p.x,p.y);});
    let prev=null;
    for(const p of pts1){
      if(p.y===null||!isFinite(p.y)){prev=null;continue;}
      const y2=map2.get(p.x);
      if(y2===undefined||!isFinite(y2)){prev=null;continue;}
      const diff=p.y-y2;
      if(prev!==null&&prev.diff*diff<0){
        const ix=bisectIntersect(expr1,expr2,prev.x,p.x);
        if(ix!==null)result.push(ix);
      }
      prev={x:p.x,y:p.y,diff};
    }
    return result;
  }
  function bisectIntersect(expr1,expr2,xa,xb){
    try{
      for(let i=0;i<30;i++){
        const xm=(xa+xb)/2;
        const fa=evalExpr(expr1,xa)-evalExpr(expr2,xa);
        const fm=evalExpr(expr1,xm)-evalExpr(expr2,xm);
        if(Math.abs(xb-xa)<1e-8){const y1=evalExpr(expr1,xm),y2=evalExpr(expr2,xm);return{x:xm,y:(y1+y2)/2};}
        if(fa*fm<=0)xb=xm;else xa=xm;
      }
      const xm=(xa+xb)/2;return{x:xm,y:(evalExpr(expr1,xm)+evalExpr(expr2,xm))/2};
    }catch{return null;}
  }
  function drawIntersections(ixs,W,H,vxMin,vxMax,vyMin,vyMax,c1,c2){
    const xRange=vxMax-vxMin,yRange=vyMax-vyMin;
    const fontSize=9;
    ixs.forEach(ix=>{
      if(ix.x<vxMin||ix.x>vxMax||ix.y<vyMin||ix.y>vyMax)return;
      const sx=(ix.x-vxMin)/xRange*W,sy=H-(ix.y-vyMin)/yRange*H;
      // 小さな白い十字（目立たないが分かる）
      ctx.strokeStyle='rgba(255,255,255,0.75)';ctx.lineWidth=1.5;
      ctx.shadowColor='rgba(255,255,255,0.4)';ctx.shadowBlur=4;
      ctx.beginPath();ctx.moveTo(sx-4,sy);ctx.lineTo(sx+4,sy);
      ctx.moveTo(sx,sy-4);ctx.lineTo(sx,sy+4);ctx.stroke();
      ctx.shadowBlur=0;
      // 座標ラベル（state.showIxCoords のときのみ）
      if(state.showIxCoords){
        const label=`(${formatLabel(ix.x)}, ${formatLabel(ix.y)})`;
        ctx.font=`${fontSize}px "Fira Code",monospace`;
        ctx.fillStyle='rgba(255,255,255,0.75)';
        const lx=clamp(sx+6,4,W-label.length*5.5-4);
        const ly=clamp(sy-6,fontSize+2,H-2);
        ctx.fillText(label,lx,ly);
      }
    });
  }

  /* ============================================================
     タップ詳細（ヘアライン）
  ============================================================ */
  function drawHairline(gx,W,H,vxMin,vxMax,vyMin,vyMax){
    const xRange=vxMax-vxMin,yRange=vyMax-vyMin;
    if(gx<vxMin||gx>vxMax)return;
    const sx=(gx-vxMin)/xRange*W;
    ctx.setLineDash([3,3]);ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,H);ctx.stroke();ctx.setLineDash([]);
    const efs=state.fns.filter(f=>f.enabled&&f.pts&&f.pts.length>0);
    efs.forEach(fn=>{
      const y=evalExprSafe(fn.expr,gx);if(y===null)return;
      const sy=H-(y-vyMin)/yRange*H;if(sy<0||sy>H)return;
      ctx.fillStyle=fn.color;ctx.shadowColor=fn.color+'aa';ctx.shadowBlur=8;
      ctx.beginPath();ctx.arc(sx,sy,4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    });
  }
  function evalExprSafe(expr,x){try{const v=evalExpr(expr,x);return(isFinite(v)&&!isNaN(v))?v:null;}catch{return null;}}

  function updateInfoBox(gx){
    const box=document.getElementById('pl-info');if(!box)return;
    if(gx===null){box.innerHTML=`<span style="color:var(--text-dim);font-size:0.55rem;letter-spacing:0.08em;">${t('tapHint')}</span>`;return;}
    const efs=state.fns.filter(f=>f.enabled);
    let html=`<span style="color:var(--accent-mid);font-family:var(--font-mono);font-size:0.58rem;">x = <b style="color:var(--text)">${formatLabel(gx)}</b></span>`;
    html+=`<span style="display:flex;gap:0.8rem;flex-wrap:wrap;margin-left:0.8rem;">`;
    efs.forEach(fn=>{
      const y=evalExprSafe(fn.expr,gx);
      const yStr=y===null?'undef':formatLabel(y);
      html+=`<span style="font-family:var(--font-mono);font-size:0.58rem;"><span style="color:${fn.color};">■</span><span style="color:var(--text-dim);"> ${fn.expr||'?'}</span><span style="color:${fn.color};"> = ${yStr}</span></span>`;
    });
    html+=`</span>`;
    box.style.display='flex';box.style.alignItems='center';box.style.flexWrap='wrap';box.style.gap='0.3rem';
    box.innerHTML=html;
  }

  /* ============================================================
     イベント
  ============================================================ */
  function onMouseDown(e){
    state.dragging=true;state.didDrag=false;
    state.dragStart={x:e.clientX,y:e.clientY,vxMin:state.viewXMin,vxMax:state.viewXMax,vyMin:state.viewYMin,vyMax:state.viewYMax};
  }
  function onMouseMove(e){
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const g=toGraph(mx,my);
    const coords=document.getElementById('pl-coords');
    if(coords)coords.textContent=`(${formatLabel(g.gx)}, ${formatLabel(g.gy)})`;
    if(state.dragging&&state.dragStart){
      const dx=e.clientX-state.dragStart.x,dy=e.clientY-state.dragStart.y;
      if(Math.abs(dx)>3||Math.abs(dy)>3)state.didDrag=true;
      const W=rect.width,H=rect.height;
      const xR=state.dragStart.vxMax-state.dragStart.vxMin;
      const yR=state.dragStart.vyMax-state.dragStart.vyMin;
      state.viewXMin=state.dragStart.vxMin-dx/W*xR;
      state.viewXMax=state.dragStart.vxMax-dx/W*xR;
      state.viewYMin=state.dragStart.vyMin+dy/H*yR;
      state.viewYMax=state.dragStart.vyMax+dy/H*yR;
      redraw();
    }
  }
  function onMouseUp(e){
    if(!state.didDrag){
      const rect=canvas.getBoundingClientRect();
      const mx=e.clientX-rect.left,my=e.clientY-rect.top;
      const g=toGraph(mx,my);
      const snapped=snapToNice(g.gx,state.viewXMax-state.viewXMin,rect.width);
      if(state.selectedX===snapped){state.selectedX=null;updateInfoBox(null);}
      else{state.selectedX=snapped;updateInfoBox(snapped);}
      redraw();
    }
    state.dragging=false;state.didDrag=false;
  }
  function onWheel(e){
    e.preventDefault();
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const g=toGraph(mx,my);
    zoom(g.gx,g.gy,e.deltaY>0?1.15:1/1.15);
  }
  function zoom(cx,cy,factor){
    if(!isFinite(cx)||!isFinite(cy)||!isFinite(factor)||factor<=0)return;
    const newXMin=cx+(state.viewXMin-cx)*factor,newXMax=cx+(state.viewXMax-cx)*factor;
    const newXRange=newXMax-newXMin;
    if(!isFinite(newXRange)||newXRange<MIN_X_RANGE||newXRange>MAX_X_RANGE)return;
    state.viewXMin=newXMin;state.viewXMax=newXMax;
    state.viewYMin=cy+(state.viewYMin-cy)*factor;
    state.viewYMax=cy+(state.viewYMax-cy)*factor;
    enforceAspect();redraw();
  }

  let _touchStartX=null,_touchStartY=null;
  function onTouchStart(e){
    if(e.touches.length===1){
      state.dragging=true;state.didDrag=false;
      const t0=e.touches[0];const rect=canvas.getBoundingClientRect();
      _touchStartX=t0.clientX-rect.left;_touchStartY=t0.clientY-rect.top;
      state.dragStart={x:t0.clientX,y:t0.clientY,vxMin:state.viewXMin,vxMax:state.viewXMax,vyMin:state.viewYMin,vyMax:state.viewYMax};
      state.pinchDist=null;state.pinchCenter=null;
    }else if(e.touches.length===2){
      state.dragging=false;
      state.pinchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      state.pinchCenter=getTouchCenter(e.touches);
    }
    e.preventDefault();
  }
  function onTouchMove(e){
    if(e.touches.length===1&&state.dragging&&state.dragStart){
      const t0=e.touches[0];
      const dx=t0.clientX-state.dragStart.x,dy=t0.clientY-state.dragStart.y;
      if(Math.abs(dx)>5||Math.abs(dy)>5)state.didDrag=true;
      const rect=canvas.getBoundingClientRect();
      const W=rect.width,H=rect.height;
      const xR=state.dragStart.vxMax-state.dragStart.vxMin;
      const yR=state.dragStart.vyMax-state.dragStart.vyMin;
      state.viewXMin=state.dragStart.vxMin-dx/W*xR;
      state.viewXMax=state.dragStart.vxMax-dx/W*xR;
      state.viewYMin=state.dragStart.vyMin+dy/H*yR;
      state.viewYMax=state.dragStart.vyMax+dy/H*yR;
      redraw();
    }else if(e.touches.length===2&&state.pinchDist!==null){
      const dist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      const factor=state.pinchDist/dist;
      state.pinchDist=dist;
      const c=getTouchCenter(e.touches);
      zoom(state.pinchCenter.gx,state.pinchCenter.gy,factor);
    }
    e.preventDefault();
  }
  function onTouchEnd(e){
    if(!state.didDrag&&state.dragging&&e.changedTouches.length===1){
      const rect=canvas.getBoundingClientRect();
      const t0=e.changedTouches[0];
      const mx=t0.clientX-rect.left,my=t0.clientY-rect.top;
      const g=toGraph(mx,my);
      const snapped=snapToNice(g.gx,state.viewXMax-state.viewXMin,rect.width);
      if(state.selectedX===snapped){state.selectedX=null;updateInfoBox(null);}
      else{state.selectedX=snapped;updateInfoBox(snapped);}
      redraw();
    }
    state.dragging=false;state.didDrag=false;state.pinchDist=null;
  }
  function getTouchCenter(touches){
    const mx=(touches[0].clientX+touches[1].clientX)/2;
    const my=(touches[0].clientY+touches[1].clientY)/2;
    const rect=canvas.getBoundingClientRect();
    return toGraph(mx-rect.left,my-rect.top);
  }

  /* ============================================================
     1:1 アスペクト比の強制
  ============================================================ */
  function enforceAspect(){
    const xRange=state.viewXMax-state.viewXMin;
    if(!isFinite(xRange)||xRange<=0)return;
    const yRange=xRange*CANVAS_ASPECT;
    let yCen=(state.viewYMin+state.viewYMax)/2;
    if(!isFinite(yCen))yCen=0;
    state.viewYMin=yCen-yRange/2;
    state.viewYMax=yCen+yRange/2;
  }

  /* ============================================================
     プロット操作
  ============================================================ */
  function doPlot(){
    waitNim(()=>{
      const xMin=numVal('pl-xmin',state.viewXMin);
      const xMax=numVal('pl-xmax',state.viewXMax);
      if(xMin>=xMax)return;
      state.viewXMin=xMin;state.viewXMax=xMax;
      const isDisc=document.getElementById('pl-discrete')&&document.getElementById('pl-discrete').checked;
      state.fns.forEach(fn=>{
        if(!fn.expr){fn.pts=[];return;}
        fn.pts=isDisc?nimGetDiscrete(fn.expr,xMin,xMax):nimGetPlot(fn.expr,xMin,xMax,800);
      });
      const allYs=state.fns.filter(f=>f.enabled&&f.pts).flatMap(f=>f.pts.map(p=>p.y)).filter(y=>y!==null&&y!==undefined&&isFinite(y));
      let yCen,yHalf;
      if(allYs.length===0){yCen=0;yHalf=1;}
      else{const mn=Math.min(...allYs),mx=Math.max(...allYs);yCen=(mn+mx)/2;yHalf=(mx-mn)/2||1;yHalf*=1.15;}
      const xRangeNew=xMax-xMin;
      const yRangeNew=xRangeNew*CANVAS_ASPECT;
      const safeYCen=isFinite(yCen)?yCen:0;
      state.viewYMin=safeYCen-yRangeNew/2;
      state.viewYMax=safeYCen+yRangeNew/2;
      state.selectedX=null;updateInfoBox(null);
      resize();redraw();
    });
  }

  function resetView(){
    state.viewXMin=numVal('pl-xmin',-6.28);
    state.viewXMax=numVal('pl-xmax',6.28);
    state.selectedX=null;updateInfoBox(null);
    enforceAspect();doPlot();
  }

  /* ============================================================
     計算タブ
  ============================================================ */
  function doCalc(){
    waitNim(()=>{
      const expr=(document.getElementById('pl-calc-expr')||{}).value||(state.fns[0]&&state.fns[0].expr)||'';
      const x=numVal('pl-calc-x',0);
      setResult('pl-res-fx',evalExpr(expr,x));
    });
  }

  /* ============================================================
     微分・積分タブ
  ============================================================ */
  function doDiff(){
    waitNim(()=>{
      const expr=(document.getElementById('pl-diff-expr')||{}).value||(state.fns[0]&&state.fns[0].expr)||'';
      const x=numVal('pl-diff-x',0);
      // 記号微分
      setSymBox('pl-sym-deriv',symbolicDeriv(expr),t('noClosedForm'));
      // 数値微分
      setResult('pl-res-deriv',getDeriv(expr,x));
      setResult('pl-res-deriv2',getSecondDeriv(expr,x));
    });
  }
  function doInteg(){
    waitNim(()=>{
      const expr=(document.getElementById('pl-integ-expr')||{}).value||(state.fns[0]&&state.fns[0].expr)||'';
      const a=numVal('pl-integ-a',-1),b=numVal('pl-integ-b',1);
      // 記号積分
      setSymBox('pl-sym-integ',symbolicInteg(expr),t('noClosedForm'));
      // 数値定積分
      setResult('pl-res-integ',getIntegral(expr,a,b));
    });
  }

  /* ============================================================
     和分・差分タブ
  ============================================================ */
  function doSumCalc(){
    waitNim(()=>{
      const expr=(document.getElementById('pl-sum-expr')||{}).value||(state.fns[0]&&state.fns[0].expr)||'';
      const x=numVal('pl-sum-x',3);
      const order=Math.max(1,Math.round(numVal('pl-sum-order',1)));
      setResult('pl-res-delta',getForwardDiff(expr,x,order));
      setResult('pl-res-nabla',getBackwardDiff(expr,x,order));
    });
  }
  function doDefSum(){
    waitNim(()=>{
      const expr=(document.getElementById('pl-sum-expr')||{}).value||(state.fns[0]&&state.fns[0].expr)||'';
      const a=Math.round(numVal('pl-defsum-a',0)),b=Math.round(numVal('pl-defsum-b',9));
      setResult('pl-res-defsum',getDefiniteSum(expr,a,b));
    });
  }
  function doAntiDiffPlot(){
    waitNim(()=>{
      const expr=(document.getElementById('pl-sum-expr')||{}).value||(state.fns[0]&&state.fns[0].expr)||'';
      const base=Math.round(numVal('pl-ad-base',0)),xMaxA=Math.round(numVal('pl-ad-xmax',10));
      const adPts=nimGetAntiDiff(expr,base,xMaxA,base);
      const mainPts=nimGetPlot(expr,base-1,xMaxA+1,600);
      if(state.fns[0])state.fns[0].pts=mainPts;
      let adFn=state.fns.find(f=>f._isAntiDiff);
      if(!adFn){adFn={expr:'(不定和分)',color:'#c8a84a',enabled:true,pts:[],_isAntiDiff:true};state.fns.push(adFn);const list=document.getElementById('pl-fn-list');if(list)renderFnList(list);}
      adFn.pts=adPts;
      const allYs=[...mainPts,...adPts].map(p=>p.y).filter(y=>y!==null&&isFinite(y));
      const yCen=allYs.length>0?(Math.min(...allYs)+Math.max(...allYs))/2:0;
      state.viewXMin=base-1;state.viewXMax=xMaxA+1;
      enforceAspect();
      state.viewYMin=yCen-(state.viewYMax-state.viewYMin)/2;
      state.viewYMax=yCen+(state.viewYMax-state.viewYMin)/2;
      resize();redraw();
    });
  }

  /* ============================================================
     極限・∞タブ
  ============================================================ */
  function doLimit(){
    waitNim(()=>{
      const expr=(document.getElementById('pl-lim-expr')||{}).value||'';
      const a=numVal('pl-lim-a',0);
      const side=(document.getElementById('pl-lim-side')||{}).value||'both';
      const res=computeLimit(expr,a,side);
      const el2=document.getElementById('pl-res-lim');
      if(!el2)return;
      if(res===null){el2.textContent=t('limitDiverg');el2.style.color='#f07820';}
      else{el2.textContent=parseFloat(res.toPrecision(10)).toString();el2.style.color='';}
    });
  }
  function doInfSum(){
    waitNim(()=>{
      const expr=(document.getElementById('pl-infsum-expr')||{}).value||'';
      const startN=Math.round(numVal('pl-infsum-n',1));
      const res=computeInfSum(expr,startN);
      const el2=document.getElementById('pl-res-infsum');
      if(!el2)return;
      if(res===null){el2.textContent=t('infSumDiverg');el2.style.color='#f07820';}
      else{el2.textContent=parseFloat(res.toPrecision(10)).toString();el2.style.color='';}
    });
  }

  /* ============================================================
     Nim ラッパー
  ============================================================ */
  function nimGetPlot(expr,xMin,xMax,steps){try{return JSON.parse(getPlotPoints(expr,xMin,xMax,steps));}catch{return[];}}
  function nimGetDiscrete(expr,xMin,xMax){try{return JSON.parse(getDiscretePlotPoints(expr,xMin,xMax));}catch{return[];}}
  function nimGetAntiDiff(expr,xMin,xMax,base){try{return JSON.parse(getAntiDiffPoints(expr,xMin,xMax,base));}catch{return[];}}

  /* ============================================================
     ユーティリティ
  ============================================================ */
  function niceStep(rough){if(rough<=0)return 1;const exp=Math.floor(Math.log10(rough));const frac=rough/Math.pow(10,exp);let nice;if(frac<1.5)nice=1;else if(frac<3.5)nice=2;else if(frac<7.5)nice=5;else nice=10;return nice*Math.pow(10,exp);}
  function formatLabel(v){if(Math.abs(v)>=1000||(Math.abs(v)<0.01&&v!==0))return v.toExponential(1);return String(parseFloat(v.toPrecision(4)));}
  function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}

  /* ============================================================
     言語切替
  ============================================================ */
  window.plotterSetLang=function(lang){
    state.lang=lang;
    const ids=[
      ['pl-tab-plot','tabPlot'],['pl-tab-calc','tabCalc'],
      ['pl-tab-diff','tabDiff'],['pl-tab-sum','tabSum'],['pl-tab-limit','tabLimit'],
      ['pl-plot-btn','plotBtn'],['pl-reset-btn','resetView'],['pl-add-fn','addFn'],
      ['pl-ix-btn','showIx'],['pl-ixc-btn','showIxC'],
    ];
    ids.forEach(([id,key])=>{const e=document.getElementById(id);if(e)e.textContent=(key==='showIx'?'⊕ ':'')+t(key);});
    const help=document.getElementById('pl-help');if(help)help.textContent=t('helpText');
  };

  /* ============================================================
     公開 API
  ============================================================ */
  window.initPlotter=function(lang){state.lang=lang||'ja';buildPanel();};

})();
