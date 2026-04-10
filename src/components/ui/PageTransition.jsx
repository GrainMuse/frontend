import { motion } from "framer-motion";

const VARIANTS = {
  fade: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1], delay: 0.05 },
    },
    exit: { opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
  },
  slideUp: {
    initial: { opacity: 0, y: 24 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 },
    },
    exit: {
      opacity: 0,
      y: -12,
      transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
    },
  },
  scale: {
    initial: { opacity: 0, scale: 0.97 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1], delay: 0.06 },
    },
    exit: {
      opacity: 0,
      scale: 1.01,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
    },
  },
};

export default function PageTransition({ children, variant = "slideUp" }) {
  const v = VARIANTS[variant] ?? VARIANTS.slideUp;
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={v}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
