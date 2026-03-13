package site;

/**
 * HTMLレンダリングのユーティリティクラス。
 * 全ページ共通のレイアウト（ヘッダー・ナビ・フッター）を管理します。
 */
public class Html {

    /**
     * トップページ専用レイアウト（言語切替・サイドバーあり）。
     */
    public static String topPage(String content) {
        return """
                <!DOCTYPE html>
                <html lang="ja">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>偽造切手</title>
                  <link rel="stylesheet" href="style.css">
                </head>
                <body>
                  %s
                  %s
                </body>
                </html>
                """.formatted(topHeader(), content);
    }

    /**
     * サブページ用レイアウト（シンプルヘッダー）。
     * @param title   ページタイトル
     * @param content メインコンテンツHTML
     * @param root    ルートへの相対パス (例: "../")
     */
    public static String page(String title, String content, String root) {
        return """
                <!DOCTYPE html>
                <html lang="ja">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>%s — 偽造切手</title>
                  <link rel="stylesheet" href="%sstyle.css">
                </head>
                <body>
                  %s
                  <div class="container">
                    <main class="sub-main">
                      %s
                    </main>
                    %s
                  </div>
                </body>
                </html>
                """.formatted(title, root, subHeader(root), content, footer());
    }

    // =========================================================
    //  トップページ用ヘッダー（3言語タイトル + 言語切替）
    // =========================================================
    private static String topHeader() {
        return """
                <header class="site-header">
                  <div class="container">
                    <h1 class="site-title" data-lang="ja">偽造切手</h1>
                    <h1 class="site-title" data-lang="de">LOS 49</h1>
                    <h1 class="site-title" data-lang="fi">ERÄ 49</h1>
                    <div class="lang-switch">
                      <button onclick="setLang('ja')">日本語</button>
                      <button onclick="setLang('de')">Deutsch</button>
                      <button onclick="setLang('fi')">Suomi</button>
                    </div>
                  </div>
                </header>
                """;
    }

    // =========================================================
    //  サブページ用ヘッダー（固定ナビゲーション）
    // =========================================================
    private static String subHeader(String root) {
        return """
                <header class="site-header sub-header">
                  <div class="container sub-header-inner">
                    <a href="%sindex.html" class="site-logo font-kazesawa">偽造切手</a>
                    <nav>
                      <ul>
                        <li><a href="%sart/index.html">絵置き場</a></li>
                        <li><a href="%smusic/index.html">曲置き場</a></li>
                        <li><a href="%stext/index.html">字置き場</a></li>
                        <li><a href="%sdiary/index.html">独り言</a></li>
                      </ul>
                    </nav>
                  </div>
                </header>
                """.formatted(root, root, root, root, root);
    }

    private static String footer() {
        return """
                <footer class="site-footer">
                  <p class="font-geosans">© Kyosuke49 — 偽造切手 / LOS 49 / ERÄ 49</p>
                </footer>
                """;
    }
}
