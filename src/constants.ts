export const GODMODE_USERNAME = '@MolaMolaCoin';

export function isGodmodeUser(username?: string, flag?: boolean): boolean {
  return Boolean(flag) || username === GODMODE_USERNAME;
}
