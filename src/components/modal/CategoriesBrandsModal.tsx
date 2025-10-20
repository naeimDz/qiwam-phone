import React, { useState, useRef, useEffect } from 'react';
import { X, FolderTree, Tag, Plus, Edit2, Trash2, Check, Search, AlertCircle } from 'lucide-react';

// Types
interface Item {
  id: string;
  name: string;
  count: number;
}

interface EditableItemProps {
  item: Item;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  onEdit: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  isNew: boolean;
}

interface AddSectionProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  count: number;
}

interface CategoriesBrandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategories?: Item[];
  initialBrands?: Item[];
}

// مكون عنصر قابل للتحرير
const EditableItem: React.FC<EditableItemProps> = ({ item, icon: Icon, color, onEdit, onDelete, isNew }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== item.name) {
      onEdit(item.id, editValue.trim());
      setIsEditing(false);
    } else if (editValue.trim()) {
      setIsEditing(false);
    } else {
      setEditValue(item.name);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(item.name);
    setIsEditing(false);
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border border-border bg-bg-secondary hover:bg-bg-light transition-all group ${isNew ? 'animate-pulse-once ring-2 ring-' + color + ' ring-opacity-50' : ''}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`p-2 rounded-lg bg-${color} bg-opacity-10 shrink-0`}>
          <Icon className={`text-${color}`} size={16} />
        </div>
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              onBlur={handleSave}
              className="flex-1 px-2 py-1 rounded-lg border border-border bg-bg-primary text-text-primary focus:border-primary outline-none"
            />
          </div>
        ) : (
          <div 
            onDoubleClick={() => setIsEditing(true)} 
            className="cursor-text flex-1 min-w-0"
            title="انقر مرتين للتعديل"
          >
            <p className="text-text-primary font-medium truncate">{item.name}</p>
            <p className="text-text-secondary text-xs">{item.count} منتج</p>
          </div>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {isEditing ? (
          <>
            <button 
              onClick={handleSave}
              className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-green-500"
              title="حفظ (Enter)"
            >
              <Check size={16} />
            </button>
            <button 
              onClick={handleCancel}
              className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-red-500"
              title="إلغاء (Esc)"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setIsEditing(true)}
              className={`p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-${color}`}
              title="تعديل"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-lg hover:bg-bg-primary transition-colors text-text-secondary hover:text-red-500"
              title="حذف"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// مكون قسم الإضافة
const AddSection: React.FC<AddSectionProps> = ({ 
  placeholder, 
  value, 
  onChange, 
  onAdd, 
  color, 
  icon: Icon, 
  label, 
  count 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`text-${color}`} size={20} />
        <h3 className="text-lg font-bold text-text-primary">{label}</h3>
        <span className="text-xs bg-bg-secondary px-2 py-1 rounded-full text-text-secondary">
          {count}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              onAdd();
              setTimeout(() => inputRef.current?.focus(), 100);
            }
          }}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors placeholder:text-text-secondary"
        />
        <button
          onClick={() => {
            onAdd();
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          disabled={!value.trim()}
          className={`px-4 py-2.5 rounded-xl bg-${color} text-white hover:opacity-90 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Plus size={18} />
          <span>إضافة</span>
        </button>
      </div>
    </div>
  );
};

// مكون البحث
const SearchBar: React.FC<{ value: string; onChange: (value: string) => void; placeholder: string }> = ({ 
  value, 
  onChange, 
  placeholder 
}) => (
  <div className="relative">
    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-bg-secondary text-text-primary focus:border-primary outline-none transition-colors placeholder:text-text-secondary"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
      >
        <X size={16} />
      </button>
    )}
  </div>
);

// مكون الحالة الفارغة
const EmptyState: React.FC<{ 
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="text-center py-12 text-text-secondary">
    <Icon size={48} className="mx-auto mb-3 opacity-30" />
    <p className="font-medium">{title}</p>
    <p className="text-sm mt-1">{description}</p>
  </div>
);

// مكون التبويب
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  count: number;
  color: string;
}> = ({ active, onClick, icon: Icon, label, count, color }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-6 py-3 font-semibold transition-all relative ${
      active ? `text-${color}` : 'text-text-secondary hover:text-text-primary'
    }`}
  >
    <div className="flex items-center justify-center gap-2">
      <Icon size={18} />
      <span>{label}</span>
      <span className="text-xs bg-bg-primary px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
    {active && (
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${color}`}></div>
    )}
  </button>
);

// المكون الرئيسي
export const CategoriesBrandsModal: React.FC<CategoriesBrandsModalProps> = ({ 
  isOpen, 
  onClose, 
  initialCategories = [], 
  initialBrands = [] 
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>('categories');
  const [categories, setCategories] = useState<Item[]>(initialCategories);
  const [brands, setBrands] = useState<Item[]>(initialBrands);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newlyAdded, setNewlyAdded] = useState<{ categories: string[]; brands: string[] }>({ 
    categories: [], 
    brands: [] 
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newId = Date.now().toString();
      setCategories([{ id: newId, name: newCategoryName.trim(), count: 0 }, ...categories]);
      setNewlyAdded(prev => ({ ...prev, categories: [...prev.categories, newId] }));
      setNewCategoryName('');
      setTimeout(() => {
        setNewlyAdded(prev => ({ ...prev, categories: prev.categories.filter(id => id !== newId) }));
      }, 2000);
    }
  };

  const handleAddBrand = () => {
    if (newBrandName.trim()) {
      const newId = Date.now().toString();
      setBrands([{ id: newId, name: newBrandName.trim(), count: 0 }, ...brands]);
      setNewlyAdded(prev => ({ ...prev, brands: [...prev.brands, newId] }));
      setNewBrandName('');
      setTimeout(() => {
        setNewlyAdded(prev => ({ ...prev, brands: prev.brands.filter(id => id !== newId) }));
      }, 2000);
    }
  };

  const handleEditCategory = (id: string, newName: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleEditBrand = (id: string, newName: string) => {
    setBrands(brands.map(b => b.id === id ? { ...b, name: newName } : b));
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('هل تريد حذف هذه الفئة؟ سيتم نقل المنتجات إلى "غير مصنف"')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleDeleteBrand = (id: string) => {
    if (window.confirm('هل تريد حذف هذه العلامة التجارية؟')) {
      setBrands(brands.filter(b => b.id !== id));
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-bg-primary border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary bg-opacity-10">
              <FolderTree className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">إدارة الفئات والعلامات</h2>
              <p className="text-text-secondary text-sm flex items-center gap-1">
                <AlertCircle size={12} />
                انقر مرتين للتعديل السريع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary hover:text-text-primary"
            title="إغلاق (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-bg-secondary">
          <TabButton
            active={activeTab === 'categories'}
            onClick={() => {
              setActiveTab('categories');
              setSearchQuery('');
            }}
            icon={FolderTree}
            label="الفئات"
            count={categories.length}
            color="primary"
          />
          <TabButton
            active={activeTab === 'brands'}
            onClick={() => {
              setActiveTab('brands');
              setSearchQuery('');
            }}
            icon={Tag}
            label="العلامات التجارية"
            count={brands.length}
            color="accent"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'categories' ? (
            <div className="space-y-4">
              <AddSection
                placeholder="مثال: هواتف، إكسسوارات، سماعات..."
                value={newCategoryName}
                onChange={setNewCategoryName}
                onAdd={handleAddCategory}
                color="primary"
                icon={FolderTree}
                label="إضافة فئة جديدة"
                count={categories.length}
              />
              
              {categories.length > 3 && (
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="بحث في الفئات..."
                />
              )}

              <div className="space-y-2 mt-6">
                {filteredCategories.length === 0 && searchQuery ? (
                  <EmptyState
                    icon={Search}
                    title="لا توجد نتائج"
                    description={`لم يتم العثور على فئات تطابق "${searchQuery}"`}
                  />
                ) : filteredCategories.length === 0 ? (
                  <EmptyState
                    icon={FolderTree}
                    title="لا توجد فئات بعد"
                    description="أضف فئة أولى لتنظيم منتجاتك"
                  />
                ) : (
                  filteredCategories.map(category => (
                    <EditableItem
                      key={category.id}
                      item={category}
                      icon={FolderTree}
                      color="primary"
                      onEdit={handleEditCategory}
                      onDelete={handleDeleteCategory}
                      isNew={newlyAdded.categories.includes(category.id)}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AddSection
                placeholder="مثال: Samsung، Apple، Xiaomi..."
                value={newBrandName}
                onChange={setNewBrandName}
                onAdd={handleAddBrand}
                color="accent"
                icon={Tag}
                label="إضافة علامة تجارية"
                count={brands.length}
              />
              
              {brands.length > 3 && (
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="بحث في العلامات..."
                />
              )}

              <div className="space-y-2 mt-6">
                {filteredBrands.length === 0 && searchQuery ? (
                  <EmptyState
                    icon={Search}
                    title="لا توجد نتائج"
                    description={`لم يتم العثور على علامات تطابق "${searchQuery}"`}
                  />
                ) : filteredBrands.length === 0 ? (
                  <EmptyState
                    icon={Tag}
                    title="لا توجد علامات تجارية بعد"
                    description="أضف علامة تجارية لتسهيل البحث"
                  />
                ) : (
                  filteredBrands.map(brand => (
                    <EditableItem
                      key={brand.id}
                      item={brand}
                      icon={Tag}
                      color="accent"
                      onEdit={handleEditBrand}
                      onDelete={handleDeleteBrand}
                      isNew={newlyAdded.brands.includes(brand.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-bg-secondary">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-all font-semibold"
          >
            تم
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-once {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-once {
          animation: pulse-once 1s ease-in-out 2;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
