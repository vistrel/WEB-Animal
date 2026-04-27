import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useFavoritesStore } from "../../store/favorites.store";
import {
  adTypeLabels,
  createPlaceholderImage,
  formatAge,
  formatPrice,
  getAdImage,
  genderLabels,
  statusLabels,
} from "../../utils/ads";

function AdCard({ ad }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const isFavorite = Boolean(favoriteIds[ad.id]);

  function handleImageError(event) {
    event.currentTarget.src = createPlaceholderImage(ad?.title || "Оголошення");
  }

  async function handleFavoriteClick() {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await toggleFavorite(ad.id, accessToken);
    } catch (error) {
      window.alert(
        error?.response?.data?.message || "Не вдалося оновити обране",
      );
    }
  }

  return (
    <article className="listing-card">
      <div className="listing-card-image-wrap">
        <Link to={`/ads/${ad.slug}`} className="listing-card-image-link">
          <img
            className="listing-card-image"
            src={getAdImage(ad)}
            alt={ad.title}
            onError={handleImageError}
          />
        </Link>

        <div className="listing-card-badges">
          <span className="listing-badge primary">
            {adTypeLabels[ad.adType] || ad.adType}
          </span>
          <span className="listing-badge">
            {statusLabels[ad.status] || ad.status}
          </span>
        </div>

        <button
          type="button"
          className={`favorite-button ${isFavorite ? "active" : ""}`}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Видалити з обраного" : "Додати в обране"}
          title={isFavorite ? "Видалити з обраного" : "Додати в обране"}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="listing-card-body">
        <div className="listing-card-topline">
          <span className="listing-card-location">{ad.city}</span>
          <span className="listing-card-price">{formatPrice(ad.price)}</span>
        </div>

        <h3 className="listing-card-title">
          <Link to={`/ads/${ad.slug}`}>{ad.title}</Link>
        </h3>

        <p className="listing-card-excerpt">{ad.descriptionExcerpt}</p>

        <div className="listing-card-meta">
          <span>{ad.petType?.name || "Тварина"}</span>
          <span>{ad.breed?.name || "Порода не вказана"}</span>
          <span>{genderLabels[ad.animalGender] || "Невідомо"}</span>
          <span>{formatAge(ad.ageMonths)}</span>
        </div>

        <div className="listing-card-footer">
          <div className="listing-card-seller">
            <strong>{ad.author?.fullName || "Користувач"}</strong>
            <small>
              Рейтинг {Number(ad.author?.averageRating || 0).toFixed(2)} ·
              відгуків {ad.author?.reviewsCount || 0}
            </small>
          </div>

          <Link to={`/ads/${ad.slug}`} className="button button-secondary">
            Детальніше
          </Link>
        </div>
      </div>
    </article>
  );
}

export default AdCard;
