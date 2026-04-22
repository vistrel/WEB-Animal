import { Link } from "react-router-dom";
import { adTypeLabels, ageGroupLabels, sortOptions } from "../../utils/ads";

function MarketplaceFilters({
  title,
  subtitle,
  filters,
  petTypes,
  breeds,
  onChange,
  onSubmit,
  onReset,
  submitLabel = "Застосувати фільтри",
  catalogHref = null,
  compact = false,
}) {
  return (
    <section className={`filters-panel ${compact ? "compact" : ""}`}>
      <div className="filters-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        {catalogHref ? (
          <Link to={catalogHref} className="button button-secondary">
            Відкрити весь каталог
          </Link>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="filters-form">
        <div className="filters-grid">
          <label className="form-field">
            <span>Пошук</span>
            <input
              className="input"
              type="text"
              name="q"
              value={filters.q}
              onChange={(event) => onChange("q", event.target.value)}
              placeholder="Наприклад, лабрадор або кішка"
            />
          </label>

          <label className="form-field">
            <span>Вид тварини</span>
            <select
              className="input"
              name="petType"
              value={filters.petType}
              onChange={(event) => onChange("petType", event.target.value)}
            >
              <option value="">Усі види</option>
              {petTypes.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Порода</span>
            <select
              className="input"
              name="breed"
              value={filters.breed}
              onChange={(event) => onChange("breed", event.target.value)}
            >
              <option value="">Усі породи</option>
              {breeds.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Місто</span>
            <input
              className="input"
              type="text"
              name="city"
              value={filters.city}
              onChange={(event) => onChange("city", event.target.value)}
              placeholder="Вкажіть місто"
            />
          </label>

          <label className="form-field">
            <span>Стать</span>
            <select
              className="input"
              name="gender"
              value={filters.gender}
              onChange={(event) => onChange("gender", event.target.value)}
            >
              <option value="">Будь-яка</option>
              <option value="MALE">Самець</option>
              <option value="FEMALE">Самка</option>
              <option value="UNKNOWN">Невідомо</option>
            </select>
          </label>

          <label className="form-field">
            <span>Тип оголошення</span>
            <select
              className="input"
              name="adType"
              value={filters.adType}
              onChange={(event) => onChange("adType", event.target.value)}
            >
              <option value="">Усі типи</option>
              {Object.entries(adTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Вікова група</span>
            <select
              className="input"
              name="ageGroup"
              value={filters.ageGroup}
              onChange={(event) => onChange("ageGroup", event.target.value)}
            >
              <option value="">Будь-яка</option>
              {Object.entries(ageGroupLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Сортування</span>
            <select
              className="input"
              name="sort"
              value={filters.sort}
              onChange={(event) => onChange("sort", event.target.value)}
            >
              {sortOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Ціна від</span>
            <input
              className="input"
              type="number"
              min="0"
              name="minPrice"
              value={filters.minPrice}
              onChange={(event) => onChange("minPrice", event.target.value)}
              placeholder="0"
            />
          </label>

          <label className="form-field">
            <span>Ціна до</span>
            <input
              className="input"
              type="number"
              min="0"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={(event) => onChange("maxPrice", event.target.value)}
              placeholder="50000"
            />
          </label>
        </div>

        <div className="filters-actions">
          <button type="submit" className="button">
            {submitLabel}
          </button>

          <button
            type="button"
            className="button button-ghost"
            onClick={onReset}
          >
            Скинути
          </button>
        </div>
      </form>
    </section>
  );
}

export default MarketplaceFilters;
