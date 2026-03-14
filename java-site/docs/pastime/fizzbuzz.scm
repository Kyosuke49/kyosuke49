; 変なFizzBuzz — 3種ルール
; 3の倍数 → Fizz
; 5の倍数 → Buzz
; 7の倍数 → Woof
; 複合すれば文字列を連結（例: 21 → FizzWoof）

(define (fizzbuzz n)
  (let* ((f (= (modulo n 3) 0))
         (b (= (modulo n 5) 0))
         (w (= (modulo n 7) 0))
         (s (string-append
              (if f "Fizz" "")
              (if b "Buzz" "")
              (if w "Woof" ""))))
    (if (string=? s "") (number->string n) s)))
