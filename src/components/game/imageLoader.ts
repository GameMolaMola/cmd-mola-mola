let cachedImages: any | null = null;
let cachedPromise: Promise<void> | null = null;

export function loadImages(images: any): Promise<void> {
  if (cachedImages) {
    Object.assign(images, cachedImages);
    return Promise.resolve();
  }

  if (cachedPromise) {
    return cachedPromise.then(() => {
      Object.assign(images, cachedImages!);
    });
  }

  cachedPromise = new Promise((resolve) => {
    const imageUrls = {
      player1: '/uploads/d62d1b89-98ee-462d-bbc4-37715a91950f.png',
      player2: '/uploads/00354654-8e2c-4993-8167-a9e91aef0d44.png',
      // playerLeft image temporarily disabled as original file is missing
      // playerLeft: '/uploads/2c28ddc1-8540-47f5-9b8d-78887b6c289f.webp',
      coin: '/uploads/a8dae000-616d-4f8b-bce1-d8b37c9eae56.png',
      brasilena: '/uploads/cc5bbfd2-9663-470b-8edf-b5314b29b3f0.png',
      wine: '/uploads/989f5507-8b03-451b-b9c1-b0e2d1cc1aaa.png',
      pizza: '/uploads/204b20b0-06cb-45cd-b3e7-8a94e658a065.png',
      enemy: '/uploads/080fcc27-fe7b-448a-9661-9e1a894abab7.png',
      enemyLeft: '/uploads/65338906-ef6b-4097-bcbc-73770f962827.png',
      // bossLucia image temporarily disabled as original file is missing
      // bossLucia: '/uploads/e2e9e94b-84f9-450f-a422-4f25b84dc5c0.webp',
      swordfishRight: '/uploads/swordfish-right.png',
      swordfishLeft: '/uploads/swordfish-left.png',
    } as Record<string, string>;

    let loadedCount = 0;
    const keys = Object.keys(imageUrls);
    const toLoad = keys.length;

    const checkResolve = () => {
      loadedCount += 1;
      if (loadedCount >= toLoad) {
        cachedImages = images;
        resolve();
      }
    };

    keys.forEach((key) => {
      const url = imageUrls[key];
      const img = new Image();
      img.src = url;
      img.onload = checkResolve;
      img.onerror = (e) => {
        console.error(`Failed to load image ${key} from ${url}`, e);
        checkResolve();
      };

      if (key === 'player1' || key === 'player2') {
        if (!images.playerFrames) {
          console.warn('[imageLoader] images.playerFrames missing, creating fallback array.');
          images.playerFrames = [];
        }
        images.playerFrames[key === 'player1' ? 0 : 1] = img;
      } else {
        images[key] = img;
      }
    });
  });

  return cachedPromise;
}
