import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "./ui/badge";

export const StatCard = (props) => {
  const { title, value, icon: Icon, actions, isDashboardStatError } = props;
  return (
    <Card className="card-soft glow-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isDashboardStatError ? (
          <Badge variant="red">Error</Badge>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {actions}
      </CardContent>
    </Card>
  );
};
