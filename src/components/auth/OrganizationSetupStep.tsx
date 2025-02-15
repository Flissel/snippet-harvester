
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OrganizationSetup } from "@/types/auth";

interface OrganizationSetupStepProps {
  data: OrganizationSetup;
  onChange: (data: OrganizationSetup) => void;
}

export function OrganizationSetupStep({ data, onChange }: OrganizationSetupStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="orgName">Organization Name</Label>
        <Input
          id="orgName"
          placeholder="My Organization"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="orgDescription">Description (Optional)</Label>
        <Textarea
          id="orgDescription"
          placeholder="Tell us about your organization..."
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
}
