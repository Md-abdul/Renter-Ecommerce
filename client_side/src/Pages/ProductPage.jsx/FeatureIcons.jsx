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
      icon: <FaExchangeAlt size={24} />,
      label: "10-Day Returns & Exchange"
    },
    {
      icon: <FaMoneyBillAlt size={24} />,
      label: "Cash/Pay on Delivery"
    },
    {
      icon: <FaTruck size={24} />,
      label: "Free Delivery",
    },
    {
      icon: <FaTrophy size={24} />,
      label: "Top Brand",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-lg border border-yellow-400 shadow-lg">
      {features.map((feature, index) => (
        <div 
          key={index}
          className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300 hover:shadow-md hover:shadow-yellow-400/20 group"
        >
          <div className="bg-yellow-400 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
            {React.cloneElement(feature.icon, { className: "text-black" })}
          </div>
          <div>
            <p className="font-bold text-black-400 mb-1">{feature.label}</p>
            {/* <p className="text-sm text-gray-300">{feature.description}</p> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureIcons;