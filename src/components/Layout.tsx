
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import UserNav from "./UserNav";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4 -mt-2">
            <UserNav />
        </div>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
