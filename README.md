# Commander Mola Mola Pixel Adventure

This repository contains the source code for a small pixel art game built with React and Vite. The project also includes configuration for Capacitor so the game can be packaged as a native mobile application.

## Development

1. Install dependencies **before** building or testing
   ```sh
   npm install
   # or pnpm install
   ```
2. Start the development server
   ```sh
   npm run dev
   ```
3. Run the test suite
   ```sh
   npm test
   ```
4. Before starting the game in production, make sure every image referenced in
   `src/components/game/imageLoader.ts` is present inside `public/uploads/`.
5. Backgrounds are generated at runtime from
   `src/components/game/parallaxLayers.ts` and drawn to the canvas via
   `src/components/game/renderer.ts`. There is no `background.ts` file, so keep
   this in mind when discussing the code with contributors to avoid confusion.

## Mobile Builds

Guides for packaging the game for iOS and Android are available in the project source under `src/pages/AndroidGuide.tsx` and `src/pages/AppStoreGuide.tsx`.

Enjoy the game!

## Configuration

The Supabase function `send-new-player-email` uses the Resend API to notify the
game administrator when a new player registers. Set `RESEND_API_KEY` so the
function can authenticate with Resend.

When deploying, add `RESEND_API_KEY` to the project's secrets. You can do this
with `supabase secrets set RESEND_API_KEY=your_key` or by adding the variable in
the Supabase dashboard.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for instructions on how to get involved.
It includes tips for writing clear commit messages so the project history is easy to follow.
