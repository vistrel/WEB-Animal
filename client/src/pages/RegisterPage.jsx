import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { isValidUkrainianPhone, normalizeUkrainianPhone } from "../utils/phone";

function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.phone && !isValidUkrainianPhone(form.phone)) {
      setError(
        "Вкажіть коректний український номер телефону, наприклад +380671234567 або 0671234567",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        ...form,
        phone: form.phone ? normalizeUkrainianPhone(form.phone) : "",
      });
      navigate("/profile");
    } catch (error) {
      setError(
        error?.response?.data?.message || "Не вдалося виконати реєстрацію",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container narrow-container">
        <div className="form-card">
          <div className="form-card-head">
            <span className="form-icon">🐱</span>
            <h1>Реєстрація</h1>
            <p>
              Створіть акаунт, щоб розміщувати оголошення та спілкуватися з
              користувачами.
            </p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Ім’я та прізвище</span>
              <input
                className="input"
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Наприклад, Олена Кравчук"
                autoComplete="name"
                required
              />
            </label>

            <label className="form-field">
              <span>Email</span>
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Введіть email"
                autoComplete="email"
                required
              />
            </label>

            <label className="form-field">
              <span>Пароль</span>
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Не менше 8 символів"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="form-field">
              <span>Номер телефону</span>
              <input
                className="input"
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+380671234567 або 0671234567"
                autoComplete="tel"
              />
            </label>

            <label className="form-field">
              <span>Місто</span>
              <input
                className="input"
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Вкажіть місто"
                autoComplete="address-level2"
              />
            </label>

            {error ? <div className="form-error">{error}</div> : null}

            <button
              type="submit"
              className="button full-width"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Створення акаунта..." : "Зареєструватися"}
            </button>
          </form>

          <div className="form-footer-note">
            <span>Вже маєте акаунт?</span>
            <Link to="/login">Увійти</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
