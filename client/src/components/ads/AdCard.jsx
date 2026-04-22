import { Link } from "react-router-dom";
import {
  adTypeLabels,
  formatAge,
  formatPrice,
  getAdImage,
  genderLabels,
  statusLabels,
} from "../../utils/ads";

function AdCard({ ad }) {
  return (
    <article className="ad-card">
      <Link to={`/ads/${ad.slug}`} className="ad-card-image-wrap">
        <img className="ad-card-image" src={getAdImage(ad)} alt={ad.title} />
        <div className="ad-card-badges">
          <span className="ad-badge primary">
            {adTypeLabels[ad.adType] || ad.adType}
          </span>
          <span className="ad-badge">
            {statusLabels[ad.status] || ad.status}
          </span>
        </div>
      </Link>

      <div className="ad-card-body">
        <div className="ad-card-topline">
          <span className="ad-card-location">{ad.city}</span>
          <span className="ad-card-price">{formatPrice(ad.price)}</span>
        </div>

        <h3 className="ad-card-title">
          <Link to={`/ads/${ad.slug}`}>{ad.title}</Link>
        </h3>

        <p className="ad-card-excerpt">{ad.descriptionExcerpt}</p>

        <div className="ad-card-meta">
          <span>{ad.petType?.name || "Тварина"}</span>
          <span>{ad.breed?.name || "Порода не вказана"}</span>
          <span>{genderLabels[ad.animalGender] || "Невідомо"}</span>
          <span>{formatAge(ad.ageMonths)}</span>
        </div>

        <div className="ad-card-footer">
          <div className="ad-card-seller">
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
