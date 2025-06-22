
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AppStoreGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-900 to-cyan-900 flex flex-col items-center justify-start px-2 py-8">
      <div className="bg-black/80 rounded-xl shadow-xl max-w-2xl w-full py-6 px-4 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-yellow-400 drop-shadow mb-2 text-center">Публикация в App Store</h1>
        <p className="text-cyan-100 text-lg text-center">
          Эта страница подскажет, как перенести вашу игру в нативное приложение для iOS и опубликовать в App Store.
        </p>
        <ol className="text-sm text-white list-decimal pl-5 space-y-3 text-left w-full max-w-xl">
          <li>
            <strong>Установите Capacitor:</strong><br/>
            <code className="bg-cyan-900 px-2 py-1 rounded">npm install @capacitor/core @capacitor/cli @capacitor/ios</code>
          </li>
          <li>
            <strong>Инициализируйте Capacitor:</strong><br/>
            <code className="bg-cyan-900 px-2 py-1 rounded">
              npx cap init<br/>
              // App ID: <span className="text-yellow-300">app.mola.mola</span><br/>
              // App Name: mola-mola-pixel
            </code>
          </li>
          <li>
            <strong>Добавьте iOS:</strong><br/>
            <code className="bg-cyan-900 px-2 py-1 rounded">npx cap add ios</code>
          </li>
          <li>
            <strong>Соберите проект и синхронизируйте его с Capacitor:</strong><br/>
            <code className="bg-cyan-900 px-2 py-1 rounded">
              npm run build<br/>
              npx cap sync
            </code>
          </li>
          <li>
            <strong>Откройте Xcode:</strong><br/>
            <code className="bg-cyan-900 px-2 py-1 rounded">npx cap open ios</code>
          </li>
          <li>Настройте и протестируйте проект в Xcode, добавьте все необходимые иконки и splash-экраны.</li>
          <li>Опубликуйте приложение через <strong>App Store Connect</strong>.</li>
        </ol>
        <p className="text-cyan-300 text-sm mt-2 text-center">
          Подробная инструкция здесь: <a className="underline text-yellow-200" href="https://example.com/mobile-guide" target="_blank" rel="noopener noreferrer">Документация по мобильной поддержке</a>
        </p>
        <Button onClick={() => navigate("/")} className="mt-3">← На главную</Button>
      </div>
    </div>
  );
};

export default AppStoreGuide;
