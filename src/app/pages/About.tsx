import { Link } from 'react-router-dom';
import { Leaf, Heart, Users, Award } from 'lucide-react';
import { ImageWithFallback } from "../components/UIUX/ImageWithFallback";

export default function About() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8faf5' }}>
      {/* Hero Section - Clean Eco Gradient */}
      <div className="relative py-20 bg-gradient-to-br from-[#556B2F] via-[#6B8E23] to-[#8FBC5A] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-20" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-md">About TerraKind</h1>
          <p className="text-white/90 text-xl font-medium drop-shadow-sm">
            Caring for Earth, One Choice at a Time
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-[#5B6F1E] mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              TerraKind was born from a simple belief: that every choice we make has the power to
              create positive change for our planet. Founded in 2020, we started as a small team
              passionate about making sustainable living accessible to everyone.
            </p>
            <p className="text-gray-600 mb-4">
              Today, we've grown into a community of eco-conscious individuals who believe that
              taking care of the Earth doesn't mean compromising on quality or convenience. We
              carefully curate products from ethical brands that share our commitment to sustainability.
            </p>
            <p className="text-gray-600">
              From bamboo toothbrushes to zero-waste home essentials, every product in our store
              is chosen with the planet in mind. We're not just selling products – we're building
              a movement towards a more sustainable future.
            </p>
          </div>
          <div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop"
              alt="Sustainability"
              className="rounded-lg shadow-xl w-full h-64 object-cover"
            />
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#5B6F1E] mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#6B8E23] rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-[#5B6F1E] mb-2 text-xl">Sustainability</h3>
              <p className="text-gray-600">
                Every product is chosen for its minimal environmental impact
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#6B8E23] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-[#5B6F1E] mb-2 text-xl">Ethics</h3>
              <p className="text-gray-600">
                We support fair trade and cruelty-free practices
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#6B8E23] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-[#5B6F1E] mb-2 text-xl">Community</h3>
              <p className="text-gray-600">
                Building a network of eco-conscious individuals
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#6B8E23] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-bold text-[#5B6F1E] mb-2 text-xl">Quality</h3>
              <p className="text-gray-600">
                Premium products that are built to last
              </p>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="bg-gradient-to-r from-[#6B8E23] to-[#8FBC5A] text-white rounded-lg p-12 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold mb-2">50K+</p>
              <p className="text-lg">Happy Customers</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">2M+</p>
              <p className="text-lg">Plastic Items Replaced</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">500+</p>
              <p className="text-lg">Eco Products</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">15T</p>
              <p className="text-lg">CO₂ Saved</p>
            </div>
          </div>
        </div>

        {/* Our Commitment */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1593113646773-028c2d3b6a8c?w=800&auto=format&fit=crop"
              alt="Eco packaging"
              className="rounded-lg shadow-xl w-full h-72 object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#5B6F1E] mb-6">
              Our Commitment to Zero Waste
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#6B8E23] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-[#5B6F1E]">Plastic-Free Packaging</p>
                  <p className="text-gray-600">All our shipments use biodegradable materials</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#6B8E23] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-[#5B6F1E]">Carbon-Neutral Shipping</p>
                  <p className="text-gray-600">We offset 100% of our delivery emissions</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#6B8E23] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-[#5B6F1E]">Ethical Sourcing</p>
                  <p className="text-gray-600">Direct partnerships with sustainable brands</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#6B8E23] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-[#5B6F1E]">Community Education</p>
                  <p className="text-gray-600">Free resources to help you live sustainably</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#F5F5DC] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#5B6F1E] mb-4">
            Join the Movement
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Every purchase you make helps create a more sustainable future.
            Start your eco-friendly journey with us today.
          </p>
          <Link
            to="/"
            className="bg-[#6B8E23] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#5B6F1E] transition inline-block"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
