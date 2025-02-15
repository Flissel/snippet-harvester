
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-lg glass card-shadow animate-in"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="h-32 flex items-center justify-center bg-primary/5 rounded-md mb-4">
                  <span className="text-primary/60">Preview</span>
                </div>
                <h3 className="font-medium mb-2">Example Snippet {i + 1}</h3>
                <p className="text-sm text-muted-foreground">
                  A brief description of the code snippet and its functionality.
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
