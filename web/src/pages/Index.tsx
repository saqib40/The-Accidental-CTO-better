import { useState, useEffect, useMemo } from "react";
import { BookSidebar, Chapter } from "@/components/BookSidebar"; // Make sure to export 'Chapter' from BookSidebar
import { BookContent } from "@/components/BookContent";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- MODIFICATION: Import the markdown file as a raw string ---
import bookMarkdown from "@/assets/test.md?raw";
// --- END MODIFICATION ---

// Helper function to create URL-friendly IDs
const createId = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

const Index = () => {
  // --- MODIFICATION: Remove useMarkdownContent, use useMemo ---
  const { content, chapters } = useMemo(() => {
    const lines = bookMarkdown.split("\n");
    const chapters: Chapter[] = [];

    lines.forEach((line) => {
      let match;
      if ((match = line.match(/^# (.*)/))) {
        // H1
        chapters.push({
          id: createId(match[1]),
          title: match[1],
          level: 1,
        });
      } else if ((match = line.match(/^## (.*)/))) {
        // H2
        chapters.push({
          id: createId(match[1]),
          title: match[1],
          level: 2,
        });
      } else if ((match = line.match(/^### (.*)/))) {
        // H3
        chapters.push({
          id: createId(match[1]),
          title: match[1],
          level: 3,
        });
      }
    });

    return { content: bookMarkdown, chapters };
  }, []); // Empty dependency array, runs only once
  // --- END MODIFICATION ---

  const [activeChapter, setActiveChapter] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const headings = document.querySelectorAll(
      ".prose h1, .prose h2, .prose h3",
    );
    
    // Manually assign IDs to headings because markdown-to-jsx doesn't
    // do it in a way that matches our generated chapter IDs.
    headings.forEach((heading, index) => {
      if (chapters[index]) {
        heading.id = chapters[index].id;
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Find the corresponding chapter by the ID we just assigned
            const chapter = chapters.find(c => c.id === entry.target.id);
            if (chapter) {
              setActiveChapter(chapter.id);
            }
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [content, chapters]); // 'content' is now just the static string

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- MODIFICATION: Removed loading and error states ---
  return (
    <div className="flex max-h-screen overflow-y-scroll px-4  overflow-x-hidden max-w-[100vw]">
      <BookSidebar 
        chapters={chapters} 
        activeChapter={activeChapter} 
        onChapterClick={setActiveChapter}
      />
      <main className="top-20">
        <BookContent content={content} />
      </main>

      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 rounded-full shadow-elegant z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
  // --- END MODIFICATION ---
};

export default Index;
