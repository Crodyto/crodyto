import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function CartPage() {
  const { cart, updateQty, removeItem, subtotal, coupon, discountAmount, total, applyCoupon, clearCart } = useCart();
  const [code, setCode] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);

  const handleApply = async () => {
    const res = await applyCoupon(code);
    setCouponMessage(res.success ? 'Coupon applied' : res.message);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
      {cart.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link to="/">Continue shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="flex flex-col md:flex-row items-center gap-4 border rounded p-3">
                <img src={item.images?.[0] || ''} alt={item.name} className="w-28 h-28 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">${item.price} each</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item._id, Math.max(1, item.qty - 1))}
                      className="px-3 bg-gray-100 rounded"
                    >
                      -
                    </button>
                    <input
                      className="w-20 text-center form-input"
                      value={item.qty}
                      onChange={(e) => updateQty(item._id, Math.max(1, Number(e.target.value) || 1))}
                    />
                    <button onClick={() => updateQty(item._id, Math.min(item.countInStock || 9999, item.qty + 1))} className="px-3 bg-gray-100 rounded">
                      +
                    </button>
                    <button onClick={() => removeItem(item._id)} className="ml-4 text-sm text-red-500">
                      Remove
                    </button>
                    <button onClick={async ()=>{ try{ await api.post('/wishlist',{ productId: item._id }); removeItem(item._id); }catch(e){console.error(e);} }} className="ml-2 text-sm text-primary">
                      Save for later
                    </button>
                  </div>
                </div>
                <div className="text-right md:text-right">
                  <div className="font-semibold">${(item.price * item.qty).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>

          <aside className="bg-white p-4 rounded shadow-sm">
            <div className="text-sm">Subtotal: ${subtotal.toFixed(2)}</div>
            <div className="mt-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Coupon code"
                className="w-full border rounded p-2"
              />
              <button onClick={handleApply} className="mt-2 w-full bg-primary text-white rounded p-2">
                Apply
              </button>
              {couponMessage && <div className="mt-2 text-sm">{couponMessage}</div>}
            </div>

            {coupon && (
              <div className="mt-2 text-sm">Applied: {coupon.code} - {coupon.discount.type === 'percent' ? coupon.discount.value + '%' : '$' + coupon.discount.value}</div>
            )}

            <div className="mt-4 font-semibold">Discount: -${discountAmount.toFixed(2)}</div>
            <div className="mt-2 text-xl">Total: ${total.toFixed(2)}</div>

            <div className="mt-4">
              <button className="w-full bg-accent text-white rounded p-2">Proceed to Checkout</button>
            </div>
            <div className="mt-2">
              <button onClick={clearCart} className="w-full border rounded p-2 text-sm">Clear cart</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
