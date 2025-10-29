import { useState, useMemo, useEffect } from "react";
import { Menu, Pen, X } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Chapter {
  id: string;
  title: string;
  level: number;
}

interface NestedChapter {
  id: string;
  title: string;
  level: number;
  subChapters: Chapter[];
}

// --- MODIFICATION HERE ---
interface BookSidebarProps {
  chapters: Chapter[];
  activeChapter: string;
  onChapterClick: (id: string) => void; // <-- 1. ADD THE PROP TO THE INTERFACE
}
// --- END MODIFICATION ---

// --- MODIFICATION HERE (SubChapterLink) ---
const SubChapterLink = ({
  chapter,
  activeChapter,
  onCloseMobile,
  onChapterClick, // <-- 2. ACCEPT THE PROP
}: {
  chapter: Chapter;
  activeChapter: string;
  onCloseMobile: () => void;
  onChapterClick: (id: string) => void; // <-- 2. ACCEPT THE PROP
}) => (
  <a
    key={chapter.id}
    href={`#${chapter.id}`}
    className={cn(
      "w-full text-left px-4 py-2 rounded-lg transition-all duration-200 block",
      "hover:bg-sidebar-accent hover:translate-x-1",
      activeChapter === chapter.id
        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        : "text-sidebar-foreground/70",
      "ml-4",
      chapter.level === 2 ? "text-sm font-medium" : "text-xs",
    )}
    onClick={(e) => {
      e.preventDefault();
      document.getElementById(chapter.id)?.scrollIntoView({ behavior: "smooth" });
      onCloseMobile();
      onChapterClick(chapter.id); // <-- 3. USE THE PROP ON CLICK
    }}
  >
    {chapter.title}
  </a>
);
// --- END MODIFICATION ---

export const BookSidebar = ({ 
  chapters, 
  activeChapter, 
  onChapterClick // <-- 4. DESTRUCTURE THE PROP
}: BookSidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openChapter, setOpenChapter] = useState<string>("");

  const nestedChapters = useMemo(() => {
    const nested: NestedChapter[] = [];
    let currentChapter: NestedChapter | null = null;

    for (const chapter of chapters) {
      if (chapter.level === 1) {
        continue;
      }

      if (chapter.level === 2 && chapter.title.startsWith("Chapter")) {
        if (chapter.title.includes(": Key Takeaways")) {
             if (currentChapter) {
                currentChapter.subChapters.push(chapter);
             }
        } else {
            currentChapter = { ...chapter, subChapters: [] };
            nested.push(currentChapter);
        }
      } else if (currentChapter && (chapter.level === 3 || chapter.level === 2)) {
        currentChapter.subChapters.push(chapter);
      }
    }
    return nested;
  }, [chapters]);

  const activeParentChapter = useMemo(() => {
    if (!activeChapter) return "";
    for (const parent of nestedChapters) {
      if (parent.id === activeChapter) return parent.id;
      if (parent.subChapters.some((sub) => sub.id === activeChapter)) {
        return parent.id;
      }
    }
    return "";
  }, [activeChapter, nestedChapters]);

  useEffect(() => {
    if (activeParentChapter) {
      setOpenChapter(activeParentChapter);
    }
  }, [activeParentChapter]);


  const SidebarContent = () => (
    <div className="flex flex-col h-screen bg-background border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        {/* ... (no changes in this header part) ... */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-bold text-sidebar-foreground">
                The Accidental CTO
              </h2>
              <p className="text-xs text-sidebar-foreground/60">
                By Subhash Choudhary
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <a
              href="https"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-sidebar-accent rounded transition-colors"
              title="Edit on GitHub"
            >
              <Pen className="w-4 h-4" />
            </a>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden hover:bg-sidebar-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Accordion
          type="single"
          collapsible
          className="w-full p-4 space-y-1"
          value={openChapter} 
          onValueChange={setOpenChapter}
        >
          {nestedChapters.map((chapter) => (
            <AccordionItem value={chapter.id} key={chapter.id} className="border-b-0">
              {/* --- MODIFICATION HERE (AccordionTrigger) --- */}
              <AccordionTrigger
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent hover:no-underline",
                  openChapter === chapter.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground/80",
                )}
                onClick={() => {
                  document.getElementById(chapter.id)?.scrollIntoView({ behavior: "smooth" });
                  setMobileOpen(false); 
                  onChapterClick(chapter.id); // <-- 5. USE THE PROP ON CLICK
                }}
              >
                <span className="text-sm leading-relaxed font-semibold text-base flex-1 text-left">
                  {chapter.title}
                </span>
              </AccordionTrigger>
              {/* --- END MODIFICATION --- */}
              
              <AccordionContent className="pt-1 pb-2 space-y-1">
                {chapter.subChapters.map((subChapter) => (
                  <SubChapterLink
                    key={subChapter.id}
                    chapter={subChapter}
                    activeChapter={activeChapter}
                    onCloseMobile={() => setMobileOpen(false)}
                    onChapterClick={onChapterClick} // <-- 6. PASS PROP DOWN
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* ... (no changes in this mobile wrapper part) ... */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-lg hover:shadow-accent"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed top-0 left-0 h-full z-50 lg:hidden transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "w-80",
        )}
      >
        <SidebarContent />
      </div>

      <div
        className={cn(
          "hidden lg:block sticky top-0 h-screen w-80 transition-all duration-300",
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
};