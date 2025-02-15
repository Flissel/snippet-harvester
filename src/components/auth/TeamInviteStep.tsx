
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TeamInvite } from "@/types/auth";

interface TeamInviteStepProps {
  data: TeamInvite;
  onChange: (data: TeamInvite) => void;
}

export function TeamInviteStep({ data, onChange }: TeamInviteStepProps) {
  const [currentEmail, setCurrentEmail] = useState("");

  const handleAddEmail = () => {
    if (currentEmail && !data.emails.includes(currentEmail)) {
      onChange({ emails: [...data.emails, currentEmail] });
      setCurrentEmail("");
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    onChange({ emails: data.emails.filter((email) => email !== emailToRemove) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="teamEmail">Invite Team Members (Optional)</Label>
          <Badge variant="secondary">Coming Soon</Badge>
        </div>
        <div className="flex gap-2">
          <Input
            id="teamEmail"
            type="email"
            placeholder="colleague@example.com"
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            disabled
          />
          <Button type="button" onClick={handleAddEmail} disabled>
            Add
          </Button>
        </div>
      </div>
      {data.emails.length > 0 && (
        <div className="space-y-2">
          <Label>Invited Members</Label>
          <div className="space-y-2">
            {data.emails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-2 bg-secondary rounded"
              >
                <span>{email}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEmail(email)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
