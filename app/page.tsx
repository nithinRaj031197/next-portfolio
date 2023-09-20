import Navbar from "./components/Navbar";
import "./scss/index.scss";
import "./scss/globals.css";
import StyledLayout from "./components/StyledComponent";

export default function Home() {
  return (
    <>
      <StyledLayout />
      <Navbar />
    </>
  );
}
