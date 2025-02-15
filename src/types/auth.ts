
export type RegistrationStep = 'organization' | 'user' | 'invite';

export type OrganizationRole = 'admin' | 'member';
export type TeamRole = 'leader' | 'member';

export interface OrganizationSetup {
  name: string;
  description?: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  displayName: string;
}

export interface TeamInvite {
  emails: string[];
}

