import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Rating from '../components/Rating';
import { useCart } from '../context/CartContext';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setMainImage(res.data.images && res.data.images[0]);
      })
      .catch((err) => console.error(err));

    api
      .get(`/products/${id}/reviews`)
      .then((res) => setReviews(res.data || []))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <p>Loading...</p>;

  const { addItem } = useCart();
  const addToCart = () => {
    try {
      if (addItem) addItem(product, qty);
      else {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((c) => c._id === product._id);
        if (existing) existing.qty = Math.min(product.countInStock, existing.qty + qty);
        else cart.push({ ...product, qty });
        localStorage.setItem('cart', JSON.stringify(cart));
      }
      navigate('/cart');
    } catch (e) {
      console.error(e);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      const res = await api.get(`/products/${id}/reviews`);
      setReviews(res.data || []);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) navigate('/auth');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="flex gap-4">
          <div className="w-1/4 flex flex-col gap-2">
            {(product.images || []).map((img) => (
              <img
                key={img}
                src={img}
                alt={product.name}
                className="h-20 w-full object-cover rounded cursor-pointer border"
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>

          <div className="flex-1">
            <div className="w-full h-96 bg-gray-100 overflow-hidden rounded">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain transform transition-transform duration-200 hover:scale-110"
                />
              ) : (
                <div className="p-6">No image</div>
              )}
            </div>
            <h2 className="text-2xl font-semibold mt-4">{product.name}</h2>
            <div className="mt-2">
              <Rating value={product.rating || 0} text={`${product.numReviews || 0} reviews`} />
            </div>
            <p className="mt-4 text-gray-700">{product.description}</p>
          </div>
        </div>

        <section className="mt-6">
          <h3 className="text-xl font-semibold">Customer reviews</h3>
          <div className="mt-3 space-y-4">
            {reviews.length === 0 && <p>No reviews yet.</p>}
            {reviews.map((r) => (
              <div key={r._id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.name || 'Anonymous'}</div>
                  <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-2">
                  <Rating value={r.rating} />
                </div>
                <p className="mt-2 text-gray-700">{r.comment}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-semibold">Write a review</h4>
            <form onSubmit={submitReview} className="mt-3 space-y-2">
              <div>
          <div className="mt-4">
            <button onClick={async ()=>{ try{ await api.post('/wishlist',{ productId: product._id }); alert('Added to wishlist'); }catch(e){ console.error(e); alert('Wishlist add failed'); } }} className="ml-2 text-sm text-primary">Add to wishlist</button>
          </div>
                <label className="block text-sm">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="border rounded p-2 mt-1"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Terrible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full border rounded p-2 mt-1"
                />
              </div>
              <div>
                <button className="bg-primary text-white rounded px-4 py-2">Submit review</button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <aside className="col-span-1 bg-white p-4 rounded shadow-sm">
        <div className="text-2xl font-bold">${product.price}</div>
        <div className="mt-2">Status: {product.countInStock > 0 ? 'In stock' : 'Out of stock'}</div>
        {product.countInStock > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <label className="text-sm">Qty</label>
            <input
              type="number"
              min={1}
              max={product.countInStock}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(product.countInStock, Number(e.target.value))))}
              className="w-20 border rounded p-2"
            />
          </div>
        )}

        <button
          onClick={addToCart}
          disabled={product.countInStock === 0}
          className="mt-4 w-full bg-primary text-white rounded p-2 disabled:opacity-50"
        >
          Add to cart
        </button>
      </aside>
    </div>
  );
}
