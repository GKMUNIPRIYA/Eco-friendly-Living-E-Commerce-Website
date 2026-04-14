import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, Star } from 'lucide-react';
import { toast } from 'sonner';
import { feedbackAPI } from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feedbackAPI.create({
        name: formData.name,
        email: formData.email,
        message: `${formData.subject}\n\n${formData.message}`,
        type: 'general',
        rating: rating || undefined,
      });
      toast.success("Thank you for your rating and message! We've saved your feedback and will get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });
      setRating(0);
    } catch (error: any) {
      console.error('Failed to submit feedback', error);
      toast.error(error?.message || 'Failed to send your message. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6B8E23] to-[#8FBC5A] text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl">
            We'd love to hear from you! Get in touch with our eco-friendly team.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#5B6F1E] mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="off"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="off"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    autoComplete="off"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6B8E23]"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`transition-all transform hover:scale-125 ${
                          s <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <Star className={`w-8 h-8 ${s <= (hoverRating || rating) ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      {rating > 0 ? `${rating} Stars` : 'Rate your experience'}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#6B8E23] text-white py-3 rounded-full font-semibold hover:bg-[#5B6F1E] transition flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#5B6F1E] mb-6">Get in Touch</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#6B8E23] rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#5B6F1E] mb-1">Email Us</h3>
                    <p className="text-gray-600">support@terrakind.com</p>
                    <p className="text-gray-600">info@terrakind.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#6B8E23] rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#5B6F1E] mb-1">Call Us</h3>
                    <p className="text-gray-600">+91 98765 43210</p>
                    <p className="text-sm text-gray-500">Mon-Sat: 9AM - 6PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#6B8E23] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#5B6F1E] mb-1">Visit Us</h3>
                    <p className="text-gray-600">
                      123 Green Street, Eco Plaza<br />
                      Bangalore, Karnataka 560001<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#6B8E23] rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#5B6F1E] mb-1">Business Hours</h3>
                    <p className="text-gray-600">Monday – Saturday: 9AM – 6PM IST</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-[#F5F5DC] rounded-lg p-8">
              <h3 className="text-xl font-bold text-[#5B6F1E] mb-4">
                Quick Questions?
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#5B6F1E] mb-2">
                    What are your shipping times?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    We ship within 2-3 business days and delivery takes 5-7 business days.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#5B6F1E] mb-2">
                    Do you ship internationally?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Currently we ship only within India. International shipping coming soon!
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#5B6F1E] mb-2">
                    What's your return policy?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    We offer 30-day returns on all unused products in original packaging.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
