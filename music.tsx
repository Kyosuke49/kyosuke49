import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Track {
  id: string;
  title: string;
  duration: string;
  date: string;
  description: string;
}

const tracks: Track[] = [
  { id: "1", title: "Untitled_Demo_01.wav", duration: "02:34", date: "2025-12-25", description: "冬の夜に作ったスケッチ。" },
  { id: "2", title: "Coffee_Break.wav", duration: "01:45", date: "2025-11-10", description: "ローファイな感じを目指したやつ。" },
  { id: "3", title: "System_Start.wav", duration: "00:12", date: "2025-10-30", description: "起動音の習作。" },
];

export default function MusicPage() {
  const [playing, setPlaying] = useState<string | null>(null);

  const togglePlay = (id: string) => {
    if (playing === id) {
      setPlaying(null);
    } else {
      setPlaying(id);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Music</h2>
          <p className="text-muted-foreground">曲や音のスケッチ置き場です。</p>
        </div>

        <div className="space-y-4">
          {tracks.map((track) => (
            <Card key={track.id} className="overflow-hidden hover:bg-muted/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <Button
                  size="icon"
                  variant={playing === track.id ? "default" : "secondary"}
                  className="shrink-0 h-12 w-12 rounded-full"
                  onClick={() => togglePlay(track.id)}
                >
                  {playing === track.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">{track.title}</h3>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">{track.duration}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{track.description}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0 hidden sm:flex">
                  <span className="font-mono text-xs">{track.date}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              {playing === track.id && (
                <div className="h-1 bg-primary/10 w-full">
                  <div className="h-full bg-primary w-1/3 animate-pulse" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
