import { useEffect } from "react";
import { useUxStore } from "../../store/ux.store";

const pawImages = ["/paws/paw-1.png", "/paws/paw-2.png"];

function PawCursor() {
  const pawEffectEnabled = useUxStore((state) => state.pawEffectEnabled);

  useEffect(() => {
    if (!pawEffectEnabled) {
      return;
    }

    const isTouchDevice = window.matchMedia("(hover: none)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (isTouchDevice || prefersReducedMotion) {
      return;
    }

    let lastCreatedAt = 0;
    let imageIndex = 0;

    function handlePointerMove(event) {
      const now = Date.now();

      if (now - lastCreatedAt < 90) {
        return;
      }

      lastCreatedAt = now;

      const paw = document.createElement("img");
      paw.className = "paw-cursor-item";
      paw.src = pawImages[imageIndex % pawImages.length];
      paw.alt = "";
      paw.setAttribute("aria-hidden", "true");
      paw.style.left = `${event.clientX}px`;
      paw.style.top = `${event.clientY}px`;

      imageIndex += 1;

      document.body.appendChild(paw);

      window.setTimeout(() => {
        paw.remove();
      }, 900);
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [pawEffectEnabled]);

  return null;
}

export default PawCursor;
