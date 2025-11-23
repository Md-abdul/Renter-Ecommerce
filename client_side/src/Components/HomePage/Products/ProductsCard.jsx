import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import mensBanner from "../../../assets/mens banners.png";
import mensBanner1 from "../../../assets/banner-jens1.webp";
const carouselSlides = [
  {
    image: mensBanner,
    title: "Summer Collection 2025",
    subtitle: "Discover the latest trends in summer fashion",
  },
  {
    image: mensBanner1,
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
    <div className=" bg-gray-50">
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
                  <Link to={"/mens"}>
                    <button className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors shadow-lg cursor-pointer">
                      Shop Collection
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-yellow-400 p-2 rounded-full hover:bg-yellow-300 transition-colors shadow-lg cursor-pointer"
        >
          <ChevronLeft className="h-6 w-6 text-black" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-yellow-400 p-2 rounded-full hover:bg-yellow-300 transition-colors shadow-lg cursor-pointer"
        >
          <ChevronRight className="h-6 w-6 text-black" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
