package pxem;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;

/**
 * TeaVM エントリポイント
 *
 * ブラウザロード時に main() が実行され、window.pxemJavaRun / window.pxemJavaVersion
 * がグローバルに登録される。
 *
 * 呼び出し方（JavaScript 側）:
 *   window.pxemJavaRun(name, body, stdin)  → 結果文字列 or "ERROR:..." を返す
 */
public class PxemMain {

    @JSFunctor
    public interface RunFn extends JSObject {
        String call(String name, String body, String stdin);
    }

    @JSBody(params = {"fn"}, script = "window.pxemJavaRun = fn;")
    private static native void setRunFn(RunFn fn);

    public static void main(String[] args) {
        setRunFn((name, body, stdin) -> {
            try {
                PxemInterpreter interp = new PxemInterpreter(name, body, stdin);
                return interp.run();
            } catch (PxemException e) {
                return "ERROR:" + e.getMessage();
            } catch (Exception e) {
                return "ERROR:内部エラー: " + e.getMessage();
            }
        });
    }
}
