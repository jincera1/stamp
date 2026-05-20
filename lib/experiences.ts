/** Row shape from public.experiences */
export type Experience = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  place: string | null;
  tags: string[] | null;
  occurred_at: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  created_at?: string;
  updated_at?: string;
};

export function formatExperienceDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function profileDisplayName(
  profile: Pick<Profile, "display_name" | "email"> | null | undefined
): string {
  if (!profile) return "STAMP user";
  const name = profile.display_name?.trim();
  if (name) return name;
  const email = profile.email?.trim();
  if (email) return email.split("@")[0] ?? email;
  return "STAMP user";
}
