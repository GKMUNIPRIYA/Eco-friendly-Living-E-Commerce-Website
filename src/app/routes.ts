import { createBrowserRouter } from 'react-router-dom';
import Root from './Root';
import Home from './pages/Home';
import Category from './pages/Category';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Brand from './pages/Brand';
import AuthPage from './pages/AuthPage';
// Register page unused – AuthPage handles both sign-in and sign-up
import Search from './pages/Search';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import VerifyEmail from './pages/VerifyEmail';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import AdminRoot from './AdminRoot';
import ErrorPage from './pages/ErrorPage';

export const router = createBrowserRouter([
  ...(import.meta.env.MODE !== 'admin' ? [{
    path: '/',
    Component: Root,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: Home },
      { path: 'category/:categoryId', Component: Category },
      { path: 'product/:productId', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'order-confirmation/:orderId', Component: OrderConfirmation },
      { path: 'my-orders', Component: MyOrders },
      { path: 'blog', Component: Blog },
      { path: 'blog/:blogId', Component: BlogDetail },
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      { path: 'brands/:brandId', Component: Brand },
      { path: 'register', Component: AuthPage },
      { path: 'search', Component: Search },
      { path: 'profile', Component: Profile },
      { path: 'wishlist', Component: Wishlist },
      { path: 'login', Component: AuthPage },
      { path: 'verify-email', Component: VerifyEmail },
    ],
  }] : []),
  ...(import.meta.env.MODE !== 'user' ? [{
    path: '/admin',
    Component: AdminRoot,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: Admin },
      { path: 'login', Component: AdminLogin },
    ],
  }] : []),
]);