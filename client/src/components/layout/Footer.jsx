import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <h3>PetUA</h3>
          <p>
            Спеціалізована платформа для вибору, пошуку та розміщення оголошень
            про домашніх тварин.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/">Головна</Link>
          <Link to="/ads">Каталог</Link>
          <Link to="/about">Про сервіс</Link>
          <Link to="/login">Увійти</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
