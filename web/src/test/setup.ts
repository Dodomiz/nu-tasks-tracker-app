// Polyfill for Headless UI in JSDOM
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// Ensure available on both global and window
// @ts-ignore
(globalThis as any).ResizeObserver = ResizeObserver;
// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  (window as any).ResizeObserver = ResizeObserver;
}
