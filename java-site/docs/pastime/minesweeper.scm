;; minesweeper.scm — LISPマインスイーパー
;; BiwaScheme (R5RS) で実装

;; ================================================================
;; セル型:  #(mine? revealed? flagged? adj-count)
;; ================================================================

(define (make-cell) (vector #f #f #f 0))

(define (cell-mine?     c) (vector-ref c 0))
(define (cell-revealed? c) (vector-ref c 1))
(define (cell-flagged?  c) (vector-ref c 2))
(define (cell-adj       c) (vector-ref c 3))

(define (cell-set-mine! c v) (vector-set! c 0 v))
(define (cell-reveal!   c)   (vector-set! c 1 #t))
(define (cell-flag!     c)   (vector-set! c 2 (not (vector-ref c 2))))
(define (cell-set-adj!  c n) (vector-set! c 3 n))

;; ================================================================
;; グローバル状態
;; ================================================================

(define *rows*      0)
(define *cols*      0)
(define *mines*     0)
(define *board*     #f)
(define *over*      #f)
(define *won*       #f)
(define *safe-left* 0)   ; まだ開かれていない安全マスの数

;; ================================================================
;; ユーティリティ
;; ================================================================

(define (board-ref r c)
  (vector-ref *board* (+ (* r *cols*) c)))

(define (in-bounds? r c)
  (and (>= r 0) (< r *rows*) (>= c 0) (< c *cols*)))

;; 8近傍座標のリストを返す
(define (neighbors r c)
  (let loop-dr ((dr -1) (result '()))
    (if (> dr 1)
        result
        (let loop-dc ((dc -1) (result result))
          (if (> dc 1)
              (loop-dr (+ dr 1) result)
              (let ((nr (+ r dr)) (nc (+ c dc)))
                (loop-dc (+ dc 1)
                         (if (and (or (not (= dr 0)) (not (= dc 0)))
                                  (in-bounds? nr nc))
                             (cons (cons nr nc) result)
                             result))))))))

;; 隣接地雷数をカウント（純粋再帰・set! 不使用）
(define (mine-neighbor-count r c)
  (let loop ((ns (neighbors r c)) (n 0))
    (if (null? ns)
        n
        (loop (cdr ns)
              (+ n (if (cell-mine? (board-ref (caar ns) (cdar ns)))
                       1 0))))))

;; ================================================================
;; 地雷をランダム配置（ゲーム開始時に実行）
;; ================================================================

(define (place-mines!)
  (let loop ((placed 0))
    (when (< placed *mines*)
      (let* ((k (js-random-int (* *rows* *cols*)))
             (r (quotient  k *cols*))
             (c (remainder k *cols*)))
        (if (cell-mine? (board-ref r c))
            (loop placed)
            (begin
              (cell-set-mine! (board-ref r c) #t)
              (loop (+ placed 1))))))))

;; 全セルの隣接地雷数を計算
(define (calc-all-adj!)
  (let loop-r ((r 0))
    (when (< r *rows*)
      (let loop-c ((c 0))
        (when (< c *cols*)
          (unless (cell-mine? (board-ref r c))
            (cell-set-adj! (board-ref r c)
                           (mine-neighbor-count r c)))
          (loop-c (+ c 1))))
      (loop-r (+ r 1)))))

;; ================================================================
;; 初期化
;; ================================================================

(define (start! rows cols mines)
  (set! *rows*  rows)
  (set! *cols*  cols)
  (set! *mines* mines)
  (set! *over*  #f)
  (set! *won*   #f)
  (set! *safe-left* (- (* rows cols) mines))
  ;; ボードをリセット
  (set! *board* (make-vector (* rows cols)))
  (let init ((i 0))
    (when (< i (* rows cols))
      (vector-set! *board* i (make-cell))
      (init (+ i 1))))
  ;; 地雷配置と隣接数計算
  (place-mines!)
  (calc-all-adj!)
  (state))

;; ================================================================
;; フラッドフィル（反復BFS — スタックオーバーフローを防ぐ）
;; ================================================================

(define (flood! r0 c0)
  (let loop ((queue (list (cons r0 c0))))
    (unless (null? queue)
      (let* ((pos  (car queue))
             (r    (car pos))
             (c    (cdr pos))
             (rest (cdr queue)))
        (cond
          ((not (in-bounds? r c))
           (loop rest))
          ((let ((cell (board-ref r c)))
             (or (cell-revealed? cell)
                 (cell-flagged?  cell)
                 (cell-mine?     cell)))
           (loop rest))
          (else
           (let ((cell (board-ref r c)))
             (cell-reveal! cell)
             (set! *safe-left* (- *safe-left* 1))
             (loop (if (= (cell-adj cell) 0)
                       (append (neighbors r c) rest)
                       rest)))))))))

;; ================================================================
;; セルを開く
;; ================================================================

(define (reveal! r c)
  (unless (or *over* (not (in-bounds? r c)))
    (let ((cell (board-ref r c)))
      (unless (or (cell-revealed? cell) (cell-flagged? cell))
        (if (cell-mine? cell)
            (begin
              (cell-reveal! cell)
              (set! *over* #t))
            (begin
              (flood! r c)
              (when (= *safe-left* 0)
                (set! *won* #t)
                (set! *over* #t)))))))
  (state))

;; ================================================================
;; フラグを立てる／外す
;; ================================================================

(define (flag! r c)
  (unless (or *over* (not (in-bounds? r c)))
    (let ((cell (board-ref r c)))
      (unless (cell-revealed? cell)
        (cell-flag! cell))))
  (state))

;; ================================================================
;; ゲーム状態をリストで返す
;; (list over? won? rows)
;; rows  → list of rows
;; row   → list of (list revealed? mine? flagged? adj)
;; ================================================================

(define (state)
  (let build-rows ((r 0) (acc '()))
    (if (= r *rows*)
        (list *over* *won* acc)
        (let build-row ((c 0) (row '()))
          (if (= c *cols*)
              (build-rows (+ r 1) (append acc (list row)))
              (let ((cell (board-ref r c)))
                (build-row (+ c 1)
                           (append row
                                   (list (list (cell-revealed? cell)
                                               (cell-mine?     cell)
                                               (cell-flagged?  cell)
                                               (cell-adj       cell)))))))))))
