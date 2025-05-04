import React, { useEffect, useRef } from "react";

const OfferSlider = () => {
  const offers = [
    "🔥 50% OFF on all electronics - Limited time offer!",
    "🎉 Free shipping on orders over $50!",
    "💎 Buy 1 Get 1 Free on selected items!",
    "🛒 Special weekend sale - Extra 20% off!",
    "🚚 Same day delivery available in metro areas!",
  ];

  const sliderRef = useRef(null);
  const sliderContentRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    const content = sliderContentRef.current;
    // Clone the content for seamless looping
    content.innerHTML += content.innerHTML;
    let animationId;
    let position = 0;
    const speed = 1; // Adjust speed as needed

    const animate = () => {
      position -= speed;
      // Reset position when half of the content has scrolled
      if (position <= -content.scrollWidth / 2) {
        position = 0;
      }
      content.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-black to-black py-4 px-5 shadow-md">
      <div className="max-w-12xl mx-auto flex items-center">
        
        <div ref={sliderRef} className="overflow-hidden flex-grow relative">
          <div
            ref={sliderContentRef}
            className="flex whitespace-nowrap text-yellow-400 font-medium"
          >
            {offers.map((offer, index) => (
              <div key={index} className="inline-block px-6">
                {offer}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferSlider;
