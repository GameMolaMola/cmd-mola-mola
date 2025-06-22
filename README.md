# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/804fa850-7a8a-4f41-9348-00fecc6f9455

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/804fa850-7a8a-4f41-9348-00fecc6f9455) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Linting

To run the linter, ensure that you have installed all dependencies first:

```sh
npm install
npm run lint
```
The `npm run lint` command will automatically install missing dependencies via
the `prelint` script defined in `package.json`.

## Running tests

To run the test suite, make sure the project dependencies are installed:

```sh
npm install
npm test
```
This will execute the Vitest suite.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/804fa850-7a8a-4f41-9348-00fecc6f9455) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Как собрать приложение для iOS (App Store Publish)

1. Установите Capacitor:
   ```
   npm install @capacitor/core @capacitor/cli @capacitor/ios
   ```

2. Инициализируйте проект:
   ```
   npx cap init
   ```
   - App ID: app.lovable.804fa8507a8a4f41934800fecc6f9455
   - App Name: mola-mola-pixel

   В конфиге уже прописан автоматический hot-reload на ваш Lovable-сервер для удобства отладки.

3. Добавьте платформу iOS:
   ```
   npx cap add ios
   ```

4. Соберите проект и синхронизируйте веб-ресурсы:
   ```
   npm run build
   npx cap sync
   ```

5. Откройте проект в Xcode:
   ```
   npx cap open ios
   ```

6. Сборка, настройка и публикация — стандартные для App Store приложения шаги.

Полное руководство — [Блог Lovable: публикация мобильных приложений](https://lovable.dev/blogs/)
