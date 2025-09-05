
export default function Index() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Welcome to your dashboard!</p>
      </div>
      
      {/* Responsive grid for dashboard widgets */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 sm:p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Start your workflow here</p>
        </div>
        <div className="p-4 sm:p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">View your latest work</p>
        </div>
        <div className="p-4 sm:p-6 bg-card rounded-lg border border-border sm:col-span-2 lg:col-span-1">
          <h3 className="font-semibold mb-2">Statistics</h3>
          <p className="text-sm text-muted-foreground">Track your progress</p>
        </div>
      </div>
    </div>
  );
}
