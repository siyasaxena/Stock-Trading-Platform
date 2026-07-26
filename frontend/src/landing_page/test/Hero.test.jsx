import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Hero from "../../landing_page/home/Hero.jsx";

// test suite -> we can give individual or multiple test cases at the same time for the component
describe("Hero Componet", () => {
  test("renders hero image", () => {
    render(<Hero />);
    const heroimg = screen.getByAltText("hero image");
    expect(heroimg).toBeInTheDocument();
    expect(heroimg).toHaveAttribute("src", "/media/images/homeHero (1).png");
  });

  test("renders signup button", () => {
    render(<Hero />);
    const signupButton = screen.getByRole("button", { name: /signup now/i });
    expect(signupButton).toBeInTheDocument();
    expect(signupButton).toHaveClass("btn-primary");
  });
});
