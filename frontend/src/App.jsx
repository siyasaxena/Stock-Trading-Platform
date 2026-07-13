import "./App.css";
import HomePage from "./landing_page/home/HomePage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Signup from "./landing_page/signup/Signup";
import AboutPage from "./landing_page/about/AboutPage.jsx";
import ProductPage from "./landing_page/products/ProductPage.jsx";
import PricingPage from "./landing_page/pricing/PricingPage.jsx";
import SupportPage from "./landing_page/support/SupportPage.jsx";
import Navbar from "./landing_page/Navbar.jsx";
import Footer from "./landing_page/Footer.jsx";
import NotFound from "./landing_page/NotFound.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/signup" element={<Signup />} /> */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
