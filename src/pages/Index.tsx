
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your dashboard!</p>
        </main>
      </div>
    </div>
  );
};

export default Index;
