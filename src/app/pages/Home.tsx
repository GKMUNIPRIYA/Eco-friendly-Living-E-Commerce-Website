import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Leaf, Recycle, Heart, Package } from 'lucide-react';
import { ImageWithFallback } from "../components/UIUX/ImageWithFallback";
import CategorySlider from '../components/CategorySlider';
import ScrollReveal from '../components/ScrollReveal';
import { useEffect, useState } from 'react';
import { api, productsAPI, ordersAPI } from '../services/api';
import { Product } from '../context/CartContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');

  useEffect(() => {
    productsAPI.getAll({ page: 1, limit: 4 })
      .then((res: any) => {
        const items = res?.data || [];
        setFeaturedProducts(items.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          category: p.category,
          description: p.description
        })));
      })
      .catch(err => console.error('Failed to fetch featured products:', err));
  }, []);

  useEffect(() => {
    if (token) {
      ordersAPI.getWishlist()
        .then((res: any) => {
          const list = res?.data || [];
          setWishlistIds(new Set(list.map((item: any) => item._id || item)));
        })
        .catch(console.error);
    }
  }, [token]);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative text-white py-12 md:py-24"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#6B8E23]/90 to-[#8FBC5A]/80" />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              Caring for Earth, One Choice at a Time
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8">
              Discover sustainable, eco-friendly products that make a difference for our planet and your lifestyle.
            </p>
            <div className="flex gap-4">
              <Link
                to="/category/zero-waste-gifts"
                className="bg-white text-[#6B8E23] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
              >
                Shop Now
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[#6B8E23] transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <ScrollReveal variant="fade-up">
        <section className="py-16 bg-[#F5F5DC]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#6B8E23] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[#5B6F1E] mb-2">100% Natural</h3>
                <p className="text-gray-600">All products made from natural, sustainable materials</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#6B8E23] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Recycle className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[#5B6F1E] mb-2">Zero Waste</h3>
                <p className="text-gray-600">Biodegradable and recyclable packaging</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#6B8E23] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[#5B6F1E] mb-2">Ethically Made</h3>
                <p className="text-gray-600">Fair trade and cruelty-free products</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#6B8E23] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-[#5B6F1E] mb-2">Free Shipping</h3>
                <p className="text-gray-600">On orders above ₹999</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>


      {/* Categories Showcase - Slider */}
      <ScrollReveal variant="fade-up" delay={100}>
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[#5B6F1E] mb-12">
              Shop by Category
            </h2>
            <CategorySlider
              slides={[
                {
                  title: 'Health & Beauty',
                  subtitle: 'Eco-friendly personal care products',
                  image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
                  link: '/category/personal-care',
                },
                {
                  title: 'Home & Living',
                  subtitle: 'Sustainable goods for your home',
                  image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800',
                  link: '/category/kitchen',
                },
                {
                  title: 'Eco Gifting',
                  subtitle: 'Zero waste gift ideas',
                  image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800',
                  link: '/category/zero-waste-gifts',
                },
                {
                  title: 'Corporate',
                  subtitle: 'Branded sustainable essentials',
                  image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800',
                  link: '/category/corporate-gifting',
                },
                {
                  title: 'Shop by Brand',
                  subtitle: 'Browse top eco-friendly brands',
                  image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=800',
                  link: '/brands/beco',
                },
              ]}
            />
          </div>
        </section>
      </ScrollReveal>

      {/* Featured Products */}
      <ScrollReveal variant="fade-up" delay={100}>
        <section className="py-16 bg-[#F5F5DC]">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[#5B6F1E] mb-12">
              Featured Products
            </h2>
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group relative"
                  >
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Handle wishlist toggle
                        const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
                        if (!token) {
                          alert('Please login to add to wishlist');
                          return;
                        }
                        try {
                          const res: any = await ordersAPI.toggleWishlist(product.id);
                          if (res.success || res.added !== undefined) {
                            const newWishlist = new Set(wishlistIds);
                            if (res.added) {
                              newWishlist.add(product.id);
                              toast.success('Added to wishlist ❤️');
                            } else {
                              newWishlist.delete(product.id);
                              toast.info('Removed from wishlist');
                            }
                            setWishlistIds(newWishlist);
                          } else {
                            toast.error(res.error?.message || 'Could not update wishlist. Please try again.');
                          }
                        } catch (err) {
                          console.error(err);
                          toast.error('Failed to update wishlist server error');
                        }
                      }}
                      className={`absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full transition shadow-sm ${
                        wishlistIds.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart 
                        className={`w-5 h-5 ${wishlistIds.has(product.id) ? 'text-red-500' : 'text-gray-400'}`} 
                        fill={wishlistIds.has(product.id) ? 'currentColor' : 'none'} 
                      />
                    </button>
                    <Link to={`/product/${product.id}`}>
                      <div className="overflow-hidden">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-[#5B6F1E] mb-2 hover:text-[#6B8E23] transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-[#6B8E23] font-bold">₹{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 italic">New sustainable products coming soon!</p>
              </div>
            )}
          </div>
        </section>
      </ScrollReveal>

      {/* Sustainability Story */}
      <ScrollReveal variant="fade-up" delay={100}>
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-[#5B6F1E] mb-6">
                  Our Commitment to Sustainability
                </h2>
                <p className="text-gray-600 mb-4">
                  At TerraKind, we believe that every choice matters. We curate only the finest eco-friendly products that help reduce waste, protect our environment, and promote sustainable living.
                </p>
                <p className="text-gray-600 mb-6">
                  From bamboo toothbrushes to zero-waste home essentials, every product is carefully selected to ensure it meets our strict environmental standards.
                </p>
                <Link
                  to="/about"
                  className="bg-[#6B8E23] text-white px-6 py-3 rounded-full inline-block hover:bg-[#5B6F1E] transition"
                >
                  Read Our Story
                </Link>
              </div>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1542601098-3ade3a4df43b?q=80&w=1200"
                  alt="Sustainability"
                  className="rounded-lg shadow-xl w-full h-72 object-cover"
                  
                />
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Newsletter Signup */}
      <ScrollReveal variant="fade-up">
        <section className="py-16 bg-[#6B8E23] text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Green Community</h2>
            <p className="mb-8">
              Subscribe to get eco-tips, exclusive offers, and updates on new sustainable products
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                id="newsletter-home"
                className="flex-1 px-4 py-3 rounded-full text-gray-900"
              />
              <button
                onClick={async () => {
                  const input = document.getElementById('newsletter-home') as HTMLInputElement;
                  const email = input?.value?.trim();

                  if (!email) {
                    alert('Please enter a valid email address');
                    return;
                  }

                  const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
                  if (!emailRegex.test(email)) {
                    alert('Please enter a valid email address');
                    return;
                  }

                  try {
                    const data = await api.newsletter.subscribe(email);

                    if (data.success) {
                      alert('✓ Subscribed successfully! Thank you for joining our green community.');
                      input.value = '';
                    } else {
                      alert(data.error?.message || 'Subscription failed. Please try again.');
                    }
                  } catch (err) {
                    console.error('Subscription error:', err);
                    alert('Connection error. Please make sure your internet is working and try again.');
                  }
                }}
                className="bg-[#FF6B35] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#FF5722] transition"
              >
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
