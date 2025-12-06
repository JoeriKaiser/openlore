import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { FieldValues, UseFormReturn, Path } from "react-hook-form";
import { Save, Sparkles, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/PageHeader";
import { TwoColumnLayout } from "@/components/layout/TwoColumnLayout";

type FieldConfig<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
  rows?: number;
  required?: boolean;
};

type Props<T extends FieldValues> = {
  mode: "create" | "edit";
  title: string;
  icon: LucideIcon;
  basePath: string;
  form: UseFormReturn<T>;
  fields: FieldConfig<T>[];
  tips?: string[];
  onSubmit: (data: T) => void;
  onDelete?: () => void;
  isPending: boolean;
  isDeleting?: boolean;
  previewRender?: (values: T) => ReactNode;
  infoItems?: { label: string; value: string }[];
};

export function EntityForm<T extends FieldValues>({
  mode,
  title,
  icon,
  basePath,
  form,
  fields,
  tips,
  onSubmit,
  onDelete,
  isPending,
  isDeleting,
  previewRender,
  infoItems,
}: Props<T>) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isDirty }, watch } = form;
  const values = watch();
  const isCreate = mode === "create";

  const main = (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
        <CardTitle className="text-lg">{isCreate ? "Details" : "Edit Details"}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {fields.map((field) => (
          <div key={String(field.name)} className="space-y-2">
            <Label htmlFor={String(field.name)} className="text-sm font-medium">
              {field.label} {field.required && "*"}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                id={String(field.name)}
                placeholder={field.placeholder}
                rows={field.rows ?? 6}
                {...register(field.name)}
                className="resize-none"
              />
            ) : (
              <Input
                id={String(field.name)}
                placeholder={field.placeholder}
                {...register(field.name)}
              />
            )}
            {errors[field.name] && (
              <p className="text-xs text-destructive">{String(errors[field.name]?.message)}</p>
            )}
          </div>
        ))}

        <Separator />

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="submit"
            disabled={isPending || (mode === "edit" && !isDirty)}
            onClick={handleSubmit(onSubmit)}
            className="gap-1"
          >
            {isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {isCreate ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                {isCreate ? <Sparkles className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {isCreate ? "Create" : "Save Changes"}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          {onDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              disabled={isDeleting}
              className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const sidebar = (
    <>
      {tips && tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {tips.map((tip, i) => (
              <p key={i}>{tip}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {infoItems && infoItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {infoItems.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {previewRender && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>{previewRender(values)}</CardContent>
        </Card>
      )}
    </>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <PageHeader
        title={title}
        icon={icon}
        backTo={basePath}
        badge={{ label: isCreate ? "New" : "Editing", icon: isCreate ? Sparkles : Save }}
      />
      <TwoColumnLayout main={main} sidebar={sidebar} />
    </div>
  );
}
