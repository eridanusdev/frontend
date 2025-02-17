import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Cloudinary } from "@cloudinary/url-gen";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const [products, setProducts] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [cartProducts, setCartProducts] = useState([]);
  const [token, setToken] = useState("");
  const [delivery, setDelivery] = useState({ price: 0, method: "" });
  const [authToken, setAuthToken] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();
  const [user, setUser] = useState({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const currency = "Ksh.";

  const cloudinary = new Cloudinary({
    cloud: { cloudName: "ds5lreojp" },
  });

  const addToCart = async (item, size) => {
    toast.dismiss();
    if (!size) {
      toast.error("Select Product Size", {
        id: "error",
      });
      return;
    }

    let cartData = structuredClone(cartItems);
    const itemId = item._id;

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);
    toast.success("Added to cart", {
      id: "success",
      position: "bottom-right",
    });

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message, {
          id: "error",
        });
      }
    } else {
      console.log("no token!");
    }
  };

  // Get total number of items in the cart
  const getCartCount = () => {
    let totalCount = 0;

    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  // Update quantity of items in the cart
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;

    setCartItems(cartData);

    if (token) {
      try {
        const res = await axios.post(
          backendUrl + "/api/cart/update",
          {
            itemId,
            size,
            quantity,
          },
          { headers: { token } }
        );
        console.log(res.data);
      } catch (error) {
        console.log(error);
        toast.error(error.message, {
          id: "error",
        });
      }
    }
  };

  // Get Cart Data from DB
  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        setCartItems(response.data.user.cartData);
        setUser(response.data.user);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {
        id: "error",
      });
    }
  };

  const fetchCartAmount = async () => {
    const amount = await getCartAmount();
    setTotalAmount(amount);
  };

  // Function to calculate total amount
  const getCartAmount = async () => {
    let totalAmount = 0;

    if (!cartItems || Object.keys(cartItems).length === 0) {
      return totalAmount;
    }

    const productIDs = Object.keys(cartItems);
    const filters = { ids: productIDs.join(",") };

    // // Fetch product data
    const fields = "name,image,price,description";
    const cartProducts = await getProductsData(filters, fields, true);
    if (!cartProducts) return totalAmount;

    // setCartProducts(cartProducts);

    for (const productId in cartItems) {
      let itemInfo = cartProducts.find((product) => product._id === productId);
      if (!itemInfo) continue;

      for (const item in cartItems[productId]) {
        if (cartItems[productId][item] > 0) {
          totalAmount += itemInfo.price * cartItems[productId][item];
        }
      }
    }

    return totalAmount;
  };

  // Function to fetch products from the database
  const getProductsData = async (filters, field, cartItems, pagination) => {
    setLoading(true);

    console.log(filters, field, cartItems, pagination);
    try {
      let queryParams = new URLSearchParams(filters).toString();
      let fields;
      if (!field) {
        fields = "name,image,bestSeller,price,category,subCategory";
      } else {
        fields = field;
      }
      queryParams += `&fields=${fields}`;

      const response = await axios.post(
        `${backendUrl}/api/product/list?${queryParams}`
      );

      if (response.data.success) {
        if (cartItems) {
          setCartProducts(response.data.products);
        } else if (pagination) {
          console.log("Called");
          setProducts((prevProducts) => [
            ...prevProducts,
            ...response.data.products,
          ]);
        } else {
          setProducts(response.data.products);
        }
        return response.data.products;
      } else {
        throw new Error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage, { id: "error" });
      setLoading(false);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!token && savedToken) {
      setToken(savedToken);
      getUserCart(savedToken);
    }
  }, []);

  const value = {
    products,
    currency,
    delivery,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    backendUrl,
    navigate,
    token,
    setToken,
    setCartItems,
    setDelivery,
    totalAmount,
    getUserCart,
    setAuthToken,
    authToken,
    setUser,
    user,
    cloudinary,
    getProductsData,
    fetchCartAmount,
    cartProducts,
    setCartProducts,
    location,
    queryParams,
    loading,
    cartData,
    setCartData,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
