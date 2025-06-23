// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

export const GODMODE_USERNAME = '@MolaMolaCoin';

const GODMODE_USERNAME_NORMALIZED = GODMODE_USERNAME.trim().toLowerCase();

export function isGodmodeUser(username?: string, flag?: boolean): boolean {
  const normalized = username?.trim().toLowerCase();
  return Boolean(flag) || normalized === GODMODE_USERNAME_NORMALIZED;
}

export const IS_SKELETON_MODE = import.meta.env.VITE_SKELETON_MODE === 'true';
