;; language-simulator.scm — LISP言語進化シミュレーター
;; BiwaScheme (R5RS) で実装

;; ================================================================
;; ユーティリティ
;; ================================================================

(define (string->char-strings s)
  (let loop ((i 0) (acc '()))
    (if (= i (string-length s))
        (reverse acc)
        (loop (+ i 1) (cons (string (string-ref s i)) acc)))))

(define (phonemes->string ps)
  (let loop ((ps ps) (acc ""))
    (if (null? ps) acc
        (loop (cdr ps) (string-append acc (car ps))))))

(define (list-contains? item lst)
  (cond ((null? lst) #f)
        ((equal? item (car lst)) #t)
        (else (list-contains? item (cdr lst)))))

(define (list-filter pred lst)
  (let loop ((l lst) (acc '()))
    (if (null? l) (reverse acc)
        (loop (cdr l) (if (pred (car l)) (cons (car l) acc) acc)))))

(define (prob? pct) (< (js-random-int 100) pct))

(define (random-from lst) (list-ref lst (js-random-int (length lst))))

(define (random-cv)
  (string-append
   (random-from '("k" "t" "n" "m" "s" "r" "w" "h" "p" "l"))
   (random-from '("a" "e" "i" "o" "u"))))

;; 冠詞用: CVC形式
(define (random-cvc)
  (string-append
   (random-from '("k" "t" "n" "m" "s" "r" "w" "h" "p" "l"))
   (random-from '("a" "e" "i" "o" "u"))
   (random-from '("n" "r" "m" "s" "t" "l"))))

(define (random-vowel) (random-from '("a" "e" "i" "o" "u")))

;; ================================================================
;; 音素
;; ================================================================

(define *vowels* '("a" "e" "i" "o" "u" "ä" "ö" "y"))

(define (vowel? p) (list-contains? p *vowels*))
(define (consonant? p) (not (vowel? p)))

(define (last-elem lst)
  (if (null? (cdr lst)) (car lst) (last-elem (cdr lst))))

(define (all-but-last lst)
  (if (or (null? lst) (null? (cdr lst))) '()
      (cons (car lst) (all-but-last (cdr lst)))))

(define (ends-vowel? ps)
  (and (not (null? ps)) (vowel? (last-elem ps))))

(define (ends-consonant? ps)
  (and (not (null? ps)) (consonant? (last-elem ps))))

;; 音素パーサー
(define (parse-phonemes str)
  (let loop ((cs (string->char-strings str)) (acc '()))
    (cond
      ((null? cs) (reverse acc))
      ((and (>= (length cs) 3)
            (or (and (equal? (car cs) "s") (equal? (cadr cs) "c") (equal? (caddr cs) "h"))
                (and (equal? (car cs) "t") (equal? (cadr cs) "c") (equal? (caddr cs) "h"))))
       (loop (cdddr cs) (cons (string-append (car cs) (cadr cs) (caddr cs)) acc)))
      ((and (>= (length cs) 2)
            (list-contains? (string-append (car cs) (cadr cs))
                            '("sh" "ch" "ts" "pf" "ck" "tz" "qu" "nk")))
       (loop (cddr cs) (cons (string-append (car cs) (cadr cs)) acc)))
      (else (loop (cdr cs) (cons (car cs) acc))))))

;; ================================================================
;; グローバル状態
;; ================================================================
;; 単語インデックス (HTMLの入力スロットと対応):
;; 0=私(I/1SG)     1=僕(I/poss)   2=君(you/2SG)  3=彼(he/3SG)
;; 4=りんご(apple) 5=ワイン(wine) 6=友達(friend)  7=食べる(eat)
;; 8=飲む(drink)   9=好き(like)   10=である(be)   11=昨日(yesterday)

(define *words*   #f)
(define *mode*    'J)
(define *gen*     0)
(define *history* '())
(define *grammar* #f)

;; 文法ベクタ [0..20]
;; [0]  語順: 'SOV 'SVO 'FREE
;; [1]  主語省略: #f #t
;; [2]  冠詞: 'NONE 'INDEF 'DEF
;; [3]  所有表現: 'GENITIV 'POSSADJ 'POSSSUF
;; [4]  コピュラ: 'REQUIRED 'OPTIONAL 'NONE
;; [5]  動詞語尾: string
;; [6]  主語助詞: string
;; [7]  対格助詞/格語尾: string
;; [8]  冠詞形: string
;; [9]  所有助詞: string
;; [10] 過去補助語: string or ""
;; [11] 動詞活用: #f #t
;; [12] 主格語尾: string
;; [13] V2語順: #f #t
;; [14] 性別体系フラグ: #f #t
;; [15] J:副詞位置: 'FREE 'PREVERB
;; [16] J:動詞終端固定: #f #t
;; [17] D:性別語尾リスト: '() or '(masc-sfx fem-sfx neut-sfx)
;; [18] D:新コピュラ: string ""
;; [19] F:格依存構文化: #f #t
;; [20] F:融合レベル: integer 0..3

(define (g i)   (vector-ref *grammar* i))
(define (g! i v) (vector-set! *grammar* i v))

(define (init-grammar!)
  (set! *grammar* (make-vector 21 #f))
  (g! 0 'SOV) (g! 1 #f) (g! 2 'NONE) (g! 3 'GENITIV)
  (g! 4 'REQUIRED) (g! 5 "") (g! 6 "") (g! 7 "")
  (g! 8 "") (g! 9 "no") (g! 10 "") (g! 11 #f)
  (g! 12 "") (g! 13 #f) (g! 14 #f)
  (g! 15 'FREE) (g! 16 #f) (g! 17 '()) (g! 18 "") (g! 19 #f) (g! 20 0))

;; ================================================================
;; 履歴記録
;; ================================================================

(define (rec! desc)
  (set! *history* (cons (list *gen* desc) *history*)))

;; ================================================================
;; J モード 音韻変化
;; ================================================================

(define (apply-j-phon! idx)
  (let* ((w0 (vector-ref *words* idx))
         (w  w0))

    ;; 高確率12%: 子音連続解消
    (when (prob? 12)
      (let ((nw (j-resolve-cc w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 子音連続解消")))))

    ;; 高確率13%: 語末子音脱落 (n除く)
    (when (and (prob? 13) (ends-consonant? w)
               (not (equal? (last-elem w) "n"))
               (> (length w) 1))
      (set! w (all-but-last w))
      (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 語末子音脱落")))

    ;; 高確率11%: 母音挿入 cc→cvc
    (when (prob? 11)
      (let ((nw (j-insert-vowel w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 母音挿入")))))

    ;; 中確率7%: 語頭p→h
    (when (and (prob? 7) (not (null? w)) (equal? (car w) "p"))
      (set! w (cons "h" (cdr w)))
      (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 語頭p→h")))

    ;; 中確率8%: ti→chi
    (when (prob? 8)
      (let ((nw (replace-pair w "t" "i" "ch" "i")))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] ti→chi")))))

    ;; 中確率8%: si→shi
    (when (prob? 8)
      (let ((nw (replace-pair w "s" "i" "sh" "i")))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] si→shi")))))

    ;; 中確率7%: cvcv促音化 (同一母音, 2番目のcがl/r/m/y以外, hはpに)
    (when (prob? 7)
      (let ((nw (j-geminate w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 促音化")))))

    ;; 低確率4%: 前にiがあるaのya化 (ia→iya)
    (when (prob? 4)
      (let ((nw (j-ia-to-iya w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] ia→iya")))))

    ;; 低確率4%: 子音濁音化
    (when (prob? 4)
      (let ((nw (j-voice w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 子音濁音化")))))

    ;; 極低確率2%: 開音節化
    (when (prob? 2)
      (let ((nw (j-open-syllable w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 開音節化")))))

    ;; ── 共通サニタイザー ──────────────────────────────────────────
    (set! w (apply-shared-sanitizers! idx w))

    (vector-set! *words* idx w)))

(define (j-resolve-cc ps)
  (let loop ((p ps) (prev-c #f) (acc '()))
    (if (null? p) (reverse acc)
        (if (and prev-c (consonant? (car p)))
            (loop (cdr p) #t acc)
            (loop (cdr p) (consonant? (car p)) (cons (car p) acc))))))

(define (j-insert-vowel ps)
  (let loop ((p ps) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ((null? (cdr p)) (reverse (cons (car p) acc)))
      ((and (consonant? (car p)) (consonant? (cadr p)))
       (loop (cdr p) (cons (random-vowel) (cons (car p) acc))))
      (else (loop (cdr p) (cons (car p) acc))))))

(define (replace-pair ps f1 f2 t1 t2)
  (let loop ((p ps) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ((null? (cdr p)) (reverse (cons (car p) acc)))
      ((and (equal? (car p) f1) (equal? (cadr p) f2))
       (loop (cddr p) (cons t2 (cons t1 acc))))
      (else (loop (cdr p) (cons (car p) acc))))))

;; cvcv促音化: C1V1C2V2でV1==V2かつC2∉{l,r,m,y} → C1V1C2C2V2
;; C2=="h"のときはpとして重複させる
(define (j-geminate ps)
  (let ((non-gem '("l" "r" "m" "y")))
    (let loop ((p ps) (acc '()))
      (cond
        ((or (null? p) (null? (cdr p)) (null? (cddr p)) (null? (cdr (cddr p))))
         (append (reverse acc) p))
        ((and (consonant? (car p))
              (vowel? (cadr p))
              (consonant? (caddr p))
              (vowel? (car (cdr (cddr p))))
              (equal? (cadr p) (car (cdr (cddr p))))
              (not (list-contains? (caddr p) non-gem)))
         (let* ((c1  (car p))
                (v1  (cadr p))
                (c2  (caddr p))
                (v2  (car (cdr (cddr p))))
                (rest (cdr (cdr (cddr p))))
                (c2g (if (equal? c2 "h") "p" c2)))
           (loop rest (cons v2 (cons c2g (cons c2g (cons v1 (cons c1 acc))))))))
        (else (loop (cdr p) (cons (car p) acc)))))))

;; 前にiがあるaのya化: ia → iya
(define (j-ia-to-iya ps)
  (let loop ((p ps) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ((null? (cdr p)) (reverse (cons (car p) acc)))
      ((and (equal? (car p) "i") (equal? (cadr p) "a"))
       (loop (cddr p) (cons "a" (cons "y" (cons "i" acc)))))
      (else (loop (cdr p) (cons (car p) acc))))))

(define (j-voice ps)
  (let ((vm '(("s" . "z") ("k" . "g") ("m" . "b"))))
    (let loop ((p ps) (acc '()) (done #f))
      (cond
        ((null? p) (reverse acc))
        (done (loop (cdr p) (cons (car p) acc) #t))
        (else
         (let ((pr (assoc (car p) vm)))
           (if (and pr (prob? 50))
               (loop (cdr p) (cons (cdr pr) acc) #t)
               (loop (cdr p) (cons (car p) acc) #f))))))))

(define (j-open-syllable ps)
  (let loop ((p ps) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ((null? (cdr p)) (reverse (cons (car p) acc)))
      ((and (consonant? (car p)) (consonant? (cadr p)))
       (loop (cdr p) (cons (random-vowel) (cons (car p) acc))))
      (else (loop (cdr p) (cons (car p) acc))))))

;; ================================================================
;; D モード 音韻変化
;; ================================================================

(define (apply-d-phon! idx)
  (let* ((w0 (vector-ref *words* idx))
         (w  w0))

    ;; 高確率15%: 語末母音脱落
    (when (and (prob? 15) (ends-vowel? w) (> (length w) 1))
      (set! w (all-but-last w))
      (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 語末母音脱落")))

    ;; 高確率12%: 語頭母音脱落によるstr/spr形成
    (when (prob? 12)
      (let ((nw (d-str-spr w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] str/spr形成")))))

    ;; 高確率10%: ランダムな開音節の縮小
    (when (and (prob? 10) (> (length w) 2))
      (let ((nw (d-reduce-open w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 開音節縮小")))))

    ;; 高確率10%: ランダムな開音節の追加
    (when (prob? 10)
      (let ((nw (d-add-open w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 開音節追加")))))

    ;; 高確率18%: 語末閉鎖音無声化
    (when (prob? 18)
      (let ((nw (d-devoice-final w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 語末閉鎖音無声化")))))

    ;; 高確率13%: s→sch
    (when (prob? 13)
      (let ((nw (map (lambda (p) (if (equal? p "s") "sch" p)) w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] s→sch")))))

    ;; 高確率12%: 語末母音→子音追加
    (when (and (prob? 12) (ends-vowel? w))
      (set! w (append w (list (random-from '("n" "r" "l" "t" "s")))))
      (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 語末子音追加")))

    ;; 中確率8%: p→f
    (when (prob? 8)
      (let ((nw (map (lambda (p) (if (equal? p "p") "f" p)) w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] p→f")))))

    ;; 中確率9%: k→ch
    (when (prob? 9)
      (let ((nw (map (lambda (p) (if (equal? p "k") "ch" p)) w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] k→ch")))))

    ;; 中確率7%: 連続する同母音の短縮 (aa→a)
    (when (prob? 7)
      (let ((nw (d-shorten-vowels w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 同母音短縮")))))

    ;; 中確率7%: 語中最初のe→ei
    (when (prob? 7)
      (let ((nw (d-e-to-ei w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] e→ei")))))

    ;; 中確率6%: 語中最初のe→eu
    (when (prob? 6)
      (let ((nw (d-e-to-eu w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] e→eu")))))

    ;; 低確率4%: p→pf
    (when (prob? 4)
      (let ((nw (map (lambda (p) (if (equal? p "p") "pf" p)) w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] p→pf")))))

    ;; 低確率4%: 次の音節にi/eがあるa/o/uのウムラウト化
    (when (prob? 4)
      (let ((nw (d-umlaut w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] ウムラウト化")))))

    ;; 低確率3%: 前に母音がある子音の重複化 (r,d除く)
    (when (prob? 3)
      (let ((nw (d-geminate w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 子音重複化")))))

    ;; 低確率3%: 語末に同母音が連続する場合に語末にr追加
    (when (prob? 3)
      (let ((nw (d-final-r w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 語末r追加")))))

    ;; 低確率3%: k→chs
    (when (prob? 3)
      (let ((nw (map (lambda (p) (if (equal? p "k") "chs" p)) w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] k→chs")))))

    ;; 極低確率2%: 語末の母音が重複化
    (when (and (prob? 2) (ends-vowel? w))
      (set! w (append w (list (last-elem w))))
      (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 語末母音重複")))

    ;; 極低確率1%: 語頭CVC(C1=k, V, C2=w) → qu
    (when (prob? 1)
      (let ((nw (d-kw-to-qu w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] kVw→qu")))))

    ;; 高確率80%: 語頭のchsはkに変化
    (when (prob? 80)
      (let ((nw (d-chs-to-k-initial w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 語頭chs→k")))))

    ;; 中確率7%: ランダムな子音削除
    (when (prob? 7)
      (let ((nw (d-delete-random-consonant w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 子音削除")))))

    ;; ── 共通サニタイザー ──────────────────────────────────────────
    (set! w (apply-shared-sanitizers! idx w))

    (vector-set! *words* idx w)))

(define (d-devoice-final ps)
  (if (or (null? ps) (null? (cdr ps))) ps
      (let* ((rev (reverse ps)) (last (car rev))
             (dv (cond ((equal? last "b") "p") ((equal? last "d") "t")
                       ((equal? last "g") "k") (else last))))
        (reverse (cons dv (cdr rev))))))

;; 語頭の母音脱落によりstr/spr形成: s V t/p r → s t/p r
(define (d-str-spr ps)
  (if (and (>= (length ps) 4)
           (equal? (car ps) "s")
           (vowel? (cadr ps))
           (or (equal? (caddr ps) "t") (equal? (caddr ps) "p"))
           (equal? (car (cdddr ps)) "r"))
      (cons "s" (cddr ps))
      ps))

;; ランダムな開音節(CV)の縮小: CV対を1つ探してまるごと削除
(define (d-reduce-open ps)
  (let* ((pairs (let loop ((p ps) (i 0) (acc '()))
                  (cond
                    ((or (null? p) (null? (cdr p))) (reverse acc))
                    ((and (consonant? (car p)) (vowel? (cadr p)))
                     (loop (cddr p) (+ i 2) (cons i acc)))
                    (else (loop (cdr p) (+ i 1) acc))))))
    (if (null? pairs)
        ps
        (let ((target (random-from pairs)))
          (let loop2 ((p ps) (i 0) (acc '()))
            (cond
              ((null? p) (reverse acc))
              ((= i target) (loop2 (cddr p) (+ i 2) acc))
              (else (loop2 (cdr p) (+ i 1) (cons (car p) acc)))))))))

;; ランダムな開音節(CV)の追加: ランダムな位置にCV音節を挿入
(define (d-add-open ps)
  (if (null? ps)
      ps
      (let* ((pos (js-random-int (+ (length ps) 1)))
             (c   (random-from '("k" "t" "n" "m" "s" "r" "w" "h" "p" "l")))
             (v   (random-vowel)))
        (let loop ((p ps) (i 0) (acc '()))
          (if (= i pos)
              (append (reverse acc) (list c v) p)
              (if (null? p)
                  (append (reverse acc) (list c v))
                  (loop (cdr p) (+ i 1) (cons (car p) acc))))))))

;; 連続する同母音の短縮: aa→a, ee→e など
(define (d-shorten-vowels ps)
  (let loop ((p ps) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ((null? (cdr p)) (reverse (cons (car p) acc)))
      ((and (vowel? (car p)) (equal? (car p) (cadr p)))
       (loop (cddr p) (cons (car p) acc)))
      (else (loop (cdr p) (cons (car p) acc))))))

(define (d-e-to-ei ps)
  (let loop ((p ps) (acc '()) (done #f))
    (cond
      ((null? p) (reverse acc))
      ((and (not done) (equal? (car p) "e") (not (null? (cdr p))) (consonant? (cadr p)))
       (loop (cdr p) (cons "i" (cons "e" acc)) #t))
      (else (loop (cdr p) (cons (car p) acc) done)))))

;; 語中最初のe→eu
(define (d-e-to-eu ps)
  (let loop ((p ps) (acc '()) (done #f))
    (cond
      ((null? p) (reverse acc))
      ((and (not done) (equal? (car p) "e") (not (null? (cdr p))) (consonant? (cadr p)))
       (loop (cdr p) (cons "u" (cons "e" acc)) #t))
      (else (loop (cdr p) (cons (car p) acc) done)))))

;; 次にi/eが来るa/o/uのウムラウト化
(define (d-umlaut ps)
  (let loop ((p ps) (acc '()))
    (if (null? p)
        (reverse acc)
        (let ((phoneme (car p))
              (rest    (cdr p)))
          (if (and (list-contains? phoneme '("a" "o" "u"))
                   (let has-ie? ((r rest))
                     (cond ((null? r) #f)
                           ((list-contains? (car r) '("i" "e")) #t)
                           (else (has-ie? (cdr r))))))
              (let ((umlauted (cond ((equal? phoneme "a") "ä")
                                    ((equal? phoneme "o") "ö")
                                    ((equal? phoneme "u") "y")
                                    (else phoneme))))
                (loop rest (cons umlauted acc)))
              (loop rest (cons phoneme acc)))))))

;; 前に母音がある子音の重複化 (r, d, c, b, w, chs, qu, h 除く)
(define (d-geminate ps)
  (let loop ((p ps) (prev #f) (acc '()) (done #f))
    (cond
      ((null? p) (reverse acc))
      ((and (not done)
            (consonant? (car p))
            prev
            (vowel? prev)
            (not (list-contains? (car p) '("r" "d" "c" "b" "w" "chs" "qu" "h"))))
       (loop (cdr p) (car p) (cons (car p) (cons (car p) acc)) #t))
      (else (loop (cdr p) (car p) (cons (car p) acc) done)))))

;; 語頭の chs → k
(define (d-chs-to-k-initial ps)
  (if (and (not (null? ps)) (equal? (car ps) "chs"))
      (cons "k" (cdr ps))
      ps))

;; ランダムな子音1つを削除 (語末以外から)
(define (d-delete-random-consonant ps)
  (if (or (null? ps) (null? (cdr ps))) ps
      (let* ((init (all-but-last ps))
             (candidates
              (let loop ((p init) (i 0) (acc '()))
                (if (null? p) (reverse acc)
                    (loop (cdr p) (+ i 1)
                          (if (consonant? (car p)) (cons i acc) acc))))))
        (if (null? candidates)
            ps
            (let ((target (random-from candidates)))
              (let loop ((p ps) (i 0) (acc '()))
                (cond
                  ((null? p) (reverse acc))
                  ((= i target) (loop (cdr p) (+ i 1) acc))
                  (else (loop (cdr p) (+ i 1) (cons (car p) acc))))))))))

;; ─── D モード 母音系サニタイザー ──────────────────────────────────

;; 許容される二重母音か判定 (ei eu äu ie ai au oi ui)
(define (d-allowed-diphthong? v1 v2)
  (or (and (equal? v1 "e") (or (equal? v2 "i") (equal? v2 "u")))
      (and (equal? v1 "ä") (equal? v2 "u"))
      (and (equal? v1 "i") (equal? v2 "e"))
      (and (equal? v1 "a") (or (equal? v2 "i") (equal? v2 "u")))
      (and (equal? v1 "o") (equal? v2 "i"))
      (and (equal? v1 "u") (equal? v2 "i"))))

;; 異なる母音が3つ以上連続 → 先頭1つのみ残す
(define (d-collapse-triple-vowels ps)
  (let loop ((p ps) (streak 0) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ((vowel? (car p))
       (if (>= streak 2)
           (loop (cdr p) (+ streak 1) acc)
           (loop (cdr p) (+ streak 1) (cons (car p) acc))))
      (else
       (loop (cdr p) 0 (cons (car p) acc))))))

;; 許容されない母音連続を解消: VV で diphthong でなければ後の V を捨てる
;; 許容二重母音を通過させ、二重母音に続く3つ目以降の母音も捨てる
(define (d-collapse-vowel-sequences ps)
  (let loop ((p ps) (acc '()) (prev-v #f) (in-diph #f))
    (cond
      ((null? p) (reverse acc))
      ((vowel? (car p))
       (if prev-v
           ;; 連続母音
           (if (and (not in-diph) (d-allowed-diphthong? prev-v (car p)))
               ;; 許容 diphthong: 保持してフラグon
               (loop (cdr p) (cons (car p) acc) (car p) #t)
               ;; 許容外 or 二重母音の後: 捨てる
               (loop (cdr p) acc prev-v in-diph))
           ;; 初母音: 保持
           (loop (cdr p) (cons (car p) acc) (car p) #f)))
      (else
       (loop (cdr p) (cons (car p) acc) #f #f)))))

;; y母音の消滅
(define (d-delete-y ps)
  (list-filter (lambda (p) (not (equal? p "y"))) ps))

;; ランダムな母音1つを削除 (語長が2以上の場合のみ)
(define (d-delete-random-vowel ps)
  (if (<= (length ps) 1) ps
      (let ((candidates
             (let loop ((p ps) (i 0) (acc '()))
               (if (null? p) (reverse acc)
                   (loop (cdr p) (+ i 1)
                         (if (vowel? (car p)) (cons i acc) acc))))))
        (if (null? candidates)
            ps
            (let ((target (random-from candidates)))
              (let loop ((p ps) (i 0) (acc '()))
                (cond
                  ((null? p) (reverse acc))
                  ((= i target) (loop (cdr p) (+ i 1) acc))
                  (else (loop (cdr p) (+ i 1) (cons (car p) acc))))))))))

;; 語末に同母音が連続する場合に語末にr追加
(define (d-final-r ps)
  (if (< (length ps) 2)
      ps
      (let* ((rev (reverse ps))
             (last (car rev))
             (second-last (cadr rev)))
        (if (and (vowel? last) (equal? last second-last))
            (append ps '("r"))
            ps))))

;; 語頭CVC(C1=k, V, C2=w) → qu
(define (d-kw-to-qu ps)
  (if (and (>= (length ps) 3)
           (equal? (car ps) "k")
           (vowel? (cadr ps))
           (equal? (caddr ps) "w"))
      (cons "qu" (cdddr ps))
      ps))

;; ================================================================
;; F モード 音韻変化
;; ================================================================

(define (apply-f-phon! idx)
  (let* ((w0 (vector-ref *words* idx))
         (w  w0))

    ;; 高確率15%: 母音調和
    (when (prob? 15)
      (let ((nw (f-vowel-harmony w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 母音調和")))))

    ;; 高確率14%: 語末開音節化 (最近傍母音を追加)
    (when (and (prob? 14) (ends-consonant? w))
      (let* ((lv  (f-last-vowel w))
             (add (if lv lv (random-vowel))))
        (set! w (append w (list add)))
        (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 語末開音節化"))))

    ;; 高確率13%: 長母音縮約 (3つ以上の同母音連続→2つに吸収)
    (when (prob? 13)
      (let ((nw (f-long-vowel-reduce w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 長母音縮約")))))

    ;; 中確率8%: 子音弱化 (語末以外) / 語末では子音強化
    (when (prob? 8)
      (let* ((nw-weak (f-weaken w))
             (nw      (f-strengthen-final nw-weak)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 子音弱化/強化")))))

    ;; 中確率6%: ia→ija
    (when (prob? 6)
      (let ((nw (f-ia-to-ija w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] ia→ija")))))

    ;; 中確率7%: 語中k→nk
    (when (prob? 7)
      (let ((nw (f-k-to-nk w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] k→nk語中化")))))

    ;; 低確率3%: 長母音間h挿入 aa→aha
    (when (prob? 3)
      (let ((nw (f-insert-h w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 長母音h挿入")))))

    ;; 低確率3%: 語末が子音の場合にランダムな母音追加
    (when (and (prob? 3) (ends-consonant? w))
      (set! w (append w (list (random-vowel))))
      (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 語末ランダム母音追加")))

    ;; 低確率4%: 語中のt→ts (語頭・語末は除く)
    (when (prob? 4)
      (let ((nw (f-t-to-ts-medial w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 語中t→ts")))))

    ;; 極低確率2%: 母音調和の完全な崩壊
    (when (prob? 2)
      (let ((nw (f-harmony-collapse w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] 母音調和崩壊")))))

    ;; 極低確率2%: e→i / b→p
    (when (prob? 2)
      (let ((nw (map (lambda (p) (cond ((equal? p "e") "i") ((equal? p "b") "p") (else p))) w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] e→i/b→p")))))

    ;; 中確率7%: nt→nn
    (when (prob? 7)
      (let ((nw (f-nt-to-nn w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] nt→nn")))))

    ;; 中確率7%: nk→ng
    (when (prob? 7)
      (let ((nw (f-nk-to-ng w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] nk→ng")))))

    ;; 中確率6%: t→d (軟化)
    (when (prob? 6)
      (let ((nw (map (lambda (p) (if (equal? p "t") "d" p)) w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] t→d")))))

    ;; 中確率6%: p→v (軟化)
    (when (prob? 6)
      (let ((nw (map (lambda (p) (if (equal? p "p") "v" p)) w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] p→v")))))

    ;; 低確率3%: nn→nt (逆変化)
    (when (prob? 3)
      (let ((nw (f-nn-to-nt w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] nn→nt")))))

    ;; 低確率3%: ng→nk (逆変化)
    (when (prob? 3)
      (let ((nw (f-ng-to-nk w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] ng→nk")))))

    ;; 低確率3%: d→t (逆変化)
    (when (prob? 3)
      (let ((nw (map (lambda (p) (if (equal? p "d") "t" p)) w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] d→t(逆)")))))

    ;; 低確率3%: v→p (逆変化)
    (when (prob? 3)
      (let ((nw (map (lambda (p) (if (equal? p "v") "p" p)) w)))
        (unless (equal? nw w)
          (set! w nw)
          (rec! (string-append "音韻 [" (phonemes->string w0) "]→[" (phonemes->string w) "] v→p(逆)")))))

    ;; ── 共通サニタイザー ──────────────────────────────────────────
    (set! w (apply-shared-sanitizers! idx w))

    (vector-set! *words* idx w)))

(define (f-vowel-harmony ps)
  (let* ((fronts (length (list-filter (lambda (p) (list-contains? p '("ä" "ö" "y"))) ps)))
         (backs  (length (list-filter (lambda (p) (list-contains? p '("a" "o" "u"))) ps)))
         (use-f  (> fronts backs)))
    (map (lambda (p)
           (cond ((and use-f (equal? p "a")) "ä")
                 ((and use-f (equal? p "o")) "ö")
                 ((and use-f (equal? p "u")) "y")
                 ((and (not use-f) (equal? p "ä")) "a")
                 ((and (not use-f) (equal? p "ö")) "o")
                 ((and (not use-f) (equal? p "y")) "u")
                 (else p)))
         ps)))

(define (f-last-vowel ps)
  (let loop ((p (reverse ps)))
    (if (null? p) #f
        (if (vowel? (car p)) (car p) (loop (cdr p))))))

;; 語末以外で子音弱化 (kk→k, pp→p, tt→t, mm→m, nn→n)
(define (f-weaken ps)
  (if (or (null? ps) (null? (cdr ps)))
      ps
      (let* ((gm   '(("kk" . "k") ("pp" . "p") ("tt" . "t") ("mm" . "m") ("nn" . "n")))
             (init (all-but-last ps))
             (last (last-elem ps))
             (weakened-init
              (map (lambda (p)
                     (let ((pr (assoc p gm))) (if pr (cdr pr) p)))
                   init)))
        (append weakened-init (list last)))))

;; 語末限定の子音強化 (k→kk, p→pp, t→tt, m→mm, n→nn)
(define (f-strengthen-final ps)
  (if (null? ps)
      ps
      (let* ((last (last-elem ps))
             (sm   '(("k" . "kk") ("p" . "pp") ("t" . "tt") ("m" . "mm") ("n" . "nn")))
             (pr   (assoc last sm)))
        (if (and pr (ends-consonant? ps))
            (append (all-but-last ps) (list (cdr pr)))
            ps))))

;; 長母音縮約: 3つ以上の同母音連続→2つに吸収
(define (f-long-vowel-reduce ps)
  (let loop ((p ps) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ((null? (cdr p)) (reverse (cons (car p) acc)))
      ((null? (cddr p)) (reverse (cons (cadr p) (cons (car p) acc))))
      ((and (vowel? (car p))
            (equal? (car p) (cadr p))
            (equal? (cadr p) (caddr p)))
       (loop (cdddr p) (cons (cadr p) (cons (car p) acc))))
      (else (loop (cdr p) (cons (car p) acc))))))

;; ia→ija
(define (f-ia-to-ija ps)
  (let loop ((p ps) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ((null? (cdr p)) (reverse (cons (car p) acc)))
      ((and (equal? (car p) "i") (equal? (cadr p) "a"))
       (loop (cddr p) (cons "a" (cons "j" (cons "i" acc)))))
      (else (loop (cdr p) (cons (car p) acc))))))

(define (f-k-to-nk ps)
  (if (or (null? ps) (null? (cdr ps))) ps
      (let loop ((p ps) (prev #f) (acc '()))
        (cond
          ((null? p) (reverse acc))
          ((and (equal? (car p) "k") prev (vowel? prev) (not (null? (cdr p))))
           (loop (cdr p) "nk" (cons "nk" acc)))
          (else (loop (cdr p) (car p) (cons (car p) acc)))))))

(define (f-insert-h ps)
  (let loop ((p ps) (prev #f) (acc '()))
    (if (null? p) (reverse acc)
        (if (and prev (vowel? prev) (equal? (car p) prev))
            (loop (cdr p) (car p) (cons (car p) (cons "h" acc)))
            (loop (cdr p) (car p) (cons (car p) acc))))))

;; 語中のt→ts (語頭・語末は除く)
(define (f-t-to-ts-medial ps)
  (let ((len (length ps)))
    (if (< len 3)
        ps
        (let loop ((p ps) (i 0) (acc '()))
          (cond
            ((null? p) (reverse acc))
            ((and (> i 0)
                  (< (+ i 1) len)
                  (equal? (car p) "t"))
             (loop (cdr p) (+ i 1) (cons "ts" acc)))
            (else (loop (cdr p) (+ i 1) (cons (car p) acc))))))))

;; nt→nn (n + t → nn単音素)
(define (f-nt-to-nn ps)
  (let loop ((p ps) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ((null? (cdr p)) (reverse (cons (car p) acc)))
      ((and (equal? (car p) "n") (equal? (cadr p) "t"))
       (loop (cddr p) (cons "nn" acc)))
      (else (loop (cdr p) (cons (car p) acc))))))

;; nk→ng (nk単音素 → ng)
(define (f-nk-to-ng ps)
  (map (lambda (p) (if (equal? p "nk") "ng" p)) ps))

;; nn→nt (nn単音素または隣接n+n → n+t)
(define (f-nn-to-nt ps)
  (let loop ((p ps) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ;; nn 単音素
      ((equal? (car p) "nn")
       (loop (cdr p) (cons "t" (cons "n" acc))))
      ;; 隣接 n + n
      ((and (not (null? (cdr p))) (equal? (car p) "n") (equal? (cadr p) "n"))
       (loop (cddr p) (cons "t" (cons "n" acc))))
      (else (loop (cdr p) (cons (car p) acc))))))

;; ng→nk (ng単音素または隣接n+g → nk単音素)
(define (f-ng-to-nk ps)
  (let loop ((p ps) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ((equal? (car p) "ng")
       (loop (cdr p) (cons "nk" acc)))
      ((and (not (null? (cdr p))) (equal? (car p) "n") (equal? (cadr p) "g"))
       (loop (cddr p) (cons "nk" acc)))
      (else (loop (cdr p) (cons (car p) acc))))))

;; 母音調和の完全な崩壊: 調和母音をランダムに反転
(define (f-harmony-collapse ps)
  (map (lambda (p)
         (cond
           ((equal? p "ä") (if (prob? 50) "a"  p))
           ((equal? p "ö") (if (prob? 50) "o"  p))
           ((equal? p "y") (if (prob? 50) "u"  p))
           ((equal? p "a") (if (prob? 50) "ä"  p))
           ((equal? p "o") (if (prob? 50) "ö"  p))
           ((equal? p "u") (if (prob? 50) "y"  p))
           (else p)))
       ps))

;; ================================================================
;; 共通音韻サニタイザー  (J / D / F 全モードから呼ばれる)
;; ================================================================

;; ① 語頭の同一子音連続を1つに: nno... → no...
(define (phon-dedupe-initial ps)
  (if (or (null? ps) (not (consonant? (car ps)))) ps
      (let ((c (car ps)))
        (let loop ((rest (cdr ps)))
          (if (and (not (null? rest)) (equal? (car rest) c))
              (loop (cdr rest))
              (cons c rest))))))

;; ② 同一子音が3つ以上連続している場合はすべて1つに (位置不問)
;;    (フィン語の長子音 kk/pp/tt 等は2つで止まるので基本的に影響しない)
(define (phon-triple-same-cons ps)
  (let loop ((p ps) (acc '()))
    (cond
      ((null? p) (reverse acc))
      ((null? (cdr p)) (reverse (cons (car p) acc)))
      ((null? (cddr p)) (reverse (cons (cadr p) (cons (car p) acc))))
      ((and (consonant? (car p))
            (equal? (car p) (cadr p))
            (equal? (cadr p) (caddr p)))
       ;; 3個以上の同一子音 → 全部スキップして1個だけ追加
       (let skip ((rest (cddr p)) (c (car p)))
         (if (and (not (null? rest)) (equal? (car rest) c))
             (skip (cdr rest) c)
             (loop rest (cons c acc)))))
      (else (loop (cdr p) (cons (car p) acc))))))

;; ③ 語頭の n が次の文字も子音のとき消滅: nka... → ka...
(define (phon-drop-initial-n ps)
  (if (and (not (null? ps))
           (equal? (car ps) "n")
           (not (null? (cdr ps)))
           (consonant? (cadr ps)))
      (cdr ps)
      ps))

;; ④ 種類を問わず子音3つ以上連続 → 先頭のみ残す
;;    例外: 語頭の str / spr (s+t/p+r) は3子音クラスターとして許容
(define (phon-collapse-triple-cc ps)
  (let ((allow-str-spr
         (and (>= (length ps) 3)
              (equal? (car ps) "s")
              (or (equal? (cadr ps) "t") (equal? (cadr ps) "p"))
              (equal? (caddr ps) "r"))))
    (let loop ((p ps) (pos 0) (streak 0) (acc '()))
      (cond
        ((null? p) (reverse acc))
        ((consonant? (car p))
         (let ((exempt? (and allow-str-spr (< pos 3))))
           (if (and (>= streak 2) (not exempt?))
               ;; 3本目以降の連続子音 → 捨てる
               (loop (cdr p) (+ pos 1) (+ streak 1) acc)
               (loop (cdr p) (+ pos 1) (+ streak 1) (cons (car p) acc)))))
        (else
         (loop (cdr p) (+ pos 1) 0 (cons (car p) acc)))))))

;; 共通サニタイザー呼び出しマクロ相当のヘルパー
;; (各モードのapply-X-phon!の末尾でまとめて呼ぶ)
(define (apply-shared-sanitizers! idx w0-ref)
  ;; w0-ref は (vector-ref *words* idx) の初期値を参照する必要がないため
  ;; 現在のwをそのまま受け取り更新後の値を返す
  (let ((w w0-ref))
    (when (prob? 80)
      (set! w (phon-dedupe-initial w)))
    (when (prob? 80)
      (set! w (phon-triple-same-cons w)))
    (when (prob? 80)
      (set! w (phon-drop-initial-n w)))
    (when (prob? 80)
      (set! w (phon-collapse-triple-cc w)))
    w))

;; ================================================================
;; 文法変化
;; ================================================================

(define (apply-j-grammar!)
  ;; 高確率10%: SOV化（他語順から回帰）
  (when (and (prob? 10) (not (equal? (g 0) 'SOV)))
    (g! 0 'SOV)
    (rec! "文法: SOV語順への回帰"))

  (when (and (prob? 10) (equal? (g 6) ""))
    (g! 6 (random-cv))
    (rec! (string-append "文法: 主語助詞 -" (g 6) " 発生")))
  (when (and (prob? 10) (equal? (g 7) ""))
    (g! 7 (random-cv))
    (rec! (string-append "文法: 目的語助詞 -" (g 7) " 発生")))
  (when (and (prob? 10) (equal? (g 5) ""))
    (g! 5 (random-cv))
    (rec! (string-append "文法: 動詞語尾 -" (g 5) " 発生")))
  (when (and (prob? 6) (equal? (g 9) "no"))
    (g! 9 (random-cv))
    (rec! (string-append "文法: 所有助詞 [no]→[" (g 9) "] 変化")))

  ;; 中確率8%: 副詞位置の動詞直前固定
  (when (and (prob? 8) (equal? (g 15) 'FREE))
    (g! 15 'PREVERB)
    (rec! "文法: 副詞位置を動詞直前に固定"))

  ;; 中確率7%: 動詞終端固定
  (when (and (prob? 7) (not (g 16)))
    (g! 16 #t)
    (rec! "文法: 動詞の文末固定"))

  (when (and (prob? 4) (not (equal? (g 5) "")) (equal? (g 10) ""))
    (g! 10 (random-cv))
    (rec! (string-append "文法: 過去語尾 -" (g 10) " 分化")))
  (when (and (prob? 3) (not (g 1)))
    (g! 1 #t)
    (rec! "文法: 主語省略の許容"))
  (when (and (prob? 3) (equal? (g 4) 'REQUIRED))
    (g! 4 'OPTIONAL)
    (vector-set! *words* 10 (parse-phonemes (random-cv)))
    (rec! "文法: コピュラの短縮"))
  (when (and (prob? 1) (equal? (g 4) 'OPTIONAL))
    (g! 4 'NONE)
    (rec! "文法: コピュラの消失")))

(define (apply-d-grammar!)
  (when (and (prob? 8) (equal? (g 0) 'SOV))
    (g! 0 'SVO)
    (rec! "文法: 語順 SOV→SVO"))
  ;; 冠詞はCVC形式で発生
  (when (and (prob? 10) (equal? (g 2) 'NONE))
    (g! 2 'INDEF)
    (g! 8 (random-cvc))
    (rec! (string-append "文法: 不定冠詞 [" (g 8) "] 発生")))
  (when (and (prob? 9) (not (g 11)))
    (g! 11 #t)
    (g! 10 (random-from '("ha" "het" "haf" "hat" "hab")))
    (rec! (string-append "文法: 動詞人称活用発生 / 過去補助: " (g 10))))
  (when (and (prob? 7) (equal? (g 7) ""))
    (g! 7 (random-from '("en" "em" "es" "er" "on")))
    (rec! (string-append "文法: 対格語尾 -" (g 7) " 発生")))
  (when (and (prob? 7) (equal? (g 3) 'GENITIV))
    (g! 3 'POSSADJ)
    (rec! "文法: 所有形容詞化"))
  (when (and (prob? 4) (not (g 13)) (equal? (g 0) 'SVO))
    (g! 13 #t)
    (rec! "文法: V2語順発生"))
  ;; 性別体系発生と同時に性別語尾を生成 → g[17]
  (when (and (prob? 3) (not (g 14)))
    (g! 14 #t)
    (g! 17 (list
      (random-from '("m" "s" "er" "en"))
      (random-from '("e" "i" "in" "erin"))
      (random-from '("n" "s" "a" "um"))))
    (rec! (string-append "文法: 名詞性別体系の発生"
      " (男:" (car (g 17)) "/女:" (cadr (g 17)) "/中:" (caddr (g 17)) ")")))
  (when (and (prob? 1) (g 14))
    (g! 2 'DEF)
    (rec! "文法: 冠詞への格融合"))
  ;; 極低確率1%: コピュラ文末導入 → g[18]
  (when (and (prob? 1) (equal? (g 18) ""))
    (g! 18 (random-cv))
    (rec! (string-append "文法: コピュラ文末導入 -" (g 18)))))

(define (apply-f-grammar!)
  (when (and (prob? 12) (equal? (g 7) ""))
    (g! 7 (random-from '("n" "ta" "a" "tä" "nä")))
    (rec! (string-append "文法: 対格語尾 -" (g 7) " 発生")))
  (when (and (prob? 10) (equal? (g 12) ""))
    (g! 12 (random-from '("a" "i" "e" "o")))
    (rec! (string-append "文法: 主格語尾 -" (g 12) " 発生")))
  (when (and (prob? 10) (equal? (g 3) 'GENITIV))
    (g! 3 'POSSSUF)
    (rec! "文法: 所有接尾辞化"))
  (when (and (prob? 12) (not (g 1)))
    (g! 1 #t)
    (rec! "文法: 主語省略の発生"))

  ;; 高確率10%: 格依存構文化（助詞→格語尾統合）→ g[19]
  (when (and (prob? 10) (not (g 19)) (not (equal? (g 7) "")))
    (g! 19 #t)
    (rec! "文法: 格依存構文化（助詞→格語尾統合）"))

  (when (and (prob? 10) (not (equal? (g 0) 'FREE)))
    (g! 0 'FREE)
    (rec! "文法: 語順の自由化"))
  (when (and (prob? 8) (equal? (g 4) 'REQUIRED))
    (g! 4 'OPTIONAL)
    (rec! "文法: コピュラの省略開始"))
  (when (and (prob? 3) (equal? (g 4) 'OPTIONAL))
    (g! 4 'NONE)
    (rec! "文法: コピュラの消失"))

  ;; 中確率6%: 単語融合 → g[20] レベルアップ
  (when (and (prob? 6) (< (g 20) 3))
    (g! 20 (+ (g 20) 1))
    (rec! (string-append "文法: 単語融合 レベル" (number->string (g 20)))))

  ;; 低確率3%: 追加格の発生（与格・処格など）
  (when (and (prob? 3) (g 19))
    (rec! "文法: 追加格（与格・属格など）の発生"))

  ;; 低確率3%: 所有接尾辞融合
  (when (and (prob? 3) (equal? (g 3) 'POSSSUF) (g 19))
    (rec! "文法: 所有接尾辞の格語尾への融合"))

  ;; 極低確率2%: 完全語融合（最大2語）
  (when (and (prob? 2) (>= (g 20) 2))
    (g! 20 3)
    (rec! "文法: 完全語融合（最大2語が一語に）")))

;; ================================================================
;; 文構築ヘルパー
;; ================================================================

(define (w idx) (phonemes->string (vector-ref *words* idx)))

(define (ws idx suf)
  (if (equal? suf "") (w idx) (string-append (w idx) suf)))

(define (art)
  (if (not (equal? (g 2) 'NONE)) (string-append (g 8) " ") ""))

(define (cop-str)
  (cond ((equal? (g 4) 'NONE)     "")
        ((equal? (g 4) 'OPTIONAL) (if (prob? 60) (string-append " " (w 10)) ""))
        (else                     (string-append " " (w 10)))))

;; Dモード用コピュラ補助（g[18] が設定されていれば文末に追加）
(define (d-extra-cop)
  (if (not (equal? (g 18) ""))
      (string-append " " (g 18))
      ""))

;; ================================================================
;; 文①: 私(0)は昨日(11)りんご(4)を食べた(7)
;;   SOV:  SUBJ ADV OBJ [PAST] VERB
;;   SVO:  SUBJ [PAST] VERB ADV OBJ
;;   g[15]=PREVERB → ADV を VERB 直前に移動
;;   g[16]=#t      → VERB を常に文末に
;; ================================================================
(define (build-s1)
  (let* ((subj (ws 0 (g 6)))
         (obj  (string-append (art) (ws 4 (g 7))))
         (adv  (w 11))
         (past (g 10))
         (verb (ws 7 (g 5)))
         (v+p  (if (not (equal? past ""))
                   (string-append past " " verb) verb)))
    (cond
      ;; g[16] 動詞終端固定: 語順に関わらず VERB を末尾に
      ((g 16)
       (if (equal? (g 15) 'PREVERB)
           (string-append subj " " obj " " adv " " v+p)
           (string-append subj " " adv " " obj " " v+p)))
      ((equal? (g 0) 'SOV)
       (if (equal? (g 15) 'PREVERB)
           ;; ADV を VERB 直前に: SUBJ OBJ ADV VERB
           (string-append subj " " obj " " adv " " v+p)
           ;; 通常 SOV: SUBJ ADV OBJ VERB
           (string-append subj " " adv " " obj " " v+p)))
      ((equal? (g 0) 'SVO)
       (if (g 13)
           ;; V2語順: ADV VERB SUBJ OBJ
           (string-append adv " " v+p " " subj " " obj)
           (string-append subj " " v+p " " adv " " obj)))
      (else
       (if (equal? (g 15) 'PREVERB)
           (string-append subj " " obj " " adv " " v+p)
           (string-append subj " " adv " " obj " " v+p))))))

;; ================================================================
;; 文②: 彼(3)はワイン(5)を飲む(8) [poss] 好き(9) copula
;;   SOV: SUBJ WINE DRINK POSS LIKE COP
;;   SVO: SUBJ LIKE WINE DRINK COP
;; ================================================================
(define (build-s2)
  (let* ((subj (ws 3 (g 6)))
         (wine (string-append (art) (ws 5 (g 7))))
         (xcop (d-extra-cop)))
    (cond
      ((equal? (g 0) 'SOV)
       (string-append subj " " wine " " (w 8) " " (w 9) (cop-str) xcop))
      ((equal? (g 0) 'SVO)
       (string-append subj " " (w 9) " " wine " " (w 8) (cop-str) xcop))
      (else
       (string-append subj " " wine " " (w 8) " " (w 9) (cop-str) xcop)))))

;; ================================================================
;; 文③: 君(2)は僕(1)の(g[9])友達(6) copula
;;   g[3]=GENITIV:  PRON2 [poss-ptcl] FRIEND
;;   g[3]=POSSADJ:  PRON2 FRIEND (possession adjective)
;;   g[3]=POSSSUF:  FRIEND + pron1 初頭/末尾 (suffix fusion)
;;   g[20]>=2: より深い融合
;; ================================================================
(define (build-s3)
  (let* ((subj  (ws 2 (g 6)))
         (pron1 (w 1))
         (friend (w 6))
         (xcop  (d-extra-cop))
         (poss
          (cond
            ((equal? (g 3) 'GENITIV)
             (string-append pron1 " " (g 9) " " friend))
            ((equal? (g 3) 'POSSADJ)
             (string-append pron1 " " friend))
            ;; POSSSUF: 融合レベルに応じて変化
            ((and (equal? (g 3) 'POSSSUF) (>= (g 20) 2) (> (string-length pron1) 1))
             ;; 融合レベル2以上: 所有者の両端を名詞に付加
             (string-append friend
               (string (string-ref pron1 0))
               (string (string-ref pron1 (- (string-length pron1) 1)))))
            ((equal? (g 3) 'POSSSUF)
             (if (> (string-length pron1) 0)
                 (string-append friend (string (string-ref pron1 0)))
                 friend))
            (else
             (if (> (string-length pron1) 0)
                 (string-append friend (string (string-ref pron1 0)))
                 friend)))))
    (string-append subj " " poss (cop-str) xcop)))

;; ================================================================
;; 初期化・実行
;; ================================================================

(define (start! w0 w1 w2 w3 w4 w5 w6 w7 w8 w9 w10 w11 mode-sym)
  (set! *mode* mode-sym)
  (set! *gen*  0)
  (set! *history* '())
  (init-grammar!)
  (set! *words* (make-vector 12))
  (let ((inps (list w0 w1 w2 w3 w4 w5 w6 w7 w8 w9 w10 w11)))
    (let loop ((i 0) (ins inps))
      (when (< i 12)
        (vector-set! *words* i (parse-phonemes (car ins)))
        (loop (+ i 1) (cdr ins)))))
  (let gen-loop ((g-i 1))
    (when (<= g-i 100)
      (set! *gen* g-i)
      (let loop ((i 0))
        (when (< i 12)
          (cond
            ((equal? *mode* 'J) (apply-j-phon! i))
            ((equal? *mode* 'D) (apply-d-phon! i))
            ((equal? *mode* 'F) (apply-f-phon! i)))
          (loop (+ i 1))))
      (cond
        ((equal? *mode* 'J) (apply-j-grammar!))
        ((equal? *mode* 'D) (apply-d-grammar!))
        ((equal? *mode* 'F) (apply-f-grammar!)))
      (gen-loop (+ g-i 1))))
  (get-state))

;; ================================================================
;; 状態取得
;; ================================================================

(define (get-state)
  (list
    ;; 最終単語形 (12語)
    (let loop ((i 0) (acc '()))
      (if (= i 12) (reverse acc)
          (loop (+ i 1) (cons (w i) acc))))
    ;; 3文例
    (list (build-s1) (build-s2) (build-s3))
    ;; 変化履歴 (古い順、最大80件)
    (let loop ((h (reverse *history*)) (acc '()) (n 0))
      (if (or (null? h) (>= n 80)) acc
          (loop (cdr h)
                (cons (list (number->string (car (car h))) (cadr (car h))) acc)
                (+ n 1))))
    ;; 文法サマリー (g[0..20])
    (list
      (cond ((equal? (g 0) 'SOV) "SOV")
            ((equal? (g 0) 'SVO) "SVO")
            (else "FREE"))
      (if (g 1) "あり" "なし")
      (if (equal? (g 2) 'NONE) "なし"
          (string-append (g 8) (if (equal? (g 2) 'DEF) " (定)" " (不定)")))
      (cond ((equal? (g 3) 'GENITIV) "属格 (の)")
            ((equal? (g 3) 'POSSADJ) "所有形容詞")
            (else "所有接尾辞"))
      (cond ((equal? (g 4) 'REQUIRED) "必須")
            ((equal? (g 4) 'OPTIONAL) "任意")
            (else "消失"))
      (if (equal? (g 5) "") "なし" (string-append "-" (g 5)))
      (if (equal? (g 6) "") "なし" (string-append "-" (g 6)))
      (if (equal? (g 7) "") "なし" (string-append "-" (g 7)))
      (if (equal? (g 10) "") "なし" (string-append (g 10) " (補助/語尾)"))
      (if (g 11) "あり" "なし")
      (if (g 13) "あり" "なし")
      (if (g 14) "あり" "なし")
      ;; g[15]: J副詞位置
      (cond ((equal? (g 15) 'PREVERB) "動詞直前固定")
            (else "自由"))
      ;; g[16]: J動詞終端固定
      (if (g 16) "固定" "なし")
      ;; g[17]: D性別語尾
      (if (null? (g 17)) "なし"
          (string-append "男:" (car (g 17)) "/女:" (cadr (g 17)) "/中:" (caddr (g 17))))
      ;; g[18]: Dコピュラ
      (if (equal? (g 18) "") "なし" (string-append "-" (g 18)))
      ;; g[19]: F格依存構文化
      (if (g 19) "あり" "なし")
      ;; g[20]: F融合レベル
      (number->string (g 20)))))
