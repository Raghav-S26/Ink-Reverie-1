
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-transparent border-t border-foreground/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {currentYear} Ink Reverie. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
