/**
 * Next.js Client Instrumentation Hook.
 * Executed automatically before React calls hydrateRoot().
 *
 * Strips DOM attributes injected by browser extensions (such as `bis_skin_checked`,
 * `bis_register`, and `__processed_*`) before and during concurrent hydration so
 * third-party browser extensions do not cause React hydration mismatch overlays.
 */

function stripExtensionAttributesFromElement(el: Element): void {
  const attrs = el.attributes;
  for (let i = attrs.length - 1; i >= 0; i--) {
    const name = attrs[i].name;
    if (name.startsWith('bis_') || name.startsWith('__processed_')) {
      el.removeAttribute(name);
    }
  }
}

function stripAllExtensionAttributes(): void {
  if (typeof document === 'undefined') return;
  const elements = document.querySelectorAll('*');
  for (let i = 0; i < elements.length; i++) {
    stripExtensionAttributesFromElement(elements[i]);
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  stripAllExtensionAttributes();

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.type === 'attributes' &&
          m.attributeName &&
          (m.attributeName.startsWith('bis_') || m.attributeName.startsWith('__processed_')) &&
          m.target instanceof Element
        ) {
          m.target.removeAttribute(m.attributeName);
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
    });

    // Disconnect once hydration settles so zero ongoing observer overhead remains
    window.setTimeout(() => {
      observer.disconnect();
    }, 3000);
  }
}

export {};
