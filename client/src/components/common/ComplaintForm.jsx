const reasonLabels = {
  SPAM: "Спам або реклама",
  FRAUD: "Шахрайство",
  INAPPROPRIATE: "Неприпустимий контент",
  DANGEROUS: "Небезпечна інформація",
  WRONG_INFO: "Неправдива інформація",
  OTHER: "Інша причина",
};

function ComplaintForm({
  title = "Поскаржитися",
  subtitle = "Опишіть причину скарги. Модератор перевірить інформацію.",
  form,
  isSubmitting,
  message,
  onChange,
  onSubmit,
}) {
  return (
    <form className="complaint-form" onSubmit={onSubmit}>
      <div className="form-section-head">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <label className="form-field">
        <span>Причина</span>
        <select
          className="input"
          name="reason"
          value={form.reason}
          onChange={onChange}
        >
          {Object.entries(reasonLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Коментар</span>
        <textarea
          className="input textarea small-textarea"
          name="text"
          value={form.text}
          onChange={onChange}
          placeholder="Коротко опишіть проблему"
        />
      </label>

      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? "Надсилання..." : "Надіслати скаргу"}
      </button>

      {message ? <div className="profile-note">{message}</div> : null}
    </form>
  );
}

export default ComplaintForm;
