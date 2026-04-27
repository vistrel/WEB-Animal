import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import PawCursor from "../components/effects/PawCursor";
import ScrollToTop from "../components/common/ScrollToTop";

function MainLayout() {
  return (
    <>
      <ScrollToTop />
      <PawCursor />
      <Header />

      <main className="site-main">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default MainLayout;
