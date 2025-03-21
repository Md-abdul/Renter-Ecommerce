import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingCart,
  Star,
} from "lucide-react";

const carouselSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1920",
    title: "Summer Collection 2025",
    subtitle: "Discover the latest trends in summer fashion",
  },
  {
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1920",
    title: "Luxury Essentials",
    subtitle: "Elevate your wardrobe with premium pieces",
  },
  {
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1920",
    title: "Autumn Styles",
    subtitle: "Get ready for the season change",
  },
];

const categories = [
  {
    name: "Top Wear",
    description: "T-Shirts, Shirts, Jackets & more",
    image:
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=600",
    subcategories: [
      "T-Shirts",
      "Casual Shirts",
      "Formal Shirts",
      "Jackets",
      "Sweaters",
    ],
  },
  {
    name: "Bottom Wear",
    description: "Jeans, Trousers, Shorts & more",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600",
    subcategories: [
      "Jeans",
      "Casual Trousers",
      "Formal Trousers",
      "Shorts",
      "Skirts",
    ],
  },
  {
    name: "Footwear",
    description: "Sneakers, Formal Shoes, Boots & more",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600",
    subcategories: [
      "Sneakers",
      "Formal Shoes",
      "Boots",
      "Sandals",
      "Sports Shoes",
    ],
  },
];

const products = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    price: 29.99,
    rating: 4.8,
    category: "Top Wear",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 2,
    name: "Slim Fit Denim Jeans",
    price: 79.99,
    rating: 4.9,
    category: "Bottom Wear",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 3,
    name: "Classic White Sneakers",
    price: 89.99,
    rating: 4.7,
    category: "Footwear",
    image:
      "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 4,
    name: "Casual Denim Jacket",
    price: 99.99,
    rating: 4.6,
    category: "Top Wear",
    image:
      "https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 5,
    name: "Leather Chelsea Boots",
    price: 149.99,
    rating: 4.8,
    category: "Footwear",
    image:
      "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 6,
    name: "Formal Business Shirt",
    price: 59.99,
    rating: 4.7,
    category: "Top Wear",
    image:
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 7,
    name: "Cargo Pants",
    price: 69.99,
    rating: 4.5,
    category: "Bottom Wear",
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 8,
    name: "Running Shoes",
    price: 119.99,
    rating: 4.9,
    category: "Footwear",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
  },
];

const ProductCard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Carousel */}
      <div className="relative h-[600px] overflow-hidden shadow-lg">
        {carouselSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide
                ? "translate-x-0"
                : index < currentSlide
                ? "-translate-x-full"
                : "translate-x-full"
            }`}
          >
            <div className="relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-6xl font-bold mb-4 text-yellow-400">
                    {slide.title}
                  </h2>
                  <p className="text-2xl mb-8 text-gray-100">
                    {slide.subtitle}
                  </p>
                  <button className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors shadow-lg">
                    Shop Collection
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-yellow-400 p-2 rounded-full hover:bg-yellow-300 transition-colors shadow-lg"
        >
          <ChevronLeft className="h-6 w-6 text-black" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-yellow-400 p-2 rounded-full hover:bg-yellow-300 transition-colors shadow-lg"
        >
          <ChevronRight className="h-6 w-6 text-black" />
        </button>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.name}
              className="group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative overflow-hidden rounded-xl mb-4">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="text-yellow-400 text-2xl font-semibold mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-200">{category.description}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((sub) => (
                    <span
                      key={sub}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-white py-16 shadow-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
            New Arrivals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                    Quick View
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center text-yellow-400 mb-1">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm ml-1">{product.rating}</span>
                      </div>
                      <span className="text-xl font-bold text-gray-800">
                        ${product.price}
                      </span>
                    </div>
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition-colors shadow-lg">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-black py-20 mt-6 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Stay in Style
          </h2>
          <p className="text-white mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get 10% off your first purchase plus
            stay up to date with the latest collections and exclusive offers.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg bg-gray-100 text-gray-800 placeholder-gray-400 border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button className="bg-yellow-400 text-black px-6 py-3 rounded-r-lg font-semibold hover:bg-yellow-300 transition-colors shadow-lg">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
