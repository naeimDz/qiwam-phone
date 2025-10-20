// ============================================
// POS Page - Point of Sale Component (Separate)
// ============================================
"use client"
import React, { useState } from 'react';
import { Search, ShoppingCart, X } from 'lucide-react';
import { useTheme } from '@/lib/theme';

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  brand: string;
};

type Category = {
  id: string;
  name: string;
  icon: string;
};

const POSPage: React.FC = () => {
  const { theme } = useTheme();
  const [cart, setCart] = useState<(Product & { quantity: number })[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  const products: Product[] = [
    { id: 1, name: 'iPhone 15 Pro Max', price: 280000, stock: 5, category: 'apple', image: '📱', brand: 'Apple' },
    { id: 2, name: 'Samsung Galaxy S24 Ultra', price: 220000, stock: 8, category: 'samsung', image: '📱', brand: 'Samsung' },
    { id: 3, name: 'Xiaomi Redmi Note 13 Pro', price: 45000, stock: 15, category: 'xiaomi', image: '📱', brand: 'Xiaomi' },
    { id: 4, name: 'iPhone 14 Pro', price: 180000, stock: 3, category: 'apple', image: '📱', brand: 'Apple' },
    { id: 5, name: 'Samsung Galaxy A54', price: 65000, stock: 12, category: 'samsung', image: '📱', brand: 'Samsung' },
    { id: 6, name: 'Oppo Reno 11', price: 55000, stock: 10, category: 'oppo', image: '📱', brand: 'Oppo' },
    { id: 7, name: 'Poco X6 Pro', price: 48000, stock: 20, category: 'xiaomi', image: '📱', brand: 'Poco' },
    { id: 8, name: 'iPhone 13', price: 135000, stock: 6, category: 'apple', image: '📱', brand: 'Apple' },
    { id: 9, name: 'Samsung Galaxy Z Flip 5', price: 195000, stock: 4, category: 'samsung', image: '📱', brand: 'Samsung' },
    { id: 10, name: 'Realme 12 Pro+', price: 52000, stock: 18, category: 'realme', image: '📱', brand: 'Realme' },
    { id: 11, name: 'AirPods Pro', price: 35000, stock: 25, category: 'accessories', image: '🎧', brand: 'Apple' },
    { id: 12, name: 'Samsung Buds 2 Pro', price: 28000, stock: 30, category: 'accessories', image: '🎧', brand: 'Samsung' }
  ];

  const categories: Category[] = [
    { id: 'all', name: 'الكل', icon: '📦' },
    { id: 'apple', name: 'Apple', icon: '🍎' },
    { id: 'samsung', name: 'Samsung', icon: '📱' },
    { id: 'xiaomi', name: 'Xiaomi', icon: '🔶' },
    { id: 'accessories', name: 'إكسسوارات', icon: '🎧' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const calculateTotal = (): number => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const paymentText = paymentMethod === 'cash' ? 'نقدي' : 'بطاقة';
    const total = calculateTotal();
    alert('تمت العملية بنجاح\n\nالمبلغ الإجمالي: ' + total.toLocaleString() + ' DA\nطريقة الدفع: ' + paymentText + '\nعدد المنتجات: ' + totalItems);
    setCart([]);
    setCustomerPhone('');
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-7 flex flex-col gap-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2" size={18} style={{ color: theme.colors.textSecondary }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full pr-10 pl-4 py-3 rounded-xl border-2 outline-none transition-all"
              style={{
                backgroundColor: theme.colors.bgPrimary,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary
              }}
              onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
              onBlur={(e) => e.target.style.borderColor = theme.colors.border}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2"
                style={{
                  backgroundColor: selectedCategory === cat.id ? theme.colors.primary : theme.colors.bgSecondary,
                  color: selectedCategory === cat.id ? '#FFFFFF' : theme.colors.textPrimary,
                  border: '2px solid ' + (selectedCategory === cat.id ? theme.colors.primary : 'transparent')
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 text-right"
                style={{
                  backgroundColor: theme.colors.bgPrimary,
                  borderColor: theme.colors.border
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary;
                  e.currentTarget.style.boxShadow = '0 4px 15px ' + theme.colors.primary + '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="text-4xl mb-2">{product.image}</div>
                <h4 className="font-bold text-sm mb-1 line-clamp-2" style={{ color: theme.colors.textPrimary }}>
                  {product.name}
                </h4>
                <p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
                  المخزون: {product.stock}
                </p>
                <p className="text-lg font-bold" style={{ color: theme.colors.primary }}>
                  {product.price.toLocaleString()} DA
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-5 flex flex-col gap-4">
        <div
          className="flex-1 rounded-2xl border-2 p-4 flex flex-col"
          style={{
            backgroundColor: theme.colors.bgPrimary,
            borderColor: theme.colors.border
          }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderBottomColor: theme.colors.border }}>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.colors.textPrimary }}>
              <ShoppingCart size={20} />
              السلة
            </h3>
            <span className="text-sm px-3 py-1 rounded-full font-bold" style={{ backgroundColor: theme.colors.accent, color: '#FFFFFF' }}>
              {cart.reduce((sum, item) => sum + item.quantity, 0)} منتج
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full" style={{ color: theme.colors.textSecondary }}>
                <ShoppingCart size={48} className="mb-2 opacity-30" />
                <p>السلة فارغة</p>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border flex items-center gap-3"
                  style={{
                    backgroundColor: theme.colors.bgSecondary,
                    borderColor: theme.colors.border
                  }}
                >
                  <div className="text-2xl">{item.image}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>
                      {item.name}
                    </h4>
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                      {item.price.toLocaleString()} DA × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all"
                      style={{ backgroundColor: theme.colors.border, color: theme.colors.textPrimary }}
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold" style={{ color: theme.colors.textPrimary }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all"
                      style={{
                        backgroundColor: item.quantity >= item.stock ? theme.colors.border : theme.colors.primary,
                        color: '#FFFFFF',
                        opacity: item.quantity >= item.stock ? 0.5 : 1
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all mr-1"
                      style={{ backgroundColor: '#DC262620', color: '#DC2626' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mb-4">
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="رقم هاتف العميل (اختياري)"
              className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
              style={{
                backgroundColor: theme.colors.bgSecondary,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary
              }}
              onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
              onBlur={(e) => e.target.style.borderColor = theme.colors.border}
            />
          </div>
          <div className="border-t pt-4 mt-4" style={{ borderTopColor: theme.colors.border }}>
  <div className="flex justify-between mb-2">
    <span style={{ color: theme.colors.textSecondary }}>المجموع</span>
    <span className="font-bold" style={{ color: theme.colors.textPrimary }}>
      {calculateTotal().toLocaleString()} DA
    </span>
  </div>

  <div className="mb-4">
    <select
      value={paymentMethod}
      onChange={(e) => setPaymentMethod("cash")}
      className="w-full px-4 py-2 rounded-lg border outline-none transition-all"
      style={{
        backgroundColor: theme.colors.bgSecondary,
        borderColor: theme.colors.border,
        color: theme.colors.textPrimary
      }}
      onFocus={(e) => e.target.style.borderColor = theme.colors.primary}
      onBlur={(e) => e.target.style.borderColor = theme.colors.border}
    >
      <option value="cash">نقدي</option>
      <option value="card">بطاقة</option>
    </select>
  </div>

  <button
    onClick={handleCheckout}
    className="w-full py-3 rounded-xl font-bold text-white transition-all"
    style={{ backgroundColor: theme.colors.primary }}
  >
    إتمام العملية
  </button>
</div>

        </div>
      </div>
    </div>
  );
};

export default POSPage;
