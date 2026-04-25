import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useThemeStore } from "../../store/theme.store";
import { useChatStore } from "../../store/chat.store";

function Header() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const totalUnread = useChatStore((state) => state.totalUnread);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const canModerate = user?.role === "MODERATOR" || user?.role === "ADMIN";

  useEffect(() => {
    function handleDocumentClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    await logout();
    setIsUserMenuOpen(false);
    navigate("/");
  }

  function closeMenu() {
    setIsUserMenuOpen(false);
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

          {canModerate ? (
            <NavLink
              to="/moderation"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Модерація
            </NavLink>
          ) : null}
        </nav>

        <div className="menu-actions">
          <button
            type="button"
            className="theme-switch theme-switch-icon"
            onClick={toggleTheme}
            aria-label="Перемкнути тему"
            title="Перемкнути тему"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {user ? (
            <>
              <Link to="/create-ad" className="button">
                Додати оголошення
              </Link>

              <div className="user-menu" ref={menuRef}>
                <button
                  type="button"
                  className="user-chip user-chip-button"
                  onClick={() => setIsUserMenuOpen((value) => !value)}
                  aria-expanded={isUserMenuOpen}
                >
                  <span className="user-chip-name">{user.fullName}</span>
                  {totalUnread > 0 ? (
                    <span className="header-unread-badge">
                      {totalUnread > 9 ? "9+" : totalUnread}
                    </span>
                  ) : null}
                  <span className="user-chip-arrow">▾</span>
                </button>

                {isUserMenuOpen ? (
                  <div className="user-dropdown">
                    <Link to="/profile" onClick={closeMenu}>
                      Профіль
                    </Link>

                    <Link to="/favorites" onClick={closeMenu}>
                      Обране
                    </Link>

                    <Link
                      to="/messages"
                      onClick={closeMenu}
                      className="dropdown-link-with-badge"
                    >
                      <span>Повідомлення</span>
                      {totalUnread > 0 ? (
                        <strong>
                          {totalUnread > 99 ? "99+" : totalUnread}
                        </strong>
                      ) : null}
                    </Link>

                    {canModerate ? (
                      <Link to="/moderation" onClick={closeMenu}>
                        Модерація
                      </Link>
                    ) : null}

                    <Link to="/create-ad" onClick={closeMenu}>
                      Додати оголошення
                    </Link>

                    <button type="button" onClick={handleLogout}>
                      Вийти
                    </button>
                  </div>
                ) : null}
              </div>
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
