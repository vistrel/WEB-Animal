import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <span className="brand-mark">🐾</span>
            <span className="brand-text">
              <strong>PetUA</strong>
              <small>Платформа домашніх тварин</small>
            </span>
          </Link>

          <p>
            Спеціалізована інформаційна система для вибору, розміщення оголошень
            та комунікації між продавцями і покупцями домашніх тварин.
          </p>
        </div>

        <nav className="footer-links">
          <Link to="/ads">Каталог</Link>
          <Link to="/about">Про сервіс</Link>
          <Link to="/rules">Правила</Link>
          <Link to="/contacts">Контакти</Link>
          <Link to="/privacy">Політика конфіденційності</Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
