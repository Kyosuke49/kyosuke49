;; solitaire.scm — LISP クロンダイク・ソリティア (Draw-1)
;; BiwaScheme (R5RS) で実装

;; ================================================================
;; カード表現
;; スーツ: 0=♠ 1=♥ 2=♦ 3=♣
;; ランク: 1=A 2..10 11=J 12=Q 13=K
;; カード整数 c: スーツ = c / 13, ランク = (c mod 13) + 1
;; ================================================================

(define (card-suit c) (quotient c 13))
(define (card-rank c) (+ (remainder c 13) 1))
(define (card-red? c)
  (let ((s (card-suit c)))
    (or (= s 1) (= s 2))))

;; ================================================================
;; グローバル状態
;; *tableaux*: vector of 7 lists — 先頭が一番上のカード
;;   各要素: (cons card-int face-up?)
;; *foundations*: vector of 4 ints — スーツ別のトップランク (0=空)
;; *stock*, *waste*: list of card-int — 先頭がトップ
;; *history*: list of state snapshots (for undo)
;; ================================================================

(define *stock*       '())
(define *waste*       '())
(define *foundations* #f)
(define *tableaux*    #f)
(define *moves*       0)
(define *won*         #f)
(define *history*     '())

;; ================================================================
;; ユーティリティ
;; ================================================================

(define (take-n lst n)
  (if (= n 0) '()
      (cons (car lst) (take-n (cdr lst) (- n 1)))))

(define (drop-n lst n)
  (if (= n 0) lst
      (drop-n (cdr lst) (- n 1))))

(define (vec->list v)
  (let loop ((i 0) (acc '()))
    (if (= i (vector-length v))
        (reverse acc)
        (loop (+ i 1) (cons (vector-ref v i) acc)))))

(define (copy-vector v)
  (let* ((len (vector-length v))
         (new (make-vector len)))
    (let loop ((i 0))
      (if (= i len) new
          (begin
            (vector-set! new i (vector-ref v i))
            (loop (+ i 1)))))))

;; ================================================================
;; アンドゥ
;; ================================================================

(define (save-state!)
  (set! *history*
    (cons (list *stock* *waste*
                (copy-vector *foundations*)
                (copy-vector *tableaux*)
                *moves*)
          *history*)))

(define (undo!)
  (when (not (null? *history*))
    (let ((snap (car *history*)))
      (set! *history*      (cdr *history*))
      (set! *stock*        (list-ref snap 0))
      (set! *waste*        (list-ref snap 1))
      (set! *foundations*  (list-ref snap 2))
      (set! *tableaux*     (list-ref snap 3))
      (set! *moves*        (list-ref snap 4))
      (set! *won*          #f)))
  (state))

;; ================================================================
;; Fisher-Yates シャッフル
;; ================================================================

(define (fisher-yates! v)
  (let loop ((i (- (vector-length v) 1)))
    (when (> i 0)
      (let* ((j   (js-random-int (+ i 1)))
             (tmp (vector-ref v i)))
        (vector-set! v i (vector-ref v j))
        (vector-set! v j tmp)
        (loop (- i 1))))))

;; ================================================================
;; バリデーション
;; ================================================================

;; タブロー列のトップカードペアを返す（空なら #f）
(define (tab-top col)
  (let ((pile (vector-ref *tableaux* col)))
    (if (null? pile) #f (car pile))))

;; カードをタブロー列のトップに置けるか
(define (can-to-tab? card col)
  (let ((top (tab-top col)))
    (if top
        (and (cdr top)                                     ; 表向き?
             (= (card-rank card) (- (card-rank (car top)) 1))
             (not (eq? (card-red? card) (card-red? (car top)))))
        (= (card-rank card) 13))))                         ; 空列はキングのみ

;; カードをファンデーションに置けるか
(define (can-to-found? card)
  (= (card-rank card)
     (+ (vector-ref *foundations* (card-suit card)) 1)))

;; ================================================================
;; 自動フリップ: 列トップが裏向きなら表に
;; ================================================================

(define (auto-flip! col)
  (let ((pile (vector-ref *tableaux* col)))
    (when (and (not (null? pile))
               (not (cdar pile)))
      (vector-set! *tableaux* col
        (cons (cons (caar pile) #t) (cdr pile))))))

;; ================================================================
;; 勝利確認
;; ================================================================

(define (check-win!)
  (when (and (= (vector-ref *foundations* 0) 13)
             (= (vector-ref *foundations* 1) 13)
             (= (vector-ref *foundations* 2) 13)
             (= (vector-ref *foundations* 3) 13))
    (set! *won* #t)))

;; ================================================================
;; 新ゲーム
;; ================================================================

(define (new-game!)
  (set! *moves* 0)
  (set! *won*   #f)
  (set! *history* '())
  (set! *foundations* (make-vector 4 0))
  (set! *tableaux*    (make-vector 7 '()))
  (set! *waste* '())
  (let ((deck (make-vector 52)))
    ;; デッキ作成
    (let fill ((i 0))
      (when (< i 52) (vector-set! deck i i) (fill (+ i 1))))
    ;; シャッフル
    (fisher-yates! deck)
    ;; タブローへ配牌 (列 col に col+1 枚)
    ;; 先頭 = トップ = 最後に配ったカード (表向き)
    (let deal ((col 0) (pos 0))
      (when (< col 7)
        (let place ((row 0) (pos pos) (acc '()))
          (if (= row (+ col 1))
              (begin
                (vector-set! *tableaux* col acc)
                (deal (+ col 1) pos))
              ;; cons: 後から配ったカードが先頭 (トップ) になる
              (place (+ row 1) (+ pos 1)
                     (cons (cons (vector-ref deck pos) (= row col))
                           acc))))))
    ;; 残り 24 枚をストックへ (インデックス 28-51)
    ;; インデックス 51 が先頭 (最初に引かれる)
    (set! *stock*
      (let build ((i 28) (acc '()))
        (if (= i 52) acc
            (build (+ i 1)
                   (cons (vector-ref deck i) acc))))))
  (state))

;; ================================================================
;; ストックからドロー
;; ================================================================

(define (draw!)
  (cond
    ;; ストックにカードがある → ウェイストへ
    ((not (null? *stock*))
     (save-state!)
     (set! *waste* (cons (car *stock*) *waste*))
     (set! *stock* (cdr *stock*)))
    ;; ストック空・ウェイストあり → ウェイストをリセット
    ((not (null? *waste*))
     (save-state!)
     (set! *stock* (reverse *waste*))
     (set! *waste* '())))
  (state))

;; ================================================================
;; 移動操作
;; ================================================================

;; ウェイストトップ → タブロー列 col
(define (move-waste-to-tab! col)
  (when (and (not (null? *waste*))
             (can-to-tab? (car *waste*) col))
    (save-state!)
    (vector-set! *tableaux* col
      (cons (cons (car *waste*) #t) (vector-ref *tableaux* col)))
    (set! *waste* (cdr *waste*))
    (set! *moves* (+ *moves* 1)))
  (state))

;; ウェイストトップ → ファンデーション
(define (move-waste-to-found!)
  (when (and (not (null? *waste*))
             (can-to-found? (car *waste*)))
    (save-state!)
    (vector-set! *foundations*
      (card-suit (car *waste*))
      (card-rank (car *waste*)))
    (set! *waste* (cdr *waste*))
    (set! *moves* (+ *moves* 1))
    (check-win!))
  (state))

;; タブロートップ → ファンデーション
(define (move-tab-to-found! col)
  (let ((pile (vector-ref *tableaux* col)))
    (when (and (not (null? pile))
               (cdar pile)                    ; 表向き?
               (can-to-found? (caar pile)))
      (save-state!)
      (vector-set! *foundations*
        (card-suit (caar pile))
        (card-rank (caar pile)))
      (vector-set! *tableaux* col (cdr pile))
      (auto-flip! col)
      (set! *moves* (+ *moves* 1))
      (check-win!)))
  (state))

;; タブロー from → タブロー to (上から n 枚移動)
(define (move-tab-to-tab! from to n)
  (let* ((from-pile (vector-ref *tableaux* from))
         (moved     (take-n from-pile n))
         (remaining (drop-n from-pile n)))
    ;; moved の最後の要素 (底のカード) が移動グループの土台
    (let ((bottom (car (drop-n moved (- n 1)))))
      (when (and (cdr bottom)                 ; 底も表向き?
                 (can-to-tab? (car bottom) to))
        (save-state!)
        (vector-set! *tableaux* from remaining)
        (vector-set! *tableaux* to
          (append moved (vector-ref *tableaux* to)))
        (auto-flip! from)
        (set! *moves* (+ *moves* 1)))))
  (state))

;; ================================================================
;; 状態シリアライズ
;; (list won? moves stock-count waste-top-or-#f
;;       foundations-list tableaux-list can-undo?)
;; foundations-list: (suit0-rank suit1-rank suit2-rank suit3-rank)
;; tableaux-list: 7 列 × ((card faceup?) ...) 下から上の順
;; ================================================================

(define (state)
  (list *won*
        *moves*
        (length *stock*)
        (if (null? *waste*) #f (car *waste*))
        (vec->list *foundations*)
        (map (lambda (col)
               (map (lambda (pair)
                      (list (car pair) (if (cdr pair) 1 0)))
                    (reverse col)))
             (vec->list *tableaux*))
        (if (null? *history*) #f #t)))
