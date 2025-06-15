
const HueBackground = () => {
  return (
    <div aria-hidden="true" className="fixed top-0 left-0 -z-50 h-screen w-screen overflow-hidden bg-background">
        <div className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2">
            <div
                className="absolute -top-1/4 right-1/4 h-[30vw] w-[30vw] animate-blob rounded-full bg-primary/10 blur-3xl filter"
            ></div>
            <div
                style={{ animationDelay: '2s' }}
                className="absolute bottom-1/4 left-1/4 h-[30vw] w-[30vw] animate-blob rounded-full bg-secondary/10 blur-3xl filter"
            ></div>
            <div
                style={{ animationDelay: '4s' }}
                className="absolute top-1/4 left-1/3 h-[30vw] w-[30vw] animate-blob rounded-full bg-accent/10 blur-3xl filter"
            ></div>
        </div>
    </div>
  );
};
  
export default HueBackground;
