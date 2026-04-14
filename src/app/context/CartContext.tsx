import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  /**
   * Returns discount amount for a single item
   */
  getItemDiscount: (item: CartItem) => number;
  /**
   * Returns subtotal after discounts (before tax/shipping)
   */
  getCartSubtotal: () => number;
  /**
   * Returns total discount amount applied to cart
   */
  getCartDiscount: () => number;
  /**
   * Grand total including tax and shipping (used by checkout)
   */
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [offers, setOffers] = useState<any[]>([]); // ideally typed

  // fetch active offers on mount
  useEffect(() => {
    fetch('/api/offers/active')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setOffers(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const calculateItemDiscount = (item: CartItem) => {
    // choose highest applicable percentage
    let bestPct = 0;
    offers.forEach((offer) => {
      if (
        offer.isActive &&
        offer.applicableCategories?.includes(item.category) &&
        new Date(offer.validFrom) <= new Date() &&
        new Date(offer.validTo) >= new Date()
      ) {
        bestPct = Math.max(bestPct, offer.discount);
      }
    });
    return Math.round((item.price * item.quantity * bestPct) / 100);
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getItemDiscount = (item: CartItem) => calculateItemDiscount(item);

  const getCartDiscount = () => {
    return cart.reduce((sum, item) => sum + calculateItemDiscount(item), 0);
  };

  const getCartSubtotal = () => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity - calculateItemDiscount(item),
      0
    );
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const tax = subtotal * 0.18;
    return Math.round(subtotal + tax); // no shipping charges
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemDiscount,
        getCartSubtotal,
        getCartDiscount,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
