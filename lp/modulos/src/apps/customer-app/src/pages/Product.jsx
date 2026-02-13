import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../../shared/components/ui';
import { useStorefront } from '../../../../shared/generalContext.jsx';

const Product = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const { maps, addToCart, menuItems, getOptionGroupsForItem, getOptionsForGroup } = useStorefront();
  
  const product = useMemo(() => {
     return maps.menuItemMap[productSlug] || menuItems.find((mi) => mi.slug === productSlug);
  }, [productSlug, maps.menuItemMap, menuItems]);

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({}); // { groupId: [optionId] }
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [added, setAdded] = useState(false);

  // Resolve option groups (fallback to context if nested data missing)
  const optionGroups = useMemo(() => {
    if (!product) return [];
    
    // 1. Try nested DTO structure (camelCase from backend)
    if (product.optionGroups && product.optionGroups.length > 0) {
      return product.optionGroups;
    }

    // 2. Fallback to context data (snake_case normalization)
    const contextGroups = getOptionGroupsForItem(product.id);
    return contextGroups.map(g => ({
      ...g,
      // Normalize to match component expectations
      required: g.is_required, 
      minOptions: g.min,
      maxOptions: g.max,
      options: getOptionsForGroup(g.id).map(o => ({
        ...o,
        additionalPrice: o.additional_charge
      }))
    }));
  }, [product, getOptionGroupsForItem, getOptionsForGroup]);

  // Calculate total price including options
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    let total = product.price;
    
    Object.values(selectedOptions).flat().forEach(optId => {
      for (const group of optionGroups) {
        const option = group.options?.find(o => o.id === optId);
        if (option) {
          total += option.additionalPrice || 0;
          break;
        }
      }
    });

    return total * quantity;
  }, [product, selectedOptions, quantity, optionGroups]);

  const handleOptionToggle = (groupId, optionId, maxOptions) => {
    setSelectedOptions(prev => {
      const currentSelection = prev[groupId] || [];
      const isSelected = currentSelection.includes(optionId);
      
      let newSelection;
      if (maxOptions === 1) {
        // Radio behavior
        newSelection = [optionId];
      } else {
        // Checkbox behavior
        if (isSelected) {
          newSelection = currentSelection.filter(id => id !== optionId);
        } else {
          if (currentSelection.length >= maxOptions) return prev; // Max reached
          newSelection = [...currentSelection, optionId];
        }
      }

      return { ...prev, [groupId]: newSelection };
    });
  };

  const validateRequirements = () => {
    if (!optionGroups) return true;
    for (const group of optionGroups) {
      if (group.required) {
        const selectedCount = (selectedOptions[group.id] || []).length;
        if (selectedCount < (group.minOptions || 1)) {
          alert(`Selecione pelo menos ${group.minOptions || 1} opção(ões) em "${group.name}"`);
          return false;
        }
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateRequirements()) return;

    const flattenedOptions = Object.values(selectedOptions).flat();
    addToCart(product.id, quantity, notes, flattenedOptions);
    setFeedback(`${quantity}x ${product.name} adicionado à sacola`);
    setAdded(true);
    setTimeout(() => setFeedback(''), 3000);
  };

  if (!product) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow">
        <p className="text-4xl mb-3">🔍</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Produto não encontrado
        </h2>
        <p className="text-gray-600 mb-6">
          Talvez ele tenha saído do cardápio ou o link esteja incorreto.
        </p>
        <Link to="/app" className="text-[var(--accent-contrast)] font-semibold">
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <section className="rounded-3xl bg-white p-6 shadow space-y-6">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={product.photo_url}
            alt={product.name}
            className="h-80 w-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-400 uppercase tracking-[0.3em]">
            {maps.categoryMap[product.category_id]?.name}
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 text-lg">{product.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-3xl font-bold text-black">
              R$ {totalPrice.toFixed(2)}
            </p>
            {product.highlights?.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white"
              >
                {highlight}
              </span>
            ))}
          </div>

          {/* Option Groups Section */}
          <div className="space-y-6">
             {optionGroups.map(group => (
               <div key={group.id} className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <p className="text-xs text-gray-500">
                        {group.minOptions > 0 ? `Mínimo: ${group.minOptions}` : ''} 
                        {group.maxOptions ? ` · Máximo: ${group.maxOptions}` : ''}
                      </p>
                    </div>
                    {group.required && (
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase">
                        Obrigatório
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {group.options?.map(option => {
                      const isSelected = (selectedOptions[group.id] || []).includes(option.id);
                      return (
                        <label key={option.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-[var(--accent)] bg-orange-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[var(--accent)]' : 'border-gray-300'}`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />}
                             </div>
                             <span className="text-gray-900 font-medium">{option.name}</span>
                          </div>
                          {option.additionalPrice > 0 && (
                             <span className="text-gray-600 font-semibold">+ R$ {option.additionalPrice.toFixed(2)}</span>
                          )}
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={isSelected}
                            onChange={() => handleOptionToggle(group.id, option.id, group.maxOptions)}
                          />
                        </label>
                      );
                    })}
                  </div>
               </div>
             ))}
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              className="w-full rounded-xl border-gray-200 focus:border-[var(--accent)] focus:ring-[var(--accent)]"
              rows="2"
              placeholder="Ex: Tirar cebola, ponto da carne..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Cart Actions Panel */}
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow">
           <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-900">Quantidade</span>
              <div className="flex items-center gap-4 border rounded-full px-3 py-1">
                 <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-xl font-bold text-[var(--accent)]">-</button>
                 <span className="text-lg font-medium w-4 text-center">{quantity}</span>
                 <button onClick={() => setQuantity(q => q + 1)} className="text-xl font-bold text-[var(--accent)]">+</button>
              </div>
           </div>
           
           <Button 
             className="w-full h-12 text-lg"
             onClick={handleAddToCart}
           >
             Adicionar • R$ {totalPrice.toFixed(2)}
           </Button>
           
           {feedback && (
             <p className="mt-3 text-center text-sm font-medium text-[var(--accent)] animate-pulse">
               {feedback}
             </p>
           )}
        </div>
      </div>
    </div>
  );
};

export default Product;
