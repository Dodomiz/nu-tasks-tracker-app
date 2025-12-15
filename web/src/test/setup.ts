// Polyfill for Headless UI in JSDOM
if (typeof ResizeObserver === 'undefined') {
  class ResizeObserverPolyfill {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // Ensure available on both global and window
  // @ts-ignore
  (globalThis as any).ResizeObserver = ResizeObserverPolyfill;
  // @ts-ignore
  if (typeof window !== 'undefined') {
    // @ts-ignore
    (window as any).ResizeObserver = ResizeObserverPolyfill;
  }
}
