package site;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * メインのサイト生成クラス。
 * このクラスを実行すると docs/ 以下に静的HTMLサイトが生成されます。
 * 生成されたファイルをGitHubにpushし、GitHub Pagesで公開してください。
 *
 * ビルド方法（java-site/ ディレクトリで実行）:
 *   mvn compile exec:java
 */
public class SiteGenerator {

    private static final String OUTPUT_DIR = "docs";

    public static void main(String[] args) throws Exception {
        new SiteGenerator().generate();
    }

    public void generate() throws Exception {
        Path docs = Path.of(OUTPUT_DIR);
        Files.createDirectories(docs);

        System.out.println("=== 偽造切手 サイト生成 ===");

        // スタイルシート
        write(docs.resolve("style.css"), Styles.getStylesheet());

        // 共有ナビゲーションJS
        write(docs.resolve("shared-nav.js"), SharedNav.getScript());

        // 日替わりデータ (JavaScript)
        Files.createDirectories(docs.resolve("js"));
        write(docs.resolve("js/daily.js"), DailyData.getJavaScript());

        // トップページ
        write(docs.resolve("index.html"), Pages.indexPage());

        // 絵置き場
        Files.createDirectories(docs.resolve("art"));
        write(docs.resolve("art/index.html"), Pages.artPage());

        // 曲置き場
        Files.createDirectories(docs.resolve("music"));
        write(docs.resolve("music/index.html"), Pages.musicPage());

        // 字置き場
        Files.createDirectories(docs.resolve("text"));
        write(docs.resolve("text/index.html"), Pages.textPage());
        write(docs.resolve("text/mamama.html"), Pages.mamamaPage());

        // 独り言
        Files.createDirectories(docs.resolve("diary"));
        write(docs.resolve("diary/index.html"), Pages.diaryPage());

        // 暇つぶし
        Files.createDirectories(docs.resolve("pastime"));
        write(docs.resolve("pastime/index.html"), Pages.pastimePage());

        System.out.println();
        System.out.println("完了！docs/ フォルダに生成されました。");
        System.out.println();
        System.out.println("注意: 以下のファイルは手動でコピーしてください:");
        System.out.println("  fonts/  → docs/fonts/");
        System.out.println("  art/*.jpg, art/*.png → docs/art/");
        System.out.println("  music/*.mp3, *.wav, *.MP4 → docs/music/");
        System.out.println("  pastime/minesweeper.html など → docs/pastime/");
        System.out.println("  pastime/*.scm, *.wasm, *.js → docs/pastime/");
        System.out.println("  diary/kyo.html, diary/tana.html → docs/diary/");
        System.out.println("  ここに意味深なフォルダがあるじゃろ？ → docs/");
    }

    private void write(Path path, String content) throws IOException {
        Files.writeString(path, content);
        System.out.println("  生成: " + path);
    }
}
