import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        try {
            const response = await api.get('/orders/cart/');
            setCart(response.data);
            setCartCount(response.data.items?.length || 0);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            setCart(null);
            setCartCount(0);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        setLoading(true);
        try {
            await api.post('/orders/cart/add/', {
                product_id: productId,
                quantity: quantity
            });
            await fetchCart();
            toast.success('Added to cart!', {
                duration: 2000,
                position: 'bottom-right',
            });
            return true;
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error('Failed to add to cart', {
                duration: 3000,
                position: 'bottom-right',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId) => {
        setLoading(true);
        try {
            await api.delete(`/orders/cart/items/${itemId}/`);
            await fetchCart();
            toast.success('Removed from cart', {
                duration: 2000,
                position: 'bottom-right',
            });
            return true;
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            toast.error('Failed to remove item', {
                duration: 3000,
                position: 'bottom-right',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        setLoading(true);
        try {
            await api.patch(`/orders/cart/items/${itemId}/`, { quantity });
            await fetchCart();
            return true;
        } catch (error) {
            console.error('Failed to update quantity:', error);
            toast.error('Failed to update quantity', {
                duration: 3000,
                position: 'bottom-right',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const clearCart = () => {
        setCart(null);
        setCartCount(0);
    };

    useEffect(() => {
        // Fetch cart on mount if user is logged in
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchCart();
        }
    }, []);

    return (
        <CartContext.Provider value={{
            cart,
            cartCount,
            loading,
            fetchCart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
