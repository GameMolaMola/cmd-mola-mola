
export function setupKeyboardHandlers(keys: any, shoot: () => void) {
  // only SPACE is supported
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      keys.Space = true;
      if (!e.repeat) {
        e.preventDefault();
        shoot();
      }
    }
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      keys.Space = false;
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
  };
}
