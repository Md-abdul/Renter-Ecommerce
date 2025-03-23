import React from "react";
import Carousel from "react-elastic-carousel"; // Assuming you're using react-elastic-carousel

const RecommendedSlider = () => {
  const breakPoints = [
    { width: 1, itemsToShow: 1 },
    { width: 550, itemsToShow: 2, itemsToScroll: 2 },
    { width: 768, itemsToShow: 3 },
    { width: 1200, itemsToShow: 4 },
  ];

  const products = [
    {
      pic: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFHo9Fwj38HDkTenO474NmGW9xCpgHDfHg-g&s",
      price: "550",
      title: "Men's Slim Fit Jeans",
      description: "Comfortable and stylish jeans for men.",
      discount: "20% off",
      originalPrice: "700",
    },
    {
      pic: "https://5.imimg.com/data5/FL/SU/MY-13007104/womens-blue-jeans-500x500.jpg",
      price: "1,850",
      title: "Women's High-Waist Jeans",
      description: "Trendy high-waist jeans for women.",
      discount: "15% off",
      originalPrice: "2,200",
    },
    {
      pic: "https://5.imimg.com/data5/UI/DS/MY-14049601/kids-girls-faded-denim-jeans.jpg",
      price: "920",
      title: "Kids' Denim Jeans",
      description: "Durable comfortable jeans .",
      discount: "10% off",
      originalPrice: "1,000",
    },
    {
      pic: "https://5.imimg.com/data5/YB/XR/MY-23322128/men-s-jeans-500x500.jpg",
      price: "599",
      title: "Men's Regular Fit Jeans",
      description: "Classic regular-fit jeans for men.",
      discount: "25% off",
      originalPrice: "800",
    },
    {
      pic: "https://images.asos-media.com/products/topshop-hourglass-baggy-high-rise-jean-in-extreme-mid-blue/205680059-2?$n_640w$&wid=513&fit=constrain",
      price: "650",
      title: "Women's Skinny Jeans",
      description: "Stylish skinny jeans for women.",
      discount: "30% off",
      originalPrice: "900",
    },
    {
      pic: "https://hbindustries.pk/cdn/shop/files/boys-jeans-pants-elastic-waist-710315.webp?v=1722346135&width=1200",
      price: "499",
      title: "Kids' Stretchable Jeans",
      description: "Stretchable durable jeans for kids.",
      discount: "10% off",
      originalPrice: "550",
    },
    {
      pic: "https://media-photos.depop.com/b1/35972257/2003369956_fc0b897df16e4d80ad22306f36714894/P0.jpg",
      price: "563",
      title: "Men's Ripped Jeans",
      description: "Trendy ripped jeans for men.",
      discount: "20% off",
      originalPrice: "700",
    },
    {
      pic: "https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/E44047s5.jpg?im=Resize,width=750",
      price: "650",
      title: "Women's Bootcut Jeans",
      description: "Elegant bootcut jeans for women.",
      discount: "15% off",
      originalPrice: "750",
    },
    {
      pic: "https://images.meesho.com/images/products/238920940/ftujf_512.webp",
      price: "499",
      title: "Kids' Cargo Jeans",
      description: "Stylish cargo jeans for kids.",
      discount: "10% off",
      originalPrice: "550",
    },
    {
      pic: "https://img.freepik.com/free-photo/jeans_1203-8093.jpg",
      price: "563",
      title: "Men's Straight Fit Jeans",
      description: "Classic straight-fit jeans for men.",
      discount: "20% off",
      originalPrice: "700",
    },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-center my-8 mt-30">
        Explore Our Jeans Collection
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: "90%" }}>
          <Carousel
            breakPoints={breakPoints}
            itemsToShow={4}
            enableAutoPlay={true}
          >
            {products.map((product, index) => (
              <div key={index} className="px-2">
                <div
                  className="mx-auto mt-11 w-70 transform overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-lg duration-300 hover:scale-105 hover:shadow-xl"
                  style={{
                    margin: "0 10px", // Add margin between cards
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Add box shadow
                  }}
                >
                  <img
                    className="h-48 w-full object-cover object-center"
                    src={product.pic}
                    alt={product.title}
                  />
                  <div className="p-4">
                    <h2 className="mb-2 text-lg font-medium dark:text-white text-gray-900">
                      {product.title}
                    </h2>
                    <p className="mb-2 text-base dark:text-gray-300 text-gray-700">
                      {product.description}
                    </p>
                    <div className="flex items-center">
                      <p className="mr-2 text-lg font-semibold text-gray-900 dark:text-white">
                        ₹{product.price}
                      </p>
                      <p className="text-base font-medium text-gray-500 line-through dark:text-gray-300">
                        ₹{product.originalPrice}
                      </p>
                      <p className="ml-auto text-base font-medium text-yellow-400">
                        {product.discount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </>
  );
};

export default RecommendedSlider;
