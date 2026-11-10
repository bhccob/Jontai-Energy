// Whether this visitor gets the live stage. Everyone else keeps the still picture of the same view, which is complete.

/** Wide and tall enough for the words beside the products (narrower screens stack them). */
export const STAGE_MEDIA = '(min-width: 961px) and (min-height: 560px)';

export function stageAllowed(): boolean {
  if (!window.matchMedia(STAGE_MEDIA).matches) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  try {
    // A real GPU, not a software fallback that would make the page crawl.
    const probe = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    if (!probe) return false;
    probe.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return false;
  }
  return true;
}
