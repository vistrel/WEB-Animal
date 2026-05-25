import { useEffect, useState } from "react";
import { createPlaceholderImage } from "../../utils/ads";

function ImageGallery({ items = [], placeholderTitle }) {
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setIndex(0), [items]);

  useEffect(() => {
    function onKey(e) {
      if (!isOpen) return;
      if (e.key === "Escape") setIsOpen(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % items.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + items.length) % items.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, items.length]);

  if (!items || !items.length) return null;

  return (
    <div className="image-gallery">
      <div className="listing-main-image-wrap">
        <img
          className="listing-main-image clickable"
          src={items[index].url}
          alt={placeholderTitle}
          onClick={() => setIsOpen(true)}
          onError={(e) => (e.currentTarget.src = createPlaceholderImage(placeholderTitle))}
        />
      </div>

      {items.length > 1 ? (
        <div className="ad-thumbs">
              {items.map((img, i) => (
            <button
              key={img.id}
              type="button"
              className={`ad-thumb-button ${i === index ? "active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Переглянути фото ${i + 1}`}
            >
              <img className="ad-thumb" src={img.url} alt={placeholderTitle} onError={(e) => (e.currentTarget.src = createPlaceholderImage(placeholderTitle))} />
            </button>
          ))}
        </div>
      ) : null}

      {isOpen ? (
        <div className="gallery-modal" onClick={() => setIsOpen(false)}>
          <div className="gallery-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-close" onClick={() => setIsOpen(false)} aria-label="Закрити">✕</button>
            <button className="gallery-prev" onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)} aria-label="Попереднє">◀</button>
            <img className="gallery-image" src={items[index].url} alt={placeholderTitle} onError={(e) => (e.currentTarget.src = createPlaceholderImage(placeholderTitle))} />
            <button className="gallery-next" onClick={() => setIndex((i) => (i + 1) % items.length)} aria-label="Наступне">▶</button>
            {items.length > 1 ? (
              <div className="gallery-strip">
                {items.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    className={`gallery-thumb ${i === index ? "active" : ""}`}
                    onClick={() => setIndex(i)}
                    aria-label={`Фото ${i + 1}`}
                  >
                    <img src={img.url} alt={`${placeholderTitle} ${i + 1}`} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ImageGallery;
