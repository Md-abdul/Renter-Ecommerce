import React from "react";
import {
  FaExchangeAlt,
  FaMoneyBillAlt,
  FaTruck,
  FaTrophy,
} from "react-icons/fa";

const FeatureIcons = () => {
  const features = [
    {
      icon: <FaExchangeAlt size={18} />,
      label: "10-Day Returns & Exchange"
    },
    {
      icon: <FaMoneyBillAlt size={18} />,
      label: "Cash/Pay on Delivery"
    },
    {
      icon: <FaTruck size={18} />,
      label: "Free Delivery",
    },
    {
      icon: <FaTrophy size={18} />,
      label: "Top Brand",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1 rounded-lg">
      {features.map((feature, index) => (
        <div 
          key={index}
          className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-50 transition-all duration-300 hover:shadow-md hover:shadow-yellow-400/20 group"
        >
          <div className="p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
            {React.cloneElement(feature.icon, { className: "text-black" })}
          </div>
          <div>
            <p className="test-sm text-black-400 mb-1">{feature.label}</p>
            {/* <p className="text-sm text-gray-300">{feature.description}</p> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureIcons;