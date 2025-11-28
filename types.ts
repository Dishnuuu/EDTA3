export interface Member {
  id: number;
  name: string;
  image: string; // URL or Base64
  age: number;
  dob: string;
  role: string;
  about: string;
  instagram: string;
  password?: string; // Simple mock password
}

export type ViewState = 'landing' | 'team' | 'profile';