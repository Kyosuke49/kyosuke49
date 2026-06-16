package pxem;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Pxem Interpreter — Java port of pxem.js
 *
 * Reference: https://ja.wikipedia.org/wiki/Pxem
 *
 * 実行モデル：
 *  - ファイル名（拡張子込み）がメインルーチンのコード
 *  - ファイルの中身がサブルーチン（.e コマンドで呼び出す）
 *  - コマンド（.X）の直前にある非コマンド文字列は逆順でスタックにプッシュ
 *  - レジスタ：整数型スタック + 一時レジスタ（値1つ or null）
 */
public class PxemInterpreter {

    private static final int MAX_STEPS  = 1_000_000;
    private static final int MAX_OUTPUT = 100_000;

    private static final Set<Character> LOOP_STARTS = new HashSet<>(
            Arrays.asList('w', 'W', 'x', 'X', 'y', 'Y', 'z', 'Z'));
    private static final Set<Character> LOOP_ENDS = new HashSet<>(
            Arrays.asList('a', 'A'));

    private final String        name;
    private final String        body;
    private final int[]         stdinArr;
    private       int           stdinPos;
    private       ArrayDeque<Integer> stack;
    private       Integer       temp;
    private final StringBuilder output;
    private       int           steps;

    public PxemInterpreter(String name, String body, String stdin) {
        this.name     = name  != null ? name  : "";
        this.body     = body  != null ? body  : "";
        this.stdinArr = toCodePoints(stdin != null ? stdin : "");
        this.stdinPos = 0;
        this.stack    = new ArrayDeque<>();
        this.temp     = null;
        this.output   = new StringBuilder();
        this.steps    = 0;
    }

    public String run() {
        execute(this.name, false);
        return output.toString();
    }

    // ── Token ─────────────────────────────────────────────────────────────────

    private static final class Token {
        final String    text;
        final Character cmd;   // null = 末尾テキスト（コマンドなし）
        Token(String text, Character cmd) {
            this.text = text;
            this.cmd  = cmd;
        }
    }

    // ── トークナイザ ───────────────────────────────────────────────────────────

    private List<Token> tokenize(String code) {
        List<Token> tokens = new ArrayList<>();
        int start = 0;
        for (int i = 0; i < code.length(); i++) {
            if (code.charAt(i) == '.' && i + 1 < code.length()) {
                tokens.add(new Token(code.substring(start, i), code.charAt(i + 1)));
                start = i + 2;
                i++;
            }
        }
        String tail = code.substring(start);
        if (!tail.isEmpty()) tokens.add(new Token(tail, null));
        return tokens;
    }

    // ── ループ括弧の事前計算 ───────────────────────────────────────────────────

    private static final class Brackets {
        final Map<Integer, Integer> fwd = new HashMap<>();   // ループ開始 → .a の次
        final Map<Integer, Integer> bwd = new HashMap<>();   // .a → ループ開始
    }

    private Brackets computeBrackets(List<Token> tokens) {
        Brackets     b         = new Brackets();
        ArrayDeque<Integer> openStack = new ArrayDeque<>();
        for (int i = 0; i < tokens.size(); i++) {
            Character cmd = tokens.get(i).cmd;
            if (cmd == null) continue;
            if (LOOP_STARTS.contains(cmd)) {
                openStack.push(i);
            } else if (LOOP_ENDS.contains(cmd)) {
                if (!openStack.isEmpty()) {
                    int s = openStack.pop();
                    b.fwd.put(s, i + 1);
                    b.bwd.put(i, s);
                }
            }
        }
        return b;
    }

    // ── 実行 ──────────────────────────────────────────────────────────────────

    private void execute(String code, boolean isBody) {
        List<Token> tokens   = tokenize(code);
        Brackets    brackets = computeBrackets(tokens);
        int ti = 0;

        while (ti < tokens.size()) {
            steps++;
            if (steps > MAX_STEPS)
                throw new PxemException(
                        "ステップ数上限 (" + MAX_STEPS + ") を超えました（無限ループの可能性）");
            if (output.length() > MAX_OUTPUT)
                throw new PxemException(
                        "出力文字数上限 (" + MAX_OUTPUT + ") を超えました");

            Token token = tokens.get(ti);
            pushText(token.text);

            if (token.cmd == null) break;

            int next = execCmd(token.cmd, brackets, ti, isBody);
            if (next == -1) break;
            ti = next;
        }
    }

    // 次のトークンインデックスを返す。-1 は終了を意味する。
    private int execCmd(char cmd, Brackets brackets, int ti, boolean isBody) {
        switch (Character.toLowerCase(cmd)) {

            // ── 出力 ──────────────────────────────────────────────────────────
            case 'p': {
                while (!stack.isEmpty())
                    output.appendCodePoint(pop());
                return ti + 1;
            }
            case 'n': {
                output.append(pop());
                return ti + 1;
            }

            // ── スタック操作 ──────────────────────────────────────────────────
            case 'c': {
                stack.push(peek());
                return ti + 1;
            }
            case 'm': {
                temp = pop();
                return ti + 1;
            }
            case 't': {
                if (temp != null) stack.push(temp);
                return ti + 1;
            }
            case 's': {
                int b = pop(), a = pop();
                stack.push(b);
                stack.push(a);
                return ti + 1;
            }

            // ── 算術演算 ──────────────────────────────────────────────────────
            case '+': {
                int b = pop(), a = pop();
                stack.push(a + b);
                return ti + 1;
            }
            case '-': {
                int b = pop(), a = pop();
                stack.push(Math.abs(a - b));
                return ti + 1;
            }
            case '!': {
                int b = pop(), a = pop();
                stack.push(a * b);
                return ti + 1;
            }
            case '$': {
                int b = pop(), a = pop();
                int big = Math.max(a, b), small = Math.min(a, b);
                if (small == 0) throw new PxemException("ゼロ除算エラー (.$)");
                stack.push(big / small);
                return ti + 1;
            }
            case '%': {
                int b = pop(), a = pop();
                int big = Math.max(a, b), small = Math.min(a, b);
                if (small == 0) throw new PxemException("ゼロ除算エラー (.%)");
                stack.push(big % small);
                return ti + 1;
            }
            case 'r': {
                int a = pop();
                stack.push(a <= 0 ? 0 : (int) (Math.random() * a));
                return ti + 1;
            }

            // ── 入力 ──────────────────────────────────────────────────────────
            case 'i': {
                int cp = (stdinPos < stdinArr.length) ? stdinArr[stdinPos++] : 0;
                stack.push(cp);
                return ti + 1;
            }

            // ── サブルーチン ──────────────────────────────────────────────────
            case 'e': {
                if (!isBody && !body.isEmpty()) {
                    // 現在のスタック・temp を退避
                    ArrayDeque<Integer> savedStack = new ArrayDeque<>(stack);
                    Integer             savedTemp  = temp;
                    temp = null;
                    // body を this.stack（現在の内容のまま）で実行
                    execute(body, true);
                    // 実行後の stack がサブルーチン結果
                    ArrayDeque<Integer> subStack = stack;
                    stack = savedStack;
                    temp  = savedTemp;
                    // サブルーチン結果をスタックの底から順にプッシュ
                    // ArrayDeque.toArray() は head(top) から tail(bottom) の順
                    // → 逆順（bottom → top）でプッシュすることで正しい積み重なりになる
                    Integer[] subArr = subStack.toArray(new Integer[0]);
                    for (int i = subArr.length - 1; i >= 0; i--) {
                        stack.push(subArr[i]);
                    }
                }
                return ti + 1;
            }

            // ── 制御 ──────────────────────────────────────────────────────────
            case 'd': {
                return -1;
            }

            case 'w': {
                if (stack.isEmpty()) return ti + 1;
                int a = pop();
                if (a != 0) return ti + 1;
                Integer dest = brackets.fwd.get(ti);
                return dest != null ? dest : ti + 1;
            }
            case 'x': {
                if (stack.size() < 2) return ti + 1;
                int x = pop(), y = pop();
                if (x < y) return ti + 1;
                Integer dest = brackets.fwd.get(ti);
                return dest != null ? dest : ti + 1;
            }
            case 'y': {
                if (stack.size() < 2) return ti + 1;
                int x = pop(), y = pop();
                if (x > y) return ti + 1;
                Integer dest = brackets.fwd.get(ti);
                return dest != null ? dest : ti + 1;
            }
            case 'z': {
                if (stack.size() < 2) return ti + 1;
                int x = pop(), y = pop();
                if (x != y) return ti + 1;
                Integer dest = brackets.fwd.get(ti);
                return dest != null ? dest : ti + 1;
            }
            case 'a': {
                Integer dest = brackets.bwd.get(ti);
                return dest != null ? dest : ti + 1;
            }

            default:
                return ti + 1;
        }
    }

    // ── ヘルパー ──────────────────────────────────────────────────────────────

    /** テキストを逆順でスタックにプッシュ（サロゲートペア対応） */
    private void pushText(String text) {
        if (text == null || text.isEmpty()) return;
        int[] cps = text.codePoints().toArray();
        for (int i = cps.length - 1; i >= 0; i--) {
            stack.push(cps[i]);
        }
    }

    private int pop() {
        if (stack.isEmpty()) throw new PxemException("スタックアンダーフロー");
        return stack.pop();
    }

    private int peek() {
        if (stack.isEmpty()) throw new PxemException("スタックアンダーフロー (peek)");
        return stack.peek();
    }

    private static int[] toCodePoints(String s) {
        return s.codePoints().toArray();
    }
}
