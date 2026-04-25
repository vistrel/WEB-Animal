import {
  adTypeLabels,
  createPlaceholderImage,
  resolveMediaUrl,
} from "../../utils/ads";

function AdForm({
  form,
  petTypes,
  breeds,
  files,
  existingImages = [],
  isSubmitting,
  submitLabel,
  onChange,
  onFilesChange,
  onSubmit,
  onDeleteImage,
}) {
  function handleImageError(event) {
    event.currentTarget.src = createPlaceholderImage("Фото оголошення");
  }

  return (
    <form className="ad-form" onSubmit={onSubmit}>
      <section className="form-section-card">
        <div className="form-section-head">
          <h2>Основна інформація</h2>
          <p>
            Заповніть дані, які допоможуть покупцю швидко зрозуміти суть
            оголошення.
          </p>
        </div>

        <div className="form-grid two-columns">
          <label className="form-field">
            <span>Назва оголошення</span>
            <input
              className="input"
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="Наприклад, Продаж цуценяти лабрадора"
              required
            />
          </label>

          <label className="form-field">
            <span>Тип оголошення</span>
            <select
              className="input"
              name="adType"
              value={form.adType}
              onChange={onChange}
            >
              {Object.entries(adTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Вид тварини</span>
            <select
              className="input"
              name="petTypeId"
              value={form.petTypeId}
              onChange={onChange}
              required
            >
              <option value="">Оберіть вид</option>
              {petTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Порода</span>
            <select
              className="input"
              name="breedId"
              value={form.breedId}
              onChange={onChange}
            >
              <option value="">Порода не вказана</option>
              {breeds.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Стать</span>
            <select
              className="input"
              name="animalGender"
              value={form.animalGender}
              onChange={onChange}
            >
              <option value="UNKNOWN">Невідомо</option>
              <option value="MALE">Самець</option>
              <option value="FEMALE">Самка</option>
            </select>
          </label>

          <label className="form-field">
            <span>Вік, місяців</span>
            <input
              className="input"
              type="number"
              min="0"
              max="360"
              name="ageMonths"
              value={form.ageMonths}
              onChange={onChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Ціна, грн</span>
            <input
              className="input"
              type="number"
              min="0"
              name="price"
              value={form.price}
              onChange={onChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Статус оголошення</span>
            <select
              className="input"
              name="status"
              value={form.status}
              onChange={onChange}
            >
              <option value="ACTIVE">Активне</option>
              <option value="RESERVED">Резерв</option>
              <option value="SOLD">Продано</option>
            </select>
          </label>
        </div>
      </section>

      <section className="form-section-card">
        <div className="form-section-head">
          <h2>Місцезнаходження</h2>
          <p>
            Для дипломного проєкту використовуємо місто та область без точної
            геолокації.
          </p>
        </div>

        <div className="form-grid two-columns">
          <label className="form-field">
            <span>Місто</span>
            <input
              className="input"
              name="city"
              value={form.city}
              onChange={onChange}
              placeholder="Наприклад, Київ"
              required
            />
          </label>

          <label className="form-field">
            <span>Область</span>
            <input
              className="input"
              name="region"
              value={form.region}
              onChange={onChange}
              placeholder="Наприклад, Київська область"
            />
          </label>
        </div>
      </section>

      <section className="form-section-card">
        <div className="form-section-head">
          <h2>Опис та характеристики</h2>
          <p>Ці поля формують структуровану сторінку оголошення.</p>
        </div>

        <div className="form-grid">
          <label className="form-field">
            <span>Опис</span>
            <textarea
              className="input textarea"
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Опишіть характер, поведінку, особливості тварини"
              required
            />
          </label>

          <label className="form-field">
            <span>Стан здоров’я</span>
            <textarea
              className="input textarea"
              name="healthInfo"
              value={form.healthInfo}
              onChange={onChange}
              placeholder="Наприклад, здорова, проходила огляд у ветеринара"
              required
            />
          </label>

          <label className="form-field">
            <span>Щеплення</span>
            <textarea
              className="input textarea"
              name="vaccinationInfo"
              value={form.vaccinationInfo}
              onChange={onChange}
              placeholder="Вкажіть інформацію про щеплення"
              required
            />
          </label>

          <label className="form-field">
            <span>Документи / родовід</span>
            <textarea
              className="input textarea"
              name="documentInfo"
              value={form.documentInfo}
              onChange={onChange}
              placeholder="Вкажіть наявність документів або родоводу"
              required
            />
          </label>

          <label className="form-field">
            <span>Умови утримання</span>
            <textarea
              className="input textarea"
              name="housingInfo"
              value={form.housingInfo}
              onChange={onChange}
              placeholder="Опишіть, у яких умовах утримується тварина"
              required
            />
          </label>
        </div>
      </section>

      <section className="form-section-card">
        <div className="form-section-head">
          <h2>Фото</h2>
          <p>
            Підтримуються JPG, PNG та WEBP. Максимальний розмір одного фото — 5
            МБ.
          </p>
        </div>

        {existingImages.length ? (
          <div className="existing-images-grid">
            {existingImages.map((image) => (
              <div className="existing-image-card" key={image.id}>
                <img
                  src={resolveMediaUrl(image.url, "Фото оголошення")}
                  alt="Фото оголошення"
                  onError={handleImageError}
                />
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => onDeleteImage(image.id)}
                >
                  Видалити
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <label className="file-drop">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => onFilesChange(event.target.files)}
          />
          <span>🐾 Додати фото</span>
          <small>Обрано файлів: {files?.length || 0}</small>
        </label>
      </section>

      <div className="sticky-form-actions">
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? "Збереження..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default AdForm;
