import React from "react";

const AboutPage = () => {
  const images = [
    "https://img.freepik.com/free-photo/fashion-clothing-store-interior_23-2148888650.jpg",
    "https://img.freepik.com/free-photo/handsome-man-wearing-suit_144627-18691.jpg",
    "https://img.freepik.com/free-photo/smiling-woman-with-shopping-bags_329181-2700.jpg",
    "https://img.freepik.com/free-photo/elegant-woman-posing-white-coat_144627-17495.jpg",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12 tracking-tight">
          About Us
        </h1>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8">
            <p className="text-lg text-gray-800 leading-relaxed">
              Welcome to our fashion e-commerce platform! We are committed to
              bringing you the latest trends and styles from around the world.
            </p>
            <p className="text-lg text-gray-800 leading-relaxed">
              Our mission is to provide high-quality fashion items that cater to
              your unique style. Whether you're looking for casual wear, formal
              attire, or accessories, we've got you covered.
            </p>
            <p className="text-lg text-gray-800 leading-relaxed">
              Fashion is a form of self-expression, and we are here to help you
              express yourself with confidence.
            </p>
          </div>

          {/* Right Column - Image Grid */}
          {/* <div className="grid grid-cols-2 gap-6">
            {images.map((src, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl shadow-lg group"
              >
                <img
                  src={src}
                  alt={`Fashion Image ${index + 1}`}
                  className="w-full h-64 object-cover rounded-2xl transform scale-100 group-hover:scale-110 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-500"></div>
              </div>
            ))}
          </div> */}
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6LiV75nmsP4H5j9f0LJaZxX8XcvRNNEBIHw&s"
              alt="Fashion Image 1"
              className="w-full h-64 object-cover rounded-2xl transform scale-100 group-hover:scale-110 transition-all duration-500"
            />
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk7WWzbrJ9Kr8bpy7_oZHr8w48i3aozvJ3_A&s"
              alt="Fashion Image 2"
              className="w-full h-64 object-cover rounded-2xl transform scale-100 group-hover:scale-110 transition-all duration-500"
            />
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN6EJhWPfkQ8IroWMdc1U2p4I-Zw43aL5GHw&s"
              alt="Fashion Image 3"
              className="w-full h-64 object-cover rounded-2xl transform scale-100 group-hover:scale-110 transition-all duration-500"
            />
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCRDesVI9xJmUU-ppfWu6V1mHj3vF7GYA_CnFydsBkr9bQl6aviysiq1N6f4khbiMA0FI&usqp=CAU"
              alt="Fashion Image 4"
              className="w-full h-64 object-cover rounded-2xl transform scale-100 group-hover:scale-110 transition-all duration-500"
            />
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Fashion Community
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Stay updated with the latest trends and exclusive offers.
          </p>
          {/* <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 mb-6">
            Sign Up Now
          </button> */}
           <div className="pt-6 border-t border-gray-200">
            <p className="text-gray-700 mb-2">Have questions? Contact us at:</p>
            <div className="flex justify-center space-x-4">
              <a 
                href="mailto:info.ranter@gmail.com" 
                className="text-lg text-purple-600 hover:underline"
              >
                info.ranter@gmail.com
              </a>
              <span className="text-gray-400">|</span>
              <a 
                href="tel:9029297732" 
                className="text-lg text-purple-600 hover:underline"
              >
                9029297732
              </a>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
