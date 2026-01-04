import { Layout } from "@/components/layout";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const artworks = [
  { id: 1, title: "Character Sketch", date: "2025.12", src: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=800&auto=format&fit=crop" },
  { id: 2, title: "Landscape 01", date: "2025.11", src: "https://images.unsplash.com/photo-1627483297886-49a034d2dd74?q=80&w=800&auto=format&fit=crop" },
  { id: 3, title: "Abstract Blue", date: "2025.10", src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop" },
  { id: 4, title: "Doodle", date: "2025.09", src: "https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=800&auto=format&fit=crop" },
  { id: 5, title: "Night City", date: "2025.08", src: "https://images.unsplash.com/photo-1496692052106-d37cb66ab80c?q=80&w=800&auto=format&fit=crop" },
  { id: 6, title: "Plant Life", date: "2025.08", src: "https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?q=80&w=800&auto=format&fit=crop" },
];

export default function ArtPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Art</h2>
          <p className="text-muted-foreground">絵や落書きの置き場です。</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {artworks.map((art) => (
            <Dialog key={art.id}>
              <DialogTrigger asChild>
                <div className="group cursor-pointer space-y-2">
                  <div className="overflow-hidden rounded-md border bg-muted">
                    <AspectRatio ratio={1 / 1}>
                      <img
                        src={art.src}
                        alt={art.title}
                        className="h-full w-full object-cover transition-all group-hover:scale-105 group-hover:opacity-90"
                      />
                    </AspectRatio>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium leading-none">{art.title}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{art.date}</p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl border-none bg-transparent shadow-none p-0 text-white">
                <img
                  src={art.src}
                  alt={art.title}
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
                <div className="absolute -bottom-10 left-0 text-center w-full">
                  <p className="font-medium text-white/90">{art.title}</p>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </Layout>
  );
}
