package site.data;

import java.util.List;

/**
 * 日記（独り言）のエントリーデータを管理するクラス。
 * 新しい日記を追加したい場合は entries() メソッドに追記してください。
 */
public class DiaryData {

    public record Entry(String date, String title, String body) {}

    public static List<Entry> entries() {
        return List.of(
            new Entry("2026-01-06", "他言語・フォント追加",
                "ドイツ語版をクレント体にしてみました。すごく読みづらいですね。"),
            new Entry("2026-01-05", "更新",
                "それらしくなり始めたみたいやね"),
            new Entry("2025-12-31", "作った",
                "2025のうちに作っといた方がいいことあるかなって")
        );
    }
}
