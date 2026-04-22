import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [form, setForm] = useState({
    email: "",
    password: "",
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
    setIsSubmitting(true);

    try {
      await login(form);
      navigate("/profile");
    } catch (error) {
      setError(error?.response?.data?.message || "Не вдалося виконати вхід");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container narrow-container">
        <div className="form-card">
          <div className="form-card-head">
            <span className="form-icon">🐶</span>
            <h1>Вхід до акаунта</h1>
            <p>
              Увійдіть, щоб керувати профілем, оголошеннями та повідомленнями.
            </p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
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
                placeholder="Введіть пароль"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? <div className="form-error">{error}</div> : null}

            <button
              type="submit"
              className="button full-width"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Виконується вхід..." : "Увійти"}
            </button>
          </form>

          <div className="form-footer-note">
            <br />
            <span>Ще не маєте акаунта? </span>
            <Link to="/register">Зареєструватися</Link>
          </div>

          {/* <div className="demo-box">
            <h3>Тестовий акаунт адміністратора</h3>
            <p>Email: admin@petua.local</p>
            <p>Пароль: Admin123!</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
