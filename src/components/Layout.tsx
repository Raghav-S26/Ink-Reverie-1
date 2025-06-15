
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import HueBackground from "./HueBackground";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <HueBackground />
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
