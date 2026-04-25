import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import productImg from "../../imgs/products-sale.jpg";
// If you want 10 offers images flip Just expand offers array
const offers = [
  {
    title: "Flat 50% OFF",
    img: productImg,
  },
  {
    title: "Buy 1 Get 1 Free",
    img: productImg,
  },
  {
    title: "Limited Time Deals",
    img: productImg,
  },
  {
    title: "Flash Sale",
    img: productImg,
  },
  {
    title: "Under ₹999",
    img: productImg,
  },
  {
    title: "Mega Discounts",
    img: productImg,
  },
  {
    title: "Trending Products",
    img: productImg,
  },
  {
    title: "Festive Offers",
    img: productImg,
  },
  {
    title: "Best Sellers",
    img: productImg,
  },
  {
    title: "Clearance Sale",
    img: productImg,
  },
];

const ProductsCard = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    setIndex((prev) => (prev + 1) % offers.length);
  };

  return (
    <div
      className="rounded-lg overflow-hidden border shadow-sm bg-white cursor-pointer"
      onClick={next}
    >
      {/* HEADER */}
      <div
        className="flex items-center justify-between px-3 py-2 
        bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
      >
        <p className="text-sm font-semibold">Products</p>

        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent slide click
            // navigate("/products");
          }}
          className="text-xs font-medium underline hover:opacity-80 transition"
        >
          Buy from us
        </button>
      </div>

      {/* SLIDER */}
      <div className="relative h-32 overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {offers.map((item, i) => (
            <div key={i} className="w-full flex-shrink-0 relative">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-32 object-cover"
              />

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-center px-2">
                <p className="text-xs font-semibold">{item.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* DOTS */}
        <div className="absolute bottom-2 w-full flex justify-center gap-1">
          {offers.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsCard;
