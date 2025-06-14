
export function loadImages(images: any, onLoaded?: () => void) {
  const imageUrls = {
    player1: '/lovable-uploads/d62d1b89-98ee-462d-bbc4-37715a91950f.png',
    player2: '/lovable-uploads/00354654-8e2c-4993-8167-a9e91aef0d44.png',
    playerLeft: '/lovable-uploads/2c28ddc1-8540-47f5-9b8d-78887b6c289f.png',
    coin: '/lovable-uploads/a8dae000-616d-4f8b-bce1-d8b37c9eae56.png',
    brasilena: '/lovable-uploads/cc5bbfd2-9663-470b-8edf-b5314b29b3f0.png',
    wine: '/lovable-uploads/989f5507-8b03-451b-b9c1-b0e2d1cc1aaa.png',
    pizza: '/lovable-uploads/204b20b0-06cb-45cd-b3e7-8a94e658a065.png',
    enemy: '/lovable-uploads/080fcc27-fe7b-448a-9661-9e1a894abab7.png',
    enemyLeft: '/lovable-uploads/65338906-ef6b-4097-bcbc-73770f962827.png',
    bossLucia: '/lovable-uploads/e2e9e94b-84f9-450f-a422-4f25b84dc5c0.png',
  };
  images.playerFrames[0].src = imageUrls.player1;
  images.playerFrames[1].src = imageUrls.player2;
  images.playerLeft.src = imageUrls.playerLeft;
  images.enemy.src = imageUrls.enemy;
  images.enemyLeft.src = imageUrls.enemyLeft;
  images.pizza.src = imageUrls.pizza;
  images.brasilena.src = imageUrls.brasilena;
  images.wine.src = imageUrls.wine;
  images.coin.src = imageUrls.coin;
  images.bossLucia.src = imageUrls.bossLucia;

  let loadedCount = 0;
  let toLoad = Object.keys(imageUrls).length;
  Object.entries(imageUrls).forEach(([key, url]) => {
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      loadedCount += 1;
      if (loadedCount >= toLoad && onLoaded) onLoaded();
    };
    img.onerror = () => {
      if (loadedCount >= toLoad && onLoaded) onLoaded();
    };
  });
}
