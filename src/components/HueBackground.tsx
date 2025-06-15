
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const HueBackground = () => {
  const isMobile = useIsMobile();
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

  useEffect(() => {
    // Disable mouse follow effect on mobile for performance.
    // The CSS blob animation will still run.
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, isMobile]);

  // Create parallax effects. The values determine how much each blob moves.
  const transformX1 = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 0], [-50, 50]);
  const transformY1 = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 0], [-50, 50]);

  const transformX2 = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 0], [30, -30]);
  const transformY2 = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 0], [30, -30]);

  const transformX3 = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 0], [-20, 20]);
  const transformY3 = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 0], [40, -40]);

  return (
    <div aria-hidden="true" className="fixed top-0 left-0 -z-50 h-screen w-screen overflow-hidden bg-background">
        <div className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2">
            <motion.div
                style={{ x: transformX1, y: transformY1 }}
                className="absolute -top-1/4 right-1/4 h-[60vw] w-[60vw] animate-blob rounded-full bg-primary/20 blur-3xl filter md:h-[40vw] md:w-[40vw] md:bg-primary/15"
            ></motion.div>
            <motion.div
                style={{ x: transformX2, y: transformY2, animationDelay: '2s' }}
                className="absolute bottom-1/4 left-1/4 h-[60vw] w-[60vw] animate-blob rounded-full bg-secondary/20 blur-3xl filter md:h-[40vw] md:w-[40vw] md:bg-secondary/15"
            ></motion.div>
            <motion.div
                style={{ x: transformX3, y: transformY3, animationDelay: '4s' }}
                className="absolute top-1/4 left-1/3 h-[60vw] w-[60vw] animate-blob rounded-full bg-accent/20 blur-3xl filter md:h-[40vw] md:w-[40vw] md:bg-accent/15"
            ></motion.div>
        </div>
    </div>
  );
};
  
export default HueBackground;
