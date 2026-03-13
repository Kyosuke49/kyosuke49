package site;

import site.data.DailyData;
import site.data.DiaryData;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * メインのサイト生成クラス。
 * このクラスを実行すると docs/ 以下に静的HTMLサイトが生成されます。
 * 生成されたファイルをGitHubにpushし、GitHub Pagesで公開してください。
 *
 * ビルド方法:
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

        // 日替わりデータ (JavaScript)
        Files.createDirectories(docs.resolve("js"));
        write(docs.resolve("js/daily.js"), DailyData.getJavaScript());

        // 各ページ
        write(docs.resolve("index.html"), Pages.indexPage());

        Files.createDirectories(docs.resolve("art"));
        write(docs.resolve("art/index.html"), Pages.artPage());

        Files.createDirectories(docs.resolve("music"));
        write(docs.resolve("music/index.html"), Pages.musicPage());

        Files.createDirectories(docs.resolve("text"));
        write(docs.resolve("text/index.html"), Pages.textPage());
        write(docs.resolve("text/mamama.html"), Pages.mamamaPage());

        Files.createDirectories(docs.resolve("diary"));
        write(docs.resolve("diary/index.html"), Pages.diaryPage());

        System.out.println();
        System.out.println("完了！docs/ フォルダに生成されました。");
        System.out.println();
        System.out.println("注意: 以下のファイルは手動でコピーしてください:");
        System.out.println("  fonts/  → docs/fonts/");
        System.out.println("  art/*.jpg, art/*.png → docs/art/");
        System.out.println("  music/*.mp3, music/*.wav → docs/music/");
    }

    private void write(Path path, String content) throws IOException {
        Files.writeString(path, content);
        System.out.println("  生成: " + path);
    }
}
