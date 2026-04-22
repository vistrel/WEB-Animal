import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useThemeStore } from "../../store/theme.store";

function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">🐾</span>
          <span className="brand-text">
            <strong>PetUA</strong>
            <small>Платформа домашніх тварин</small>
          </span>
        </Link>

        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Головна
          </NavLink>

          <NavLink
            to="/ads"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Каталог
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Про сервіс
          </NavLink>

          {user ? (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Профіль
            </NavLink>
          ) : null}
        </nav>

        <div className="menu-actions">
          <button type="button" className="theme-switch" onClick={toggleTheme}>
            {theme === "light" ? "Темна тема" : "Світла тема"}
          </button>

          {user ? (
            <>
              <div className="user-chip">
                <span className="user-chip-name">{user.fullName}</span>
              </div>
              <button
                type="button"
                className="button button-ghost"
                onClick={handleLogout}
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button button-ghost">
                Увійти
              </Link>
              <Link to="/register" className="button">
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
