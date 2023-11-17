type ElementPosition = "above" | "below" | null;

export function getElementPosition(el: HTMLElement): ElementPosition {
  const rect = el.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  if (rect.bottom < 0) return "above";
  if (rect.top > windowHeight) return "below";
  return null;
}
