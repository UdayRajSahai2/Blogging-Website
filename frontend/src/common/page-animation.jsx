import { motion } from "framer-motion";

const AnimationWrapper = ({
  children,
  keyValue,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  exit = { opacity: 0 }, // Added: Essential for smooth transitions
  transition = { duration: 1 },
  className,
}) => {
  return (
    <motion.div
      key={keyValue}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimationWrapper;
