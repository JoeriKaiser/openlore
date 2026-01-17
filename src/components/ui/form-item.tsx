import * as React from "react";
import { cn } from "@/lib/utils";

function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export { FormItem };
