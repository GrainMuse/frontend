import { useEffect, useRef, useState } from 'react';

export function useScrollReveal(deps = []) {
  useEffect(() => {
    let observer;
    let mutationObserver;

    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
      );

      const observeRevealElements = (root) => {
        if (root instanceof Element && root.matches('.sr:not(.in)')) {
          observer.observe(root);
        }
        root.querySelectorAll?.('.sr:not(.in)').forEach((el) => observer.observe(el));
      };

      observeRevealElements(document);

      // Public content is loaded asynchronously. Observe cards that are added
      // after the first render so they do not stay hidden until a page refresh.
      mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) observeRevealElements(node);
          });
        });
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }, 80);
    return () => {
      clearTimeout(timer);
      mutationObserver?.disconnect();
      observer?.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsInView(true); observer.unobserve(el); }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, isInView];
}
