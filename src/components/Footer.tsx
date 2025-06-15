const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500">
        <p>&copy; {currentYear} Ink Reverie. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-brand-indigo">Privacy Policy</a>
            <a href="#" className="hover:text-brand-indigo">Terms of Service</a>
            <a href="#" className="hover:text-brand-indigo">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
