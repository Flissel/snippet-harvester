
export type RegistrationStep = 'user' | 'organization' | 'invite';

export interface OrganizationSetup {
  name: string;
  description?: string;
}

export interface TeamInvite {
  emails: string[];
}
