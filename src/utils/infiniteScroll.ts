interface InfiniteScrollOptions {
  /**
   * The speed of the scroll in pixels per second.
   * If not provided, the scroll will be disabled.
   */
  scrollSpeed?: number | null;

  /**
   * The element to clone the content into.
   * If not provided, the content will be cloned into the container.
   */
  cloneInto?: HTMLElement;
}

export function infiniteScrollLoop(
  container: HTMLElement,
  content: HTMLElement,
  options: InfiniteScrollOptions = {},
) {
  const { scrollSpeed = 40, cloneInto } = options;

  const target = cloneInto || container;

  if (!container || !content || !target) return;

  const cloned = content.cloneNode(true);
  target.appendChild(cloned);

  const threshold = Math.floor(container.clientHeight * 0.1);

  const handleScroll = () => {
    const contentHeight = content.clientHeight;

    if (container.scrollTop > contentHeight + threshold) {
      container.scrollTo(0, container.scrollTop - contentHeight);
    } else if (container.scrollTop < threshold) {
      container.scrollTo(0, contentHeight + container.scrollTop);
    }
  };

  container.addEventListener("scroll", handleScroll, { passive: true });

  if (scrollSpeed) {
    let lastTime = performance.now();
    let totalScrolled = 0;
    let isPaused = false;

    const handleTouchStart = () => {
      isPaused = true;
    };

    const handleTouchEnd = () => {
      isPaused = false;
      lastTime = performance.now(); // Reset time to prevent jump
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    function animate(currentTime: number) {
      if (!scrollSpeed) return;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (!isPaused) {
        const targetScrollPerSecond = scrollSpeed;
        const scrollAmount = (targetScrollPerSecond * deltaTime) / 1000;
        totalScrolled += scrollAmount;

        if (totalScrolled >= 1) {
          container.scrollBy(0, Math.floor(totalScrolled));
          totalScrolled -= Math.floor(totalScrolled);
        }
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }
}
