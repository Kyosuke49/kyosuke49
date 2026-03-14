(define (fizzbuzz n)
  (cond
    ((= (modulo n 15) 0) "FizzBuzz")
    ((= (modulo n 3)  0) "Fizz")
    ((= (modulo n 5)  0) "Buzz")
    (else (number->string n))))
