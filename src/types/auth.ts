
export type RegistrationStep = 'user' | 'organization' | 'invite';

export type OrganizationRole = 'admin' | 'member';
export type TeamRole = 'leader' | 'member';

export interface OrganizationSetup {
  name: string;
  description?: string;
}

export interface TeamInvite {
  emails: string[];
}

