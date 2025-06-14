
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AndroidGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-green-900 to-cyan-900 flex flex-col items-center justify-start px-2 py-8">
      <div className="bg-black/80 rounded-xl shadow-xl max-w-2xl w-full py-6 px-4 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-green-400 drop-shadow mb-2 text-center">Публикация в Google Play</h1>
        <p className="text-cyan-100 text-lg text-center">
          Эта страница подскажет, как перенести вашу игру в приложение для Android и опубликовать в Google Play.
        </p>
        <ol className="text-sm text-white list-decimal pl-5 space-y-3 text-left w-full max-w-xl">
          <li>
            <strong>Установите Capacitor:</strong><br/>
            <code className="bg-cyan-900 px-2 py-1 rounded">npm install @capacitor/core @capacitor/cli @capacitor/android</code>
          </li>
          <li>
            <strong>Инициализируйте Capacitor:</strong><br/>
            <code className="bg-cyan-900 px-2 py-1 rounded">
              npx cap init<br/>
              // App ID: <span className="text-yellow-300">app.lovable.804fa8507a8a4f41934800fecc6f9455</span><br/>
              // App Name: mola-mola-pixel
            </code>
          </li>
          <li>
            <strong>Добавьте Android:</strong><br/>
            <code className="bg-cyan-900 px-2 py-1 rounded">npx cap add android</code>
          </li>
          <li>
            <strong>Соберите проект и синхронизируйте его с Capacitor:</strong><br/>
            <code className="bg-cyan-900 px-2 py-1 rounded">
              npm run build<br/>
              npx cap sync
            </code>
          </li>
          <li>
            <strong>Откройте проект в Android Studio:</strong><br/>
            <code className="bg-cyan-900 px-2 py-1 rounded">npx cap open android</code>
          </li>
          <li>Настройте и протестируйте приложение, настройте иконки и splash-экраны.</li>
          <li>Опубликуйте приложение через <strong>Google Play Console</strong>.</li>
        </ol>
        <p className="text-cyan-300 text-sm mt-2 text-center">
          Подробная инструкция здесь: <a className="underline text-yellow-200" href="https://lovable.dev/blogs/TODO" target="_blank" rel="noopener noreferrer">Блог Lovable – публикация мобильных приложений</a>
        </p>
        <Button onClick={() => navigate("/")} className="mt-3">← На главную</Button>
      </div>
    </div>
  );
};

export default AndroidGuide;
