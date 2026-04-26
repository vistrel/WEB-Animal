import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useThemeStore } from "../../store/theme.store";
import { useChatStore } from "../../store/chat.store";
import { useUxStore } from "../../store/ux.store";

function Header() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const totalUnread = useChatStore((state) => state.totalUnread);

  const soundEnabled = useUxStore((state) => state.soundEnabled);
  const pawEffectEnabled = useUxStore((state) => state.pawEffectEnabled);
  const toggleSound = useUxStore((state) => state.toggleSound);
  const togglePawEffect = useUxStore((state) => state.togglePawEffect);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const canModerate = user?.role === "MODERATOR" || user?.role === "ADMIN";
  const canAdmin = user?.role === "ADMIN";

  useEffect(() => {
    function handleDocumentClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
    navigate("/");
  }

  function closeMenus() {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" onClick={closeMenus}>
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

          {canAdmin ? (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Адмін-панель
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
                    <Link to="/profile" onClick={closeMenus}>
                      Профіль
                    </Link>

                    <Link to="/favorites" onClick={closeMenus}>
                      Обране
                    </Link>

                    <Link
                      to="/messages"
                      onClick={closeMenus}
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
                      <Link to="/moderation" onClick={closeMenus}>
                        Модерація
                      </Link>
                    ) : null}

                    {canAdmin ? (
                      <Link to="/admin" onClick={closeMenus}>
                        Адмін-панель
                      </Link>
                    ) : null}

                    <Link to="/create-ad" onClick={closeMenus}>
                      Додати оголошення
                    </Link>

                    <button type="button" onClick={toggleSound}>
                      {soundEnabled ? "Вимкнути звук" : "Увімкнути звук"}
                    </button>

                    <button type="button" onClick={togglePawEffect}>
                      {pawEffectEnabled ? "Вимкнути лапки" : "Увімкнути лапки"}
                    </button>

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

        <button
          type="button"
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          aria-label="Відкрити меню"
          aria-expanded={isMobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className="mobile-header-panel">
          <div className="container mobile-header-inner">
            <Link to="/ads" onClick={closeMenus}>
              Каталог
            </Link>

            <Link to="/about" onClick={closeMenus}>
              Про сервіс
            </Link>

            <Link to="/rules" onClick={closeMenus}>
              Правила
            </Link>

            <Link to="/contacts" onClick={closeMenus}>
              Контакти
            </Link>

            {user ? (
              <>
                <Link to="/create-ad" onClick={closeMenus}>
                  Додати оголошення
                </Link>

                <Link to="/profile" onClick={closeMenus}>
                  Профіль
                </Link>

                <Link to="/favorites" onClick={closeMenus}>
                  Обране
                </Link>

                <Link to="/messages" onClick={closeMenus}>
                  Повідомлення {totalUnread > 0 ? `(${totalUnread})` : ""}
                </Link>

                {canModerate ? (
                  <Link to="/moderation" onClick={closeMenus}>
                    Модерація
                  </Link>
                ) : null}

                {canAdmin ? (
                  <Link to="/admin" onClick={closeMenus}>
                    Адмін-панель
                  </Link>
                ) : null}

                <button type="button" onClick={toggleTheme}>
                  {theme === "light" ? "Темна тема 🌙" : "Світла тема ☀️"}
                </button>

                <button type="button" onClick={toggleSound}>
                  {soundEnabled ? "Вимкнути звук" : "Увімкнути звук"}
                </button>

                <button type="button" onClick={togglePawEffect}>
                  {pawEffectEnabled ? "Вимкнути лапки" : "Увімкнути лапки"}
                </button>

                <button type="button" onClick={handleLogout}>
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenus}>
                  Увійти
                </Link>

                <Link to="/register" onClick={closeMenus}>
                  Реєстрація
                </Link>

                <button type="button" onClick={toggleTheme}>
                  {theme === "light" ? "Темна тема 🌙" : "Світла тема ☀️"}
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Header;
