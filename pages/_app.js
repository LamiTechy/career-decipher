import "../styles/globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
          },
          success: {
            style: { background: "#E8A736", color: "white" },
            iconTheme: { primary: "white", secondary: "#E8A736" },
          },
          error: {
            style: { background: "#c0392b", color: "white" },
          },
        }}
      />
    </>
  );
}
