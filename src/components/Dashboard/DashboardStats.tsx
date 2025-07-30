import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  className?: string;
}

const StatCard = ({ title, value, change, changeType = 'neutral', icon, className }: StatCardProps) => {
  const getTrendIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-3 w-3 text-destructive" />;
      case 'decrease':
        return <TrendingDown className="h-3 w-3 text-success" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-destructive';
      case 'decrease':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={`${className} hover:shadow-card transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {Math.abs(change)}% from last week
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  userRole: 'admin' | 'reporter';
  stats: {
    totalIncidents: number;
    openIncidents: number;
    resolvedIncidents: number;
    criticalIncidents: number;
    avgResolutionTime?: number;
    trends?: {
      totalIncidents: number;
      openIncidents: number;
      resolvedIncidents: number;
      criticalIncidents: number;
    };
  };
}

export const DashboardStats = ({ userRole, stats }: DashboardStatsProps) => {
  const adminStats = [
    {
      title: "Total Incidents",
      value: stats.totalIncidents,
      change: stats.trends?.totalIncidents,
      changeType: stats.trends?.totalIncidents > 0 ? 'increase' as const : 'decrease' as const,
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      title: "Open Incidents",
      value: stats.openIncidents,
      change: stats.trends?.openIncidents,
      changeType: stats.trends?.openIncidents > 0 ? 'increase' as const : 'decrease' as const,
      icon: <Clock className="h-4 w-4" />,
      className: stats.openIncidents > 0 ? "border-warning/20 bg-warning/5" : "",
    },
    {
      title: "Critical Priority",
      value: stats.criticalIncidents,
      change: stats.trends?.criticalIncidents,
      changeType: stats.trends?.criticalIncidents > 0 ? 'increase' as const : 'decrease' as const,
      icon: <AlertTriangle className="h-4 w-4" />,
      className: stats.criticalIncidents > 0 ? "border-destructive/20 bg-destructive/5" : "",
    },
    {
      title: "Resolved",
      value: stats.resolvedIncidents,
      change: stats.trends?.resolvedIncidents,
      changeType: stats.trends?.resolvedIncidents > 0 ? 'increase' as const : 'neutral' as const,
      icon: <CheckCircle className="h-4 w-4" />,
      className: "border-success/20 bg-success/5",
    }
  ];

  const reporterStats = [
    {
      title: "My Reports",
      value: stats.totalIncidents,
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      title: "Under Review",
      value: stats.openIncidents,
      icon: <Clock className="h-4 w-4" />,
      className: stats.openIncidents > 0 ? "border-warning/20 bg-warning/5" : "",
    },
    {
      title: "Resolved",
      value: stats.resolvedIncidents,
      icon: <CheckCircle className="h-4 w-4" />,
      className: "border-success/20 bg-success/5",
    }
  ];

  const displayStats = userRole === 'admin' ? adminStats : reporterStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {userRole === 'admin' ? 'Security Overview' : 'My Incident Reports'}
          </h2>
          <p className="text-muted-foreground">
            {userRole === 'admin' 
              ? 'Monitor and manage all security incidents across the organization'
              : 'Track the status of your submitted security incident reports'
            }
          </p>
        </div>
        {userRole === 'admin' && stats.avgResolutionTime && (
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {stats.avgResolutionTime}h
            </div>
            <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Alert for critical incidents */}
      {userRole === 'admin' && stats.criticalIncidents > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">
                {stats.criticalIncidents} Critical Incident{stats.criticalIncidents !== 1 ? 's' : ''} Require Immediate Attention
              </h3>
              <p className="text-sm text-muted-foreground">
                These incidents have been marked as critical priority and should be addressed immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};