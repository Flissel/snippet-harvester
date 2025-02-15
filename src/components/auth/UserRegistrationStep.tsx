
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserRegistration } from "@/types/auth";

interface UserRegistrationStepProps {
  data: UserRegistration;
  onChange: (data: UserRegistration) => void;
}

export function UserRegistrationStep({ data, onChange }: UserRegistrationStepProps) {
  const handleChange = (field: keyof UserRegistration) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({ ...data, [field]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={data.email}
          onChange={handleChange("email")}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={data.password}
          onChange={handleChange("password")}
          required
        />
      </div>
      {data.displayName !== undefined && (
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Enter your display name"
            value={data.displayName}
            onChange={handleChange("displayName")}
            required
          />
        </div>
      )}
    </div>
  );
}

