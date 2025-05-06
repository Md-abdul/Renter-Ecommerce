import React, { useState, useEffect } from "react";
import ProductCard from "./HomePage/Products/ProductsCard";
import downloadedImg from "./backround_removed_product.png";
import { Link } from "react-router-dom";
import OfferSlider from "./HomePage/OfferSlider";
import FAQComponent from "./HomePage/FAQComponent";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

const HomePage = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 31,
    hours: 29,
    minutes: 56,
    seconds: 13,
  });

  // RGB Animation State
  const [rgbIndex, setRgbIndex] = useState(0);
  const rgbColors = [
    "rgba(255, 0, 0, 0.1)",
    "rgba(0, 255, 0, 0.1)",
    "rgba(0, 0, 255, 0.1)",
    "rgba(255, 255, 0, 0.1)",
    "rgba(0, 255, 255, 0.1)",
    "rgba(255, 0, 255, 0.1)",
  ];

  // Animated gradient background state
  const [gradientPos, setGradientPos] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const { days, hours, minutes, seconds } = prevTime;

        let newSeconds = seconds - 1;
        let newMinutes = minutes;
        let newHours = hours;
        let newDays = days;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }

        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }

        if (newHours < 0) {
          newHours = 23;
          newDays -= 1;
        }

        return {
          days: newDays,
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds,
        };
      });
    }, 1000);

    // RGB Animation interval
    const rgbInterval = setInterval(() => {
      setRgbIndex((prev) => (prev + 1) % rgbColors.length);
    }, 3000);

    // Gradient animation
    const gradientInterval = setInterval(() => {
      setGradientPos((prev) => (prev + 1) % 100);
    }, 50);

    return () => {
      clearInterval(timer);
      clearInterval(rgbInterval);
      clearInterval(gradientInterval);
    };
  }, []);

  // Animation variants
  const slideInLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Custom hook for staggered animations
  const useStaggeredAnimation = (delay = 0.1) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

    useEffect(() => {
      if (inView) {
        controls.start("visible");
      }
    }, [controls, inView]);

    return {
      ref,
      initial: "hidden",
      animate: controls,
      variants: {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay, ease: "easeOut" },
        },
      },
    };
  };

  return (
    <div className="home-page overflow-hidden">
      {/* Hero Section with RGB Animation */}

      {/* Featured Products */}
      <motion.section
        className="py-10  bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
      >
        <motion.div
          // className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          {...useStaggeredAnimation(0.2)}
        >
          <ProductCard />
        </motion.div>
      </motion.section>

      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          background: `linear-gradient(45deg, ${rgbColors[rgbIndex]}, ${
            rgbColors[(rgbIndex + 2) % rgbColors.length]
          })`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleUp}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Discover Your Style
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Explore our premium collection of fashion that blends comfort with
              elegance
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                to="/shop"
                className="px-8 py-3 bg-black text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Shop Now
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating animated elements */}
        <motion.div
          className="absolute top-20 left-10 w-16 h-16 rounded-full bg-pink-300 opacity-20"
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-20 w-24 h-24 rounded-full bg-purple-300 opacity-20"
          animate={{
            y: [0, -40, 0],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.section>

      {/* Shop by Category */}
      <motion.section
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...useStaggeredAnimation()}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-yellow-400 max-w-2xl mx-auto">
              Discover our carefully curated collections for every style and
              occasion
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto mt-4"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Men's Fashion",
                image:
                  "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=600",
                link: "/mens",
                bgGradient: "",
              },
              {
                name: "Women's Fashion",
                image:
                  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
                link: "/womens",
                bgGradient: "",
              },
              {
                name: "Kids & Babies",
                image:
                  "https://littlestepsasia.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2024/01/08075312/Best-Kids-Clothing-Shops-And-Brands-In-Hong-Kong-scaled.jpg",
                link: "/kids",
                bgGradient: "",
              },
            ].map((category, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={index % 2 === 0 ? slideInLeft : slideInRight}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <Link to={category.link}>
                  <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-80">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-b ${category.bgGradient} opacity-70`}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-3xl font-bold text-yellow-300 px-6 py-2 rounded-lg transform translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
                        {category.name}
                      </h3>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-black text-white rounded-full text-sm font-semibold"
                      >
                        Shop Now
                      </motion.button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Deal of the Week with Animated Gradient */}
      <motion.section
        className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${gradientPos}deg, #f3e8ff, #e0f2fe, #ecfdf5)`,
            backgroundSize: "300% 300%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            animation: "gradient 15s ease infinite",
          }}
        ></motion.div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="lg:w-1/2 text-center lg:text-left"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInLeft}
            >
              <h2 className="text-sm font-semibold tracking-widest text-gray-500 mb-2">
                LIMITED TIME OFFER
              </h2>
              <h3 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Deal of the Week
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Get our spring collection with exclusive discounts before time
                runs out!
              </p>

              <div className="mb-10">
                <div className="flex justify-center lg:justify-start gap-4 mb-4">
                  {["Days", "Hours", "Minutes", "Seconds"].map((label, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold bg-white rounded-lg p-3 min-w-[70px] shadow">
                        {Object.values(timeLeft)[i].toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-black text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Shop the Deal
              </motion.button>
            </motion.div>

            <motion.div
              className="lg:w-1/2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInRight}
            >
              <div className="relative">
                <img
                  src={downloadedImg}
                  alt="Spring Collection"
                  className="w-full max-w-lg mx-auto rounded-xl shadow-1xl transform rotate-1 hover:rotate-0 transition-transform duration-500"
                />
                <motion.div
                  className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-2xl font-bold text-pink-600">
                    50% OFF
                  </div>
                  <div className="text-xs text-gray-500">Selected Items</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Special Offers Carousel */}
      <motion.section
        className="py-16 mb-10 mt-10 bg-gray-900 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-12xl mx-auto">
          <motion.div
            className="text-center mb-12"
            {...useStaggeredAnimation()}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Special Offers
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto"></div>
          </motion.div>

          <motion.div className="mt-10" {...useStaggeredAnimation(0.2)}>
            <OfferSlider />
          </motion.div>
        </div>
      </motion.section>

      {/* Promotional Banner with Parallax Effect */}
      <motion.section
        className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)",
          }}
        />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Summer Sale Up To 50% Off
          </motion.h2>
          <motion.p
            className="text-xl text-white mb-8"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Limited time offer on selected items. Don't miss out!
          </motion.p>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.button
              className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05, backgroundColor: "#f0f0f0" }}
              whileTap={{ scale: 0.95 }}
            >
              Shop the Sale
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Collections */}
      <motion.section
        className="py-16 px-4 sm:px-6 lg:px-8 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...useStaggeredAnimation()}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Collections
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              className="relative h-96 overflow-hidden group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInLeft}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url(https://i.pinimg.com/736x/58/46/a4/5846a416fa608dc63335e27753ccfa02.jpg)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end p-8">
                <div className="text-white">
                  <motion.div
                    className="text-sm font-semibold mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    STARTING AT ₹149
                  </motion.div>
                  <motion.h3
                    className="text-2xl md:text-3xl font-bold mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    Men's Wear Collection
                  </motion.h3>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-white text-black rounded-full text-sm font-semibold"
                    >
                      Explore Collection
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative h-96 overflow-hidden group"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInRight}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105"
                style={{
                  backgroundImage:
                    "url(https://i.pinimg.com/236x/62/75/84/627584cef629e2d131529ee76d039b41.jpg)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end p-8">
                <div className="text-white">
                  <motion.div
                    className="text-sm font-semibold mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    STARTING AT ₹149
                  </motion.div>
                  <motion.h3
                    className="text-2xl md:text-3xl font-bold mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    Women's Wear Collection
                  </motion.h3>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-white text-black rounded-full text-sm font-semibold"
                    >
                      Explore Collection
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...useStaggeredAnimation()}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our products and services
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto mt-4"></div>
          </motion.div>

          <motion.div {...useStaggeredAnimation(0.1)}>
            <FAQComponent />
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
