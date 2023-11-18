type ElementPosition = "above" | "below" | null;

export function getElementPosition(el: HTMLElement): ElementPosition {
  const rect = el.getBoundingClientRect();
  const editorElement = document.getElementById("editor");

  if (!editorElement) {
    return null;
  }

  const editorRect = editorElement.getBoundingClientRect();

  // 40 is for the menubar
  if (rect.bottom < editorRect.top + 40) return "above";
  if (rect.top > editorRect.bottom) return "below";
  return null;
}
