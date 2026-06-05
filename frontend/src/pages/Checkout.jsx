import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { cart, subtotal, discountAmount, total } = useCart();
  const [addresses, setAddresses] = useState(() => JSON.parse(localStorage.getItem('addresses') || '[]'));
  const [selected, setSelected] = useState(addresses[0] || null);
  const [shipping, setShipping] = useState({ method: 'standard', price: 5 });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [savingAddress, setSavingAddress] = useState({ address: '', city: '', postalCode: '', country: '' });
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSelected(addresses[0] || null);
  }, [addresses]);

  const addAddress = () => {
    const newAdd = { ...savingAddress, id: Date.now().toString() };
    const next = [newAdd, ...addresses];
    setAddresses(next);
    localStorage.setItem('addresses', JSON.stringify(next));
    setSavingAddress({ address: '', city: '', postalCode: '', country: '' });
  };

  const shippingPrice = shipping.price;
  const grandTotal = Math.max(0, total + shippingPrice);

  const placeOrder = async () => {
    if (!selected) return alert('Please select or add a shipping address');
    if (cart.length === 0) return alert('Cart is empty');

    const orderItems = cart.map((c) => ({ _id: c._id, name: c.name, qty: c.qty, price: c.price, images: c.images }));
    const body = {
      orderItems,
      shippingAddress: selected,
      paymentMethod,
      itemsPrice: subtotal,
      shippingPrice,
      taxPrice: 0,
      totalPrice: grandTotal
    };

    try {
      setProcessing(true);
      const res = await api.post('/orders', body);
      const { order, clientSecret } = res.data;
      if (paymentMethod === 'card' && clientSecret) {
        // In real app integrate Stripe.js here. For demo we mock capture by calling pay endpoint.
        alert('Stripe PaymentIntent created (test mode). For demo, pressing OK will simulate payment capture.');
        await api.post(`/orders/${order._id}/pay`, { id: 'mock_card_txn' });
      } else if (paymentMethod === 'card') {
        // Stripe not configured; simulate immediate payment
        await api.post(`/orders/${order._id}/pay`, { id: 'mock_card_txn' });
      } else if (paymentMethod === 'mobile') {
        // simulate mobile payment workflow
        alert('Simulating mobile payment...');
        await api.post(`/orders/${order._id}/pay`, { id: 'mock_mobile_txn' });
      } else if (paymentMethod === 'cod') {
        // COD: keep unpaid but order created
      }

      setProcessing(false);
      navigate(`/order/${order._id}`);
    } catch (err) {
      setProcessing(false);
      console.error(err);
      alert(err.response?.data?.message || 'Order failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <section className="bg-white p-4 rounded">
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            {addresses.length === 0 && <p>No addresses saved. Add one below.</p>}
            <div className="space-y-2">
              {addresses.map((a) => (
                <label key={a.id} className={`block p-2 border rounded ${selected?.id === a.id ? 'bg-gray-50' : ''}`}>
                  <input type="radio" checked={selected?.id === a.id} onChange={() => setSelected(a)} />{' '}
                  <span className="ml-2">{a.address}, {a.city} {a.postalCode}, {a.country}</span>
                </label>
              ))}
            </div>

            <div className="mt-4">
              <h4 className="font-medium">Add address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <input placeholder="Address" value={savingAddress.address} onChange={(e)=>setSavingAddress({...savingAddress,address:e.target.value})} className="border p-2 rounded" />
                <input placeholder="City" value={savingAddress.city} onChange={(e)=>setSavingAddress({...savingAddress,city:e.target.value})} className="border p-2 rounded" />
                <input placeholder="Postal Code" value={savingAddress.postalCode} onChange={(e)=>setSavingAddress({...savingAddress,postalCode:e.target.value})} className="border p-2 rounded" />
                <input placeholder="Country" value={savingAddress.country} onChange={(e)=>setSavingAddress({...savingAddress,country:e.target.value})} className="border p-2 rounded" />
              </div>
              <button onClick={addAddress} className="mt-2 bg-primary text-white rounded p-2">Save address</button>
            </div>
          </section>

          <section className="bg-white p-4 rounded">
            <h3 className="font-semibold mb-2">Shipping Method</h3>
            <label className="block"><input type="radio" name="shipping" checked={shipping.method==='standard'} onChange={()=>setShipping({method:'standard',price:5})} /> Standard ($5)</label>
            <label className="block"><input type="radio" name="shipping" checked={shipping.method==='express'} onChange={()=>setShipping({method:'express',price:15})} /> Express ($15)</label>
          </section>

          <section className="bg-white p-4 rounded">
            <h3 className="font-semibold mb-2">Payment</h3>
            <label className="block"><input type="radio" name="pay" checked={paymentMethod==='card'} onChange={()=>setPaymentMethod('card')} /> Card (Stripe test)</label>
            <label className="block"><input type="radio" name="pay" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')} /> Cash on Delivery</label>
            <label className="block"><input type="radio" name="pay" checked={paymentMethod==='mobile'} onChange={()=>setPaymentMethod('mobile')} /> Mobile Payment (mock)</label>
          </section>
        </div>

        <aside className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Order Summary</h3>
          <div className="mt-2 text-sm">Items: ${subtotal.toFixed(2)}</div>
          <div className="mt-1 text-sm">Discount: -${discountAmount.toFixed(2)}</div>
          <div className="mt-1 text-sm">Shipping: ${shippingPrice.toFixed(2)}</div>
          <div className="mt-2 font-bold">Total: ${grandTotal.toFixed(2)}</div>

          <button disabled={processing} onClick={placeOrder} className="mt-4 w-full bg-accent text-white rounded p-2">
            {processing ? 'Processing...' : 'Place Order'}
          </button>
        </aside>
      </div>
    </div>
  );
}
