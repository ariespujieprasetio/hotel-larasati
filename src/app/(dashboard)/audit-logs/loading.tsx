// localized-ui
import { T } from "@/components/i18n/language-provider";
export default function Loading() {
  return (
    <p role="status">
      <T>{"Loading audit logs..."}</T>
    </p>
  );
}
