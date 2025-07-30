import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { Sidebar } from "@/components/Layout/Sidebar";
import { DashboardStats } from "@/components/Dashboard/DashboardStats";
import { IncidentForm } from "@/components/Incidents/IncidentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Users, BarChart3 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Mock user data - in real app this would come from auth
  const user = {
    role: "admin" as const,
    name: "John Smith",
    email: "john.smith@company.com"
  };

  // Mock stats data - in real app this would come from Supabase
  const mockStats = {
    totalIncidents: 24,
    openIncidents: 8,
    resolvedIncidents: 16,
    criticalIncidents: 2,
    avgResolutionTime: 4.5,
    trends: {
      totalIncidents: 12,
      openIncidents: -8,
      resolvedIncidents: 25,
      criticalIncidents: -50
    }
  };

  const mockIncidentCounts = {
    total: 24,
    open: 8,
    critical: 2
  };

  const handleIncidentSubmit = async (data: any) => {
    console.log("Submitting incident:", data);
    // In real app: submit to Supabase
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
  };

  const handleGetAISuggestion = async (description: string) => {
    console.log("Getting AI suggestion for:", description);
    // In real app: call Gemini API via Supabase Edge Function
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <DashboardStats userRole={user.role} stats={mockStats} />
            
            {/* Quick Actions for Admin */}
            {user.role === "admin" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-card transition-shadow" onClick={() => setActiveTab("all-incidents")}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">Manage Incidents</h3>
                        <p className="text-sm text-muted-foreground">Review and assign incidents</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-card transition-shadow" onClick={() => setActiveTab("team-management")}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">Team Management</h3>
                        <p className="text-sm text-muted-foreground">Manage security team</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-card transition-shadow" onClick={() => setActiveTab("analytics")}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">Analytics</h3>
                        <p className="text-sm text-muted-foreground">View security metrics</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: "New phishing incident reported", time: "2 minutes ago", type: "incident" },
                    { action: "Malware incident resolved", time: "1 hour ago", type: "resolved" },
                    { action: "Critical data breach assigned to team", time: "3 hours ago", type: "critical" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === "critical" ? "bg-destructive" :
                          activity.type === "resolved" ? "bg-success" : "bg-warning"
                        }`} />
                        <span className="text-sm">{activity.action}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "report-incident":
        return (
          <IncidentForm 
            onSubmit={handleIncidentSubmit}
            onGetAISuggestion={handleGetAISuggestion}
          />
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <Shield className="h-16 w-16 text-primary mx-auto" />
              <h2 className="text-2xl font-semibold">Feature Coming Soon</h2>
              <p className="text-muted-foreground">
                This feature is currently under development and will be available soon.
              </p>
              <Button onClick={() => setActiveTab("dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole={user.role}
        userName={user.name}
        notificationCount={3}
        onMenuClick={() => setSidebarOpen(true)}
        onSignOut={() => console.log("Sign out")}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={user.role}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          incidentCounts={mockIncidentCounts}
        />
        
        <main className="flex-1 p-6 md:ml-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;