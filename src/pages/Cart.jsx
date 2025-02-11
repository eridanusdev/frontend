import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import InfoMessage from "../components/InfoComponent";
import { AdvancedImage } from "@cloudinary/react";
import { scale } from "@cloudinary/url-gen/actions/resize";
import axios from "axios";
import toast from "react-hot-toast";

export default function Cart() {
  const {
    getUserCart,
    backendUrl,
    currency,
    cartItems,
    updateQuantity,
    navigate,
    setCartProducts,
    setDelivery,
    cartProducts,
    cloudinary,
  } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    const fetchUserCartData = async () => {
      setDelivery({ price: 0, method: "" });
      await getUserCart();
    };

    fetchUserCartData();
  }, []);

  const getProductsData = async (filters) => {
    try {
      // Convert filters to URL parameters
      let queryParams = new URLSearchParams(filters).toString();

      const response = await axios.post(
        `${backendUrl}/api/product/list?${queryParams}`,
        {
          fields: ["name", "price", "image", "description"],
        }
      );

      if (response.data.success) {
        setCartProducts(response.data.products);

        // Process cart data
        const tempData = [];
        for (const items in cartItems) {
          for (const item in cartItems[items]) {
            if (cartItems[items][item] > 0) {
              tempData.push({
                _id: items,
                size: item,
                quantity: cartItems[items][item],
              });
            }
          }
        }

        setCartData(tempData);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error.message);
      toast.error("Failed to fetch product data.");
    }
  };

  useEffect(() => {
    if (cartItems && Object.keys(cartItems).length > 0) {
      const productIDs = Object.keys(cartItems);

      const filters = {
        ids: productIDs.join(","),
      };

      getProductsData(filters);
    }
  }, [cartItems]);

  useEffect(() => {
    if (cartProducts.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }

      setCartData(tempData);
    }
  }, [cartItems, cartProducts]);

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} tex2={"CART"} />
      </div>

      {cartData.length === 0 ? (
        <div className="flex justify-center items-center">
          <InfoMessage
            title={"Nothing Here!"}
            message={"Please add some items to the cart"}
          />
        </div>
      ) : (
        <>
          <div className="">
            {cartProducts.length > 0 &&
              cartData.map((item, index) => {
                const productData = cartProducts.find(
                  (product) => product._id === item._id
                );

                if (!productData) {
                  return null; // Skip rendering if productData is undefined
                }

                const publicId = productData.image?.[0]
                  ?.split("/")
                  ?.slice(-2)
                  ?.join("/")
                  ?.split(".")[0];

                if (!publicId) {
                  return null; // Skip if image processing fails
                }

                const processedImage = cloudinary
                  .image(publicId)
                  .format("auto")
                  .quality("auto")
                  .resize(scale().width(100));

                return (
                  <div
                    key={index}
                    className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
                  >
                    <div className="flex items-start gap-6">
                      <AdvancedImage
                        className="w-16 sm:w-20 rounded-md"
                        cldImg={processedImage}
                        alt=""
                      />
                      <div className="">
                        <p className="text-sm sm:text-lg font-medium font-yantramanav">
                          {productData.name}
                        </p>
                        <div className="flex items-center gap-5 mt-2 font-imprima">
                          <p className="">
                            {currency}
                            {productData.price}
                          </p>
                          <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50 font-imprima">
                            {item.size}
                          </p>
                        </div>
                      </div>
                    </div>
                    <input
                      onChange={(e) =>
                        e.target.value === "" || e.target.value === "0"
                          ? null
                          : updateQuantity(
                              item._id,
                              item.size,
                              Number(e.target.value)
                            )
                      }
                      min={1}
                      type="number"
                      className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                      defaultValue={item.quantity}
                    />
                    <img
                      onClick={() => updateQuantity(item._id, item.size, 0)}
                      src={assets.bin_icon}
                      className="w-4 mr-4 sm:w-5 cursor-pointer"
                      alt=""
                    />
                  </div>
                );
              })}
          </div>
        </>
      )}

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal cartItems={cartItems} pr={cartProducts} />
          <div className="w-full text-end">
            <button
              disabled={cartData.length === 0}
              onClick={() => navigate("/placeorder")}
              className="bg-black text-white text-sm my-8 px-8 py-3 font-yantramanav"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
