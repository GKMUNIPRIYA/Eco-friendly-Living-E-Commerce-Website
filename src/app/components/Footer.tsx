import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Leaf } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#5B6F1E] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-6 h-6" />
              <h3 className="text-xl font-bold">TerraKind</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Caring for Earth, One Choice at a Time. Your trusted partner for sustainable and eco-friendly products.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#8FBC5A] transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#8FBC5A] transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#8FBC5A] transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#8FBC5A] transition">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">About Us</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-lg mb-4">Shop</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link to="/category/personal-care" className="hover:text-white transition">
                  Health & Beauty
                </Link>
              </li>
              <li>
                <Link to="/category/kitchen" className="hover:text-white transition">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link to="/category/zero-waste-gifts" className="hover:text-white transition">
                  Gifting
                </Link>
              </li>
              <li>
                <Link to="/category/corporate-gifting" className="hover:text-white transition">
                  Corporate Gifting
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>Shipping & Delivery</li>
              <li>Returns & Refunds</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
              <li>Track Order</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-300">
            <p>© 2026 TerraKind. All rights reserved.</p>
            <p>Made with 💚 for a sustainable planet</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
