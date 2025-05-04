// AutoSlider.jsx

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const AutoSlider = () => {
  const sliderContent = [
    {
      title: "Summer Sale",
      description: "Up To 50% Off",
      buttonText: "Shop Now",
    },
    {
      title: "Winter Clearance",
      description: "Everything Must Go!",
      buttonText: "Clearance Sale",
    },
    {
      title: "Back to School",
      description: "Save Big on Textbooks",
      buttonText: "Shop Now",
    },
  ];
  const settings = {
    dots: false,
    infinite: true,
    speed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <Slider {...settings}>
      {sliderContent.map((item, index) => (
        <div key={index} className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            {item.title}
          </h2>
          <p className="text-xl text-black mb-8">{item.description}</p>
          <button className="bg-black text-yellow-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">
            {item.buttonText}
          </button>
        </div>
      ))}
    </Slider>
  );
};

export default AutoSlider;
