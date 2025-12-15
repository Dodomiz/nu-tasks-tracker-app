import '@testing-library/jest-dom';

// Polyfill ResizeObserver for Headless UI components in JSDOM
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
	class ResizeObserver {
		callback: ResizeObserverCallback;
		constructor(callback: ResizeObserverCallback) {
			this.callback = callback;
		}
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	// @ts-ignore
	(globalThis as any).ResizeObserver = ResizeObserver;
}
