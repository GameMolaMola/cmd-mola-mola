
export function setupKeyboardHandlers(keys: any, shoot: () => void) {
  const handleKeyDown = (e: KeyboardEvent) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      shoot();
    }
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    keys[e.code] = false;
  };
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
  };
}
