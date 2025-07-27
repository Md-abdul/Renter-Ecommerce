import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ProductForm = ({
  product,
  setProducts,
  products,
  onClose,
  onProductUpdate,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    basePrice: 0,
    category: "mens",
    wearCategory: "top",
    sku: "",
    discount: 0,
    colors: [
      {
        name: "",
        hexCode: "#000000",
        priceAdjustment: 0,
        images: {
          main: "",
          gallery: [""],
        },
        sizes: [
          {
            size: "",
            priceAdjustment: 0,
            quantity: 0,
          },
        ],
      },
    ],
  });

  // Get size options based on category and wear type
  const getSizeOptions = () => {
    const { category, wearCategory } = formData;

    if (category === "kids") {
      return [
        "0-6 months",
        "6-12 months",
        "1-2 years",
        "2-4 years",
        "4-6 years",
        "6-8 years",
        "8-10 years",
        "10-12 years",
        "12-14 years",
        "14-16 years",
      ];
    }

    if (wearCategory === "top") {
      return ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
    }

    if (category === "womens" && wearCategory === "bottom") {
      return Array.from({ length: 13 }, (_, i) => (26 + i).toString());
    }

    // Default for mens bottom
    return Array.from({ length: 21 }, (_, i) => (28 + i).toString());
  };

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        summary: product.summary || "",
        basePrice: product.basePrice || 0,
        category: product.category || "mens",
        wearCategory: product.wearCategory || "top",
        sku: product.sku || "",
        discount: product.discount || 0,
        colors: product.colors
          ? product.colors.map((color) => ({
              name: color.name || "",
              hexCode: color.hexCode || "#000000",
              priceAdjustment: color.priceAdjustment || 0,
              images: {
                main: color.images?.main || "",
                gallery: color.images?.gallery || [""],
              },
              sizes: color.sizes
                ? color.sizes.map((size) => ({
                    size: size.size || getSizeOptions()[0] || "",
                    priceAdjustment: size.priceAdjustment || 0,
                    quantity: size.quantity || 0,
                  }))
                : [
                    {
                      size: getSizeOptions()[0] || "",
                      priceAdjustment: 0,
                      quantity: 0,
                    },
                  ],
            }))
          : [
              {
                name: "",
                hexCode: "#000000",
                priceAdjustment: 0,
                images: {
                  main: "",
                  gallery: [""],
                },
                sizes: [
                  {
                    size: getSizeOptions()[0] || "",
                    priceAdjustment: 0,
                    quantity: 0,
                  },
                ],
              },
            ],
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index][field] = value;
    setFormData({
      ...formData,
      colors: newColors,
    });
  };

  const handleColorImageChange = (colorIndex, field, value) => {
    const newColors = [...formData.colors];
    newColors[colorIndex].images[field] = value;
    setFormData({
      ...formData,
      colors: newColors,
    });
  };

  const handleSizeChange = (colorIndex, sizeIndex, field, value) => {
    const newColors = [...formData.colors];
    newColors[colorIndex].sizes[sizeIndex][field] = value;
    setFormData({
      ...formData,
      colors: newColors,
    });
  };

  const addColor = () => {
    setFormData({
      ...formData,
      colors: [
        ...formData.colors,
        {
          name: "",
          hexCode: "#000000",
          priceAdjustment: 0,
          images: {
            main: "",
            gallery: [""],
          },
          sizes: [
            {
              size: getSizeOptions()[0] || "",
              priceAdjustment: 0,
              quantity: 0,
            },
          ],
        },
      ],
    });
  };

  const removeColor = (index) => {
    const newColors = [...formData.colors];
    newColors.splice(index, 1);
    setFormData({
      ...formData,
      colors: newColors,
    });
  };

  const addSize = (colorIndex) => {
    const newColors = [...formData.colors];
    newColors[colorIndex].sizes.push({
      size: getSizeOptions()[0] || "",
      priceAdjustment: 0,
      quantity: 0,
    });
    setFormData({
      ...formData,
      colors: newColors,
    });
  };

  const removeSize = (colorIndex, sizeIndex) => {
    const newColors = [...formData.colors];
    newColors[colorIndex].sizes.splice(sizeIndex, 1);
    setFormData({
      ...formData,
      colors: newColors,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = product ? "PUT" : "POST";
      const url = product
        ? `https://renter-ecommerce.vercel.app/api/products/${product._id}`
        : "https://renter-ecommerce.vercel.app/api/products";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        if (product) {
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p._id === updatedProduct._id ? updatedProduct : p
            )
          );
          toast.success("Product updated successfully");
        } else {
          setProducts((prevProducts) => [...prevProducts, updatedProduct]);
          toast.success("Product added successfully");
        }
        onClose();
        if (onProductUpdate) {
          await onProductUpdate();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.message);
    }
  };

  // Prevent number input scroll
  const handleNumberInput = (e) => {
    e.target.blur();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed transition-opacity" aria-hidden="true">
          <div
            className="absolute bg-gray-500 opacity-75"
            onClick={onClose}
          ></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {product ? "Edit Product" : "Add New Product"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    SKU*
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Base Price*
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category*
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="mens">Men's</option>
                    <option value="womens">Women's</option>
                    <option value="kids">Kids</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Wear Type*
                  </label>
                  <select
                    name="wearCategory"
                    value={formData.wearCategory}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Summary
                </label>
                <textarea
                  name="summary"
                  value={formData.summary || ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Colors Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-medium text-gray-900">Colors</h4>
                  <button
                    type="button"
                    onClick={addColor}
                    className="text-sm text-yellow-600 hover:text-yellow-800"
                  >
                    + Add Color
                  </button>
                </div>
                {formData.colors.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="border border-gray-200 rounded-lg p-4 mb-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Color Name*
                        </label>
                        <input
                          type="text"
                          value={color.name}
                          onChange={(e) =>
                            handleColorChange(
                              colorIndex,
                              "name",
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Hex Code*
                        </label>
                        <div className="flex items-center">
                          <input
                            type="color"
                            value={color.hexCode}
                            onChange={(e) =>
                              handleColorChange(
                                colorIndex,
                                "hexCode",
                                e.target.value
                              )
                            }
                            className="h-10 w-10 rounded border border-gray-300 mr-2"
                          />
                          <input
                            type="text"
                            value={color.hexCode}
                            onChange={(e) =>
                              handleColorChange(
                                colorIndex,
                                "hexCode",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price Adjustment
                        </label>
                        <input
                          type="number"
                          value={color.priceAdjustment}
                          onChange={(e) =>
                            handleColorChange(
                              colorIndex,
                              "priceAdjustment",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Main Image URL*
                        </label>
                        <input
                          type="text"
                          value={color.images.main}
                          onChange={(e) =>
                            handleColorImageChange(
                              colorIndex,
                              "main",
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Gallery Images
                        </label>
                        {color.images.gallery.map((image, imageIndex) => (
                          <div key={imageIndex} className="flex mb-2">
                            <input
                              type="text"
                              value={image}
                              onChange={(e) => {
                                const newColors = [...formData.colors];
                                newColors[colorIndex].images.gallery[
                                  imageIndex
                                ] = e.target.value;
                                setFormData({
                                  ...formData,
                                  colors: newColors,
                                });
                              }}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder={`Image ${imageIndex + 1} URL`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newColors = [...formData.colors];
                                newColors[colorIndex].images.gallery.splice(
                                  imageIndex,
                                  1
                                );
                                setFormData({
                                  ...formData,
                                  colors: newColors,
                                });
                              }}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newColors = [...formData.colors];
                            newColors[colorIndex].images.gallery.push("");
                            setFormData({
                              ...formData,
                              colors: newColors,
                            });
                          }}
                          className="text-sm text-yellow-600 hover:text-yellow-800"
                        >
                          + Add Gallery Image
                        </button>
                      </div>
                    </div>

                    {/* Sizes Section for this color */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-md font-medium text-gray-900">
                          Sizes for {color.name || "this color"}
                        </h4>
                        <button
                          type="button"
                          onClick={() => addSize(colorIndex)}
                          className="text-sm text-yellow-600 hover:text-yellow-800"
                        >
                          + Add Size
                        </button>
                      </div>
                      {color.sizes.map((size, sizeIndex) => (
                        <div
                          key={sizeIndex}
                          className="border border-gray-200 rounded-lg p-4 mb-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Size*
                              </label>
                              <select
                                value={size.size}
                                onChange={(e) =>
                                  handleSizeChange(
                                    colorIndex,
                                    sizeIndex,
                                    "size",
                                    e.target.value
                                  )
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                required
                              >
                                <option value="">-- Select size --</option>
                                {getSizeOptions().map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Price Adjustment
                              </label>
                              <input
                                type="number"
                                value={size.priceAdjustment}
                                onChange={(e) =>
                                  handleSizeChange(
                                    colorIndex,
                                    sizeIndex,
                                    "priceAdjustment",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                step="0.01"
                                onWheel={handleNumberInput}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Quantity*
                              </label>
                              <input
                                type="number"
                                value={size.quantity}
                                onChange={(e) =>
                                  handleSizeChange(
                                    colorIndex,
                                    sizeIndex,
                                    "quantity",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                required
                                min="0"
                                onWheel={handleNumberInput}
                              />
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeSize(colorIndex, sizeIndex)}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remove Size
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeColor(colorIndex)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Color
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-600 cursor-pointer"
                >
                  {product ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
