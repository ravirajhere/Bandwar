export const CONTRIBUTOR_STORAGE_KEY = "bandwar_contributor";

export interface Contributor {
  id: string;
  username: string;      // e.g., @rameshkumar
  displayName: string;   // e.g., Ramesh Kumar
  email?: string;
  bio?: string;          // Profile page ke liye
  photo?: string;        // Profile page ke liye
  joinedAt: string;
  hasChangedUsername?: boolean; 
}

export function suggestUsername(displayName: string): string {
  const slug = displayName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const firstName = slug.split("-")[0] || "user";
  return `@${firstName}`;
}