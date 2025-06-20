export const GODMODE_USERNAME = '@MolaMolaCoin';

const GODMODE_USERNAME_NORMALIZED = GODMODE_USERNAME.trim().toLowerCase();

export function isGodmodeUser(username?: string, flag?: boolean): boolean {
  const normalized = username?.trim().toLowerCase();
  return Boolean(flag) || normalized === GODMODE_USERNAME_NORMALIZED;
}
