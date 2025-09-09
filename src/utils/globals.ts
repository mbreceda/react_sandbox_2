// Polyfill for the global object
if (typeof window !== "undefined" && !window.global) {
  window.global = window;
}

export {};
