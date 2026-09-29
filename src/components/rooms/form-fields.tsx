// localized-ui
import { T } from "@/components/i18n/language-provider";
import { Label } from "@/components/ui/label";
export const controlClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring";
export function Field({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        <T>{label}</T>
      </Label>
      {children}
      {error && (
        <p
          id={name + "-error"}
          role="alert"
          className="text-sm text-destructive"
        >
          <T>{error}</T>
        </p>
      )}
    </div>
  );
}
