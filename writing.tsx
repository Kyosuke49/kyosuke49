import { Layout } from "@/components/layout";
import { Link } from "wouter";

const articles = [
  {
    id: "hello-world",
    title: "サイトを更新しました",
    date: "2026-01-04",
    preview: "Replitて便利ですね。...",
  },
  {
    id: "recent-thoughts",
    title: "にゅーいやー",
    date: "2025-01-01",
    preview: "あけおめ...",
  },
  {
    id: "memo-01",
    title: "サイト作った",
    date: "2025-12-31",
    preview: "2025年中に作っておいたら何かいいことあるかなって。...",
  },
];

export default function WritingPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Writing</h2>
          <p className="text-muted-foreground">雑記やテキストファイルの置き場です。</p>
        </div>

        <div className="grid gap-6">
          {articles.map((article) => (
            <article key={article.id} className="group relative flex flex-col items-start border-l-2 border-muted pl-6 hover:border-primary transition-colors">
              <span className="text-xs font-mono text-muted-foreground mb-2 block">
                {article.date}
              </span>
              <h3 className="text-lg font-semibold tracking-tight mb-2 group-hover:underline decoration-1 underline-offset-4">
                <Link href={`#`}>
                  {article.title}
                </Link>
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {article.preview}
              </p>
              <div className="mt-4">
                <Link href={`#`}>
                  <a className="text-xs font-medium uppercase tracking-wider text-primary hover:text-primary/70">
                    Read more →
                  </a>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
}
