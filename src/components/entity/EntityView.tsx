import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Calendar, Clock, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";

type Props = {
  title: string;
  pageTitle: string;
  icon: LucideIcon;
  basePath: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  isLoading: boolean;
  error: Error | null;
  content: ReactNode;
  stats?: { label: string; value: string | number }[];
  actions?: ReactNode;
};

export function EntityView({
  title,
  pageTitle,
  icon: Icon,
  basePath,
  id,
  createdAt,
  updatedAt,
  isLoading,
  error,
  content,
  stats,
  actions,
}: Props) {
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-3">
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              This item doesn't exist or has been removed.
            </p>
            <Link to={basePath}>
              <Button>Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const main = (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Icon className="h-3 w-3" />#{id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">{content}</CardContent>
    </Card>
  );

  const sidebar = (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Updated:</span>
            <span>{new Date(updatedAt).toLocaleDateString()}</span>
          </div>
          {stats && stats.length > 0 && (
            <>
              <Separator />
              {stats.map((stat) => (
                <div key={stat.label} className="text-sm">
                  <span className="text-muted-foreground">{stat.label}:</span>
                  <span className="ml-2 font-medium">{stat.value}</span>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to={`${basePath}/${id}/edit`}>
            <Button variant="outline" className="w-full gap-1">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link to={basePath}>
            <Button variant="ghost" className="w-full">
              View All
            </Button>
          </Link>
          {actions}
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <PageHeader
        title={pageTitle}
        icon={Icon}
        backTo={basePath}
        actions={
          <Link to={`${basePath}/${id}/edit`}>
            <Button variant="outline" className="gap-1">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        }
      />
      <TwoColumnLayout main={main} sidebar={sidebar} />
    </div>
  );
}
