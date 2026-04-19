import { Product } from '../context/CartContext';

export const products: Product[] = [];

export const categories = [
  {
    id: 'personal-care',
    name: 'Personal Care',
    parent: 'health-beauty',
    image: '/images-bg-submenu/personal-care.png',
    subtitle: 'Nourish yourself with nature’s finest ingredients.'
  },
  {
    id: 'period-products',
    name: 'Period Products',
    parent: 'health-beauty',
    image: '/images-bg-submenu/period-products.png',
    subtitle: 'Sustainable care for your most comfortable cycle.'
  },
  {
    id: 'soap-bars',
    name: 'Zero Waste Soap Bars',
    parent: 'health-beauty',
    image: '/images-bg-submenu/soap-bars.png',
    subtitle: 'Handcrafted goodness, zero plastic waste.'
  },
  {
    id: 'bath-body',
    name: 'Bath & Body',
    parent: 'health-beauty',
    image: '/images-bg-submenu/bath-body.png',
    subtitle: 'Transform your daily routine into a spa retreat.'
  },
  {
    id: 'hair-care',
    name: 'Hair Care',
    parent: 'health-beauty',
    image: '/images-bg-submenu/hair-care.png',
    subtitle: 'Naturally vibrant hair starts with sustainable care.'
  },
  {
    id: 'face',
    name: 'Face',
    parent: 'health-beauty',
    image: '/images-bg-submenu/face.png',
    subtitle: 'Glow with confidence, powered by the Earth.'
  },
  {
    id: 'essential-oils',
    name: 'Essential Oils',
    parent: 'health-beauty',
    image: '/images-bg-submenu/essential-oils.png',
    subtitle: 'Pure botanical essences for your mind and soul.'
  },
  {
    id: 'cleaners',
    name: 'Cleaners',
    parent: 'home-living',
    image: '/images-bg-submenu/cleaners.png',
    subtitle: 'Tough on dirt, gentle on the planet.'
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    parent: 'home-living',
    image: '/images-bg-submenu/bathroom.png',
    subtitle: 'Elevate your sanctuary with sustainable style.'
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    parent: 'home-living',
    image: '/images-bg-submenu/kitchen.png',
    subtitle: 'Cook with love and a green conscience.'
  },
  {
    id: 'travel',
    name: 'Travel',
    parent: 'home-living',
    image: '/images-bg-submenu/travel.png',
    subtitle: 'Explore the world, leave only footprints.'
  },
  {
    id: 'home-composting',
    name: 'Home Composting',
    parent: 'home-living',
    image: '/images-bg-submenu/home-composting.png',
    subtitle: 'Turn your waste into gold for your garden.'
  },
  {
    id: 'stationery',
    name: 'Stationery',
    parent: 'home-living',
    image: '/images-bg-submenu/stationery.png',
    subtitle: 'Inspiring ideas on recycled paper.'
  },
  {
    id: 'candles-aroma',
    name: 'Candles & Aroma',
    parent: 'home-living',
    image: '/images-bg-submenu/candles-aroma.png',
    subtitle: 'Set the mood with natural, non-toxic warmth.'
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    parent: 'home-living',
    image: '/images-bg-submenu/pet-care.png',
    subtitle: 'Love your pets, love their planet.'
  },
  {
    id: 'reusable-bags',
    name: 'Reusable Bags',
    parent: 'home-living',
    image: '/images-bg-submenu/reusable-bags.png',
    subtitle: 'Carry the change, one bag at a time.'
  },
  {
    id: 'zero-waste-gifts',
    name: 'Zero Waste Gifts',
    parent: 'everyday-gifting',
    image: '/images-bg-submenu/zero-waste-gifts.png',
    subtitle: 'Thoughtful gifting that gives back to nature.'
  },
  {
    id: 'womens-day',
    name: "Women's Day",
    parent: 'everyday-gifting',
    image: '/images-bg-submenu/womens-day.png',
    subtitle: 'Celebrating the women leading the green revolution.'
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    parent: 'everyday-gifting',
    image: '/images-bg-submenu/anniversary.png',
    subtitle: 'Timeless love, sustainable celebrations.'
  },
  {
    id: 'corporate-gifting',
    name: 'Corporate Gifting',
    parent: 'root',
    image: '/images-bg-submenu/corporate-gifting.png',
    subtitle: 'Impress with purpose and planetary care.'
  },
];

export const brands = [
  { id: 'green-feels', name: 'Green Feels', image: '/menu-images/brand-green-feels.png', subtitle: 'Crafting harmony between nature and living.' },
  { id: 'ecosys', name: 'Ecosys', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1920', subtitle: 'Innovative solutions for a circular economy.' },
  { id: 'myoneearth', name: 'MyOneEarth', image: '/menu-images/brand-myoneearth.png', subtitle: 'One home, one planet, one conscious choice.' },
  { id: 'beco', name: 'Beco', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=1920', subtitle: 'Making sustainable living the new normal.' },
  { id: 'wild-ideas', name: 'Wild Ideas', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=1920', subtitle: 'Rooted in rural empowerment and organic purity.' },
  { id: 'dvaar', name: 'Dvaar', image: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?auto=format&fit=crop&q=80&w=1920', subtitle: 'Your gateway to a mindful, eco-conscious lifestyle.' },
  { id: 'saathi', name: 'Saathi', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1920', subtitle: 'Dignity and sustainability in every pad.' },
  { id: 'thenga', name: 'Thenga', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1920', subtitle: 'Traditional roots, modern sustainable vessels.' },
];
