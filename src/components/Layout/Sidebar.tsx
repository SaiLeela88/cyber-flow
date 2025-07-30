import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  FileText,
  AlertTriangle,
  Users,
  BarChart3,
  Settings,
  Plus,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'reporter';
  activeTab: string;
  onTabChange: (tab: string) => void;
  incidentCounts?: {
    total: number;
    open: number;
    critical: number;
  };
}

export const Sidebar = ({ 
  isOpen, 
  onClose, 
  userRole, 
  activeTab, 
  onTabChange,
  incidentCounts = { total: 0, open: 0, critical: 0 }
}: SidebarProps) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['admin', 'reporter']
    },
    {
      id: 'report-incident',
      label: 'Report Incident',
      icon: Plus,
      roles: ['admin', 'reporter'],
      highlight: true
    },
    {
      id: 'my-reports',
      label: 'My Reports',
      icon: FileText,
      roles: ['reporter'],
      badge: userRole === 'reporter' ? incidentCounts.open : undefined
    },
    {
      id: 'all-incidents',
      label: 'All Incidents',
      icon: AlertTriangle,
      roles: ['admin'],
      badge: userRole === 'admin' ? incidentCounts.total : undefined
    },
    {
      id: 'team-management',
      label: 'Team Management',
      icon: Users,
      roles: ['admin']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      roles: ['admin']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['admin', 'reporter']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out z-50",
        "md:relative md:top-0 md:h-[calc(100vh-4rem)] md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
            <h2 className="font-semibold">Menu</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredMenuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-11",
                  item.highlight && activeTab !== item.id && "border border-primary/20 bg-primary/5",
                  activeTab === item.id && "shadow-cyber"
                )}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
              >
                <item.icon className="mr-3 h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge 
                    variant={item.id === 'all-incidents' ? "destructive" : "secondary"}
                    className="ml-2"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* Critical Incidents Alert (Admin only) */}
          {userRole === 'admin' && incidentCounts.critical > 0 && (
            <div className="p-4 border-t border-border">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    {incidentCounts.critical} Critical Incident{incidentCounts.critical !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requires immediate attention
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};