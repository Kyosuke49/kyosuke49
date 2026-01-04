import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Music, Image, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const sections = [
    {
      title: "曲置き場 (Music)",
      description: "作った曲とかWAVファイルを置いています。",
      href: "/music",
      icon: Music,
      color: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40",
    },
    {
      title: "絵置き場 (Art)",
      description: "描いた絵や落書きを置いています。",
      href: "/art",
      icon: Image,
      color: "bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/20 dark:hover:bg-pink-950/40",
    },
    {
      title: "文字置き場 (Writing)",
      description: "日記やテキストファイルを置いています。",
      href: "/writing",
      icon: FileText,
      color: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40",
    },
  ];

  return (
    <Layout>
      <div className="space-y-12">
        <section className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-medium mb-4">Welcome</h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p>
                ここは競介の個人サイトです。<br />
                まだ特に何もする予定はないですが、創作物の置き場として整備してみました。
              </p>
              <p>
                ゆっくりしていってください。
              </p>
            </div>
          </motion.div>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Directory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <Link href={section.href}>
                    <a className="block h-full group">
                      <Card className={`h-full transition-all duration-300 border-none shadow-none hover:shadow-sm ${section.color}`}>
                        <CardHeader>
                          <Icon className="w-8 h-8 mb-2 text-foreground/80 group-hover:scale-110 transition-transform" />
                          <CardTitle className="flex items-center justify-between">
                            {section.title}
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-foreground/70">
                            {section.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </a>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="pt-8 border-t border-dashed">
          <h2 className="text-sm font-mono text-muted-foreground mb-4">Updates</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-4">
              <span className="text-muted-foreground font-mono">2026.01.04</span>
              <span>サイト構造をリニューアルしました。</span>
            </li>
            <li className="flex gap-4">
              <span className="text-muted-foreground font-mono">2025.12.20</span>
              <span>サイトを開設しました。</span>
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}
