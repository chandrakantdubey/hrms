import { Label } from "@/components/ui/label";

export const InfoField = ({ label, value, className }) => (
  <div className={className}>
    <Label className="text-sm text-muted-foreground">{label}</Label>
    <p className="font-medium">{value || "N/A"}</p>
  </div>
);
