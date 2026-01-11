import type { ReactNode } from "react";

type Props = {
  main: ReactNode;
  sidebar: ReactNode;
  sidebarPosition?: "left" | "right";
};

export function TwoColumnLayout({
  main,
  sidebar,
  sidebarPosition = "right",
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      {sidebarPosition === "left" && <div className="space-y-6">{sidebar}</div>}
      <div className="md:col-span-3 space-y-6">{main}</div>
      {sidebarPosition === "right" && (
        <div className="space-y-6">{sidebar}</div>
      )}
    </div>
  );
}
