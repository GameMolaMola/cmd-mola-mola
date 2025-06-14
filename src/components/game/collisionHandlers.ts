
-import { isGodmodeActive, applyGodmodeIfNeeded } from './godmode';
-
-type Player = {
-  health: number;
-  coins: number;
-  level: number;
-  godmode?: boolean;
-};
-
-type Enemy = {
-  x: number;
-  y: number;
-  width: number;
-  height: number;
-};
-
-type GameCallbacks = {
-  onGameEnd: (victory: boolean, finalStats: any) => void;
-  onStateUpdate: (updates: any) => void;
-};
-
-export function handleEnemyCollisions(
-  player: Player,
-  enemies: Enemy[],
-  godmode: boolean,
-  checkCollision: (a: any, b: any) => boolean,
-  callbacks: GameCallbacks
-) {
-  for (const enemy of enemies) {
-    if (checkCollision(player, enemy)) {
-      if (isGodmodeActive(godmode)) {
-        applyGodmodeIfNeeded(player, godmode);
-        if (player.health !== 100) {
-          console.warn('[collisionHandlers] Godmode active but health:', player.health);
-        }
-        continue;
-      } else {
-        player.health -= 2;
-        callbacks.onStateUpdate?.({
-          health: player.health,
-        });
-        if (player.health <= 0) {
-          callbacks.onGameEnd(false, { 
-            level: player.level, 
-            coins: player.coins, 
-            score: player.coins * 10 
-          });
-          return true; // game ended
-        }
-      }
-    }
-  }
-  return false;
-}
+import { isGodmodeActive, applyGodmodeIfNeeded } from './godmode';
+
+type Player = {
+  health: number;
+  coins: number;
+  level: number;
+  godmode?: boolean;
+  username?: string;
+};
+
+type Enemy = {
+  x: number;
+  y: number;
+  width: number;
+  height: number;
+};
+
+type GameCallbacks = {
+  onGameEnd: (victory: boolean, finalStats: any) => void;
+  onStateUpdate: (updates: any) => void;
+};
+
+// Один и тот же фильтр: урон не наносится для @MolaMolaCoin
+export function handleEnemyCollisions(
+  player: Player,
+  enemies: Enemy[],
+  godmode: boolean,
+  checkCollision: (a: any, b: any) => boolean,
+  callbacks: GameCallbacks
+) {
+  for (const enemy of enemies) {
+    if (checkCollision(player, enemy)) {
+      if (player?.username === '@MolaMolaCoin') {
+        player.health = 100;
+        continue;
+      }
+      if (isGodmodeActive(godmode)) {
+        applyGodmodeIfNeeded(player, godmode);
+        if (player.health !== 100) {
+          console.warn('[collisionHandlers] Godmode active but health:', player.health);
+        }
+        continue;
+      } else {
+        player.health -= 2;
+        callbacks.onStateUpdate?.({
+          health: player.health,
+        });
+        if (player.health <= 0) {
+          callbacks.onGameEnd(false, { 
+            level: player.level, 
+            coins: player.coins, 
+            score: player.coins * 10 
+          });
+          return true; // game ended
+        }
+      }
+    }
+  }
+  return false;
+}
