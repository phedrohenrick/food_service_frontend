import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react';

const StorefrontContext = createContext(null);

const initialStore = {
  id: 'tenant-aurora',
  slug: 'aurora-burger',
  name: 'Aurora Burger & Co.',
  description:
    'Smash burgers autorais, acompanhamentos incríveis e sobremesas com assinatura própria.',
  isOpen: true,
  heroImage:
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
  logoImage:
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=200&q=80',
  rating: 4.8,
  reviewCount: 1324,
  deliveryEstimate: { min: 25, max: 35 },
  deliveryFee: 6.9,
  serviceFee: 0.08,
  mainColor: '#ff5e00ff',
  paymentChannels: ['pix', 'cartao', 'dinheiro'],
  banners: [
    {
      id: 'bnr-1',
      title: 'Festival Smash Aurora',
      subtitle: 'Combos com 20% OFF no aplicativo',
      description: 'Válido todos os dias após as 18h. Aproveite e acumule pontos.',
      image:
        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
      badge: 'Exclusivo app',
      productSlug: 'combo-aurora',
    },
  ],
  categories: [
    {
      id: 'combos',
      name: 'Combos autorais',
      description: 'Combinações perfeitas com bebida e acompanhamento.',
      items: [
        {
          id: 'combo-aurora',
          slug: 'combo-aurora',
          name: 'Combo Aurora Prime',
          description:
            'Smash duplo 160g, queijo prato, maionese da casa, batata rústica e bebida.',
          price: 44.9,
          available: true,
          image:
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
          highlights: ['Mais pedido'],
        },
        {
          id: 'combo-trufado',
          slug: 'combo-trufado',
          description:
            'Burger angus com maionese trufada, cogumelos, batata canoa e chá gelado.',
          price: 48.9,
          available: true,
          image:
            'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80',
          highlights: ['Novo sabor'],
        },
      ],
    },
    {
      id: 'burgers',
      name: 'Burger artesanais',
      description: 'Blends próprios com pão brioche tostado.',
      items: [
        {
          id: 'burger-classic',
          slug: 'burger-classic',
          name: 'Aurora Classic',
          description: 'Burger 160g, queijo cheddar inglês, picles e relish defumado.',
          price: 29.9,
          available: true,
          image:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        },
        {
          id: 'burger-veggie',
          slug: 'burger-veggie',
          name: 'Veggie do Jardins',
          description: 'Hambúrguer de grão-de-bico, queijo minas meia cura e aioli de beterraba.',
          price: 31.5,
          available: true,
          image:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        },
         {
          id: 'burger-veggie',
          slug: 'burger-veggie',
          name: 'Veggie do Jardins',
          description: 'Hambúrguer de grão-de-bico, queijo minas meia cura e aioli de beterraba.',
          price: 31.5,
          available: true,
          image:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        },
         {
          id: 'burger-veggie',
          slug: 'burger-veggie',
          name: 'Veggie do Jardins',
          description: 'Hambúrguer de grão-de-bico, queijo minas meia cura e aioli de beterraba.',
          price: 31.5,
          available: true,
          image:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        },
         {
          id: 'burger-veggie',
          slug: 'burger-veggie',
          name: 'Veggie do Jardins',
          description: 'Hambúrguer de grão-de-bico, queijo minas meia cura e aioli de beterraba.',
          price: 31.5,
          available: true,
          image:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        },
        {
          id: 'burger-cheddar',
          slug: 'burger-cheddar',
          name: 'Cheddar Sunset',
          description: 'Blend 180g, cheddar inglês, cebola caramelizada e molho dijon.',
          price: 32.9,
          available: true,
          image:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
          highlights: ['Favorito da casa'],
        },
      ],
    },
    {
      id: 'sides',
      name: 'Acompanhamentos',
      description: 'Para compartilhar ou acompanhar seu burger.',
      items: [
        {
          id: 'fries',
          slug: 'batata-rustica',
          name: 'Batata rústica com páprica',
          description: 'Porção 300g, finalizada com ervas frescas.',
          price: 18.9,
          available: true,
          image:
            'https://images.unsplash.com/photo-1460306855393-0410f61241c7?auto=format&fit=crop&w=800&q=80',
        },
        {
          id: 'onion-rings',
          slug: 'onion-rings',
          name: 'Onion Rings crocante',
          description: 'Cebolas empanadas duplamente com maionese defumada.',
          price: 20.5,
          available: true,
          image:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        },
        {
          id: 'combo-aurora',
          slug: 'combo-aurora',
          name: 'Combo Aurora Prime',
          description:
            'Smash duplo 160g, queijo prato, maionese da casa, batata rústica e bebida.',
          price: 44.9,
          available: true,
          image:
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
          highlights: ['Mais pedido', 'Entrega rápida'],
        },
        {
          id: 'onion-rings',
          slug: 'onion-rings',
          name: 'Onion Rings crocante',
          description: 'Cebolas empanadas duplamente com maionese defumada.',
          price: 20.5,
          available: true,
          image:
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        },
      
      ],
    },
    {
      id: 'desserts',
      name: 'Sobremesas',
      description: 'Feitas na própria cozinha para finalizar a noite.',
      items: [
        {
          id: 'brownie',
          slug: 'brownie-gelato',
          name: 'Brownie com gelato',
          description: 'Brownie com nozes, calda de caramelo salgado e gelato de creme.',
          price: 22.9,
          available: true,
          image:
            'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
  ],
};

const initialUser = {
  id: 'user-001',
  name: 'Ana Luiza',
  email: 'ana.luiza@email.com',
  phone: '(11) 98888-7777',
  status: 'active',
  addresses: [
    {
      id: 'addr-home',
      label: 'Casa',
      street: 'Rua Frei Caneca',
      streetNumber: '1010',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01307-003',
      complement: 'Apto 53B',
      geoLat: -23.5578,
      geoLng: -46.6561,
      isDefault: true,
    },
    {
      id: 'addr-work',
      label: 'Escritório',
      street: 'Av. Paulista',
      streetNumber: '1374',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      complement: '12º andar',
      geoLat: -23.5615,
      geoLng: -46.6559,
      isDefault: false,
    },
  ],
};

const initialOrders = [
  {
    id: 'FS-2048',
    tenantId: initialStore.id,
    status: 'EM_PREPARO',
    createdAt: '2024-02-04T18:20:00Z',
    paymentChannel: 'cartao',
    subtotal: 118.2,
    deliveryFee: initialStore.deliveryFee,
    serviceFee: 118.2 * initialStore.serviceFee,
    discount: 0,
    total: 118.2 + initialStore.deliveryFee + 118.2 * initialStore.serviceFee,
    addressId: 'addr-home',
    items: [
      {
        id: 'order-item-1',
        name: 'Combo Aurora Prime',
        quantity: 1,
        unitPrice: 44.9,
      },
      {
        id: 'order-item-2',
        name: 'Cheddar Sunset',
        quantity: 2,
        unitPrice: 32.9,
      },
    ],
    timeline: [
      { status: 'CRIADO', label: 'Pedido criado', timestamp: '2024-02-04T18:20:00Z', completed: true },
      {
        status: 'PAGAMENTO_AUTORIZADO',
        label: 'Pagamento aprovado',
        timestamp: '2024-02-04T18:21:00Z',
        completed: true,
      },
      {
        status: 'EM_PREPARO',
        label: 'Em preparo',
        timestamp: '2024-02-04T18:25:00Z',
        completed: true,
      },
      {
        status: 'EM_ROTA',
        label: 'Saiu para entrega',
        timestamp: null,
        completed: false,
      },
      {
        status: 'ENTREGUE',
        label: 'Entregue',
        timestamp: null,
        completed: false,
      },
    ],
  },
];

const createInitialCart = (user, store) => ({
  tenantId: store.id,
  items: [],
  notes: '',
  selectedAddressId: user.addresses.find((address) => address.isDefault)?.id || user.addresses[0]?.id,
  paymentChannel: store.paymentChannels[0],
  changeFor: '',
  discount: 0,
});

const calculateTotals = (cart, store) => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = subtotal * store.serviceFee;
  const deliveryFee = cart.items.length ? store.deliveryFee : 0;
  const total = subtotal + serviceFee + deliveryFee - (cart.discount || 0);
  return {
    subtotal,
    serviceFee,
    deliveryFee,
    discount: cart.discount || 0,
    total,
  };
};

const flattenProducts = (store) => {
  const slugMap = new Map();
  const idMap = new Map();
  store.categories.forEach((category) => {
    category.items.forEach((item) => {
      const enriched = { ...item, categoryId: category.id, categoryName: category.name };
      slugMap.set(item.slug, enriched);
      idMap.set(item.id, enriched);
    });
  });
  return { slugMap, idMap };
};

const actionMap = {
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_CART_ITEM: 'REMOVE_CART_ITEM',
  SET_CART_ADDRESS: 'SET_CART_ADDRESS',
  SET_CART_PAYMENT: 'SET_CART_PAYMENT',
  SET_CART_CHANGE: 'SET_CART_CHANGE',
  SET_CART_NOTES: 'SET_CART_NOTES',
  CLEAR_CART: 'CLEAR_CART',
  SAVE_ADDRESS: 'SAVE_ADDRESS',
  PLACE_ORDER: 'PLACE_ORDER',
};

const storefrontReducer = (state, action) => {
  switch (action.type) {
    case actionMap.ADD_TO_CART: {
      const { product, quantity } = action.payload;
      const existingIndex = state.cart.items.findIndex(
        (item) => item.productId === product.id
      );
      let updatedItems = [...state.cart.items];

      if (existingIndex >= 0) {
        const existing = updatedItems[existingIndex];
        updatedItems[existingIndex] = {
          ...existing,
          quantity: existing.quantity + quantity,
        };
      } else {
        updatedItems.push({
          id: `cart-item-${Date.now()}`,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          quantity,
        });
      }

      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
        },
      };
    }

    case actionMap.UPDATE_CART_ITEM: {
      const { id, quantity } = action.payload;
      const updatedItems = state.cart.items
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);
      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
        },
      };
    }

    case actionMap.REMOVE_CART_ITEM: {
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter((item) => item.id !== action.payload),
        },
      };
    }

    case actionMap.SET_CART_ADDRESS:
      return {
        ...state,
        cart: { ...state.cart, selectedAddressId: action.payload },
      };

    case actionMap.SET_CART_PAYMENT:
      return {
        ...state,
        cart: { ...state.cart, paymentChannel: action.payload },
      };

    case actionMap.SET_CART_CHANGE:
      return {
        ...state,
        cart: { ...state.cart, changeFor: action.payload },
      };

    case actionMap.SET_CART_NOTES:
      return {
        ...state,
        cart: { ...state.cart, notes: action.payload },
      };

    case actionMap.CLEAR_CART:
      return {
        ...state,
        cart: createInitialCart(state.user, state.store),
      };

    case actionMap.SAVE_ADDRESS: {
      const { address } = action.payload;
      const exists = state.user.addresses.some((item) => item.id === address.id);
      const addresses = exists
        ? state.user.addresses.map((item) => (item.id === address.id ? address : item))
        : [...state.user.addresses, address];

      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        isDefault: address.isDefault ? addr.id === address.id : addr.isDefault,
      }));

      return {
        ...state,
        user: {
          ...state.user,
          addresses: updatedAddresses,
        },
        cart: {
          ...state.cart,
          selectedAddressId: address.isDefault
            ? address.id
            : state.cart.selectedAddressId || address.id,
        },
      };
    }

    case actionMap.PLACE_ORDER:
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        cart: createInitialCart(state.user, state.store),
      };

    default:
      return state;
  }
};

export const StorefrontProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storefrontReducer, {
    store: initialStore,
    user: initialUser,
    orders: initialOrders,
    cart: createInitialCart(initialUser, initialStore),
  });

  const productMaps = useMemo(() => flattenProducts(state.store), [state.store]);

  const cartTotals = useMemo(
    () => calculateTotals(state.cart, state.store),
    [state.cart, state.store]
  );

  const addToCart = (productIdOrSlug, quantity = 1) => {
    const product =
      productMaps.idMap.get(productIdOrSlug) ||
      productMaps.slugMap.get(productIdOrSlug);
    if (!product || quantity <= 0) return;

    dispatch({
      type: actionMap.ADD_TO_CART,
      payload: { product, quantity },
    });
  };

  const updateCartItem = (id, quantity) =>
    dispatch({ type: actionMap.UPDATE_CART_ITEM, payload: { id, quantity } });

  const removeCartItem = (id) =>
    dispatch({ type: actionMap.REMOVE_CART_ITEM, payload: id });

  const setCartAddress = (addressId) =>
    dispatch({ type: actionMap.SET_CART_ADDRESS, payload: addressId });

  const setCartPaymentChannel = (channel) =>
    dispatch({ type: actionMap.SET_CART_PAYMENT, payload: channel });

  const setCartChangeFor = (value) =>
    dispatch({ type: actionMap.SET_CART_CHANGE, payload: value });

  const setCartNotes = (notes) =>
    dispatch({ type: actionMap.SET_CART_NOTES, payload: notes });

  const saveAddress = (address) => {
    const id = address.id || `addr-${Date.now()}`;
    dispatch({
      type: actionMap.SAVE_ADDRESS,
      payload: { address: { ...address, id } },
    });
    return id;
  };

  const placeOrder = () => {
    if (!state.cart.items.length) return null;
    const now = new Date();
    const orderId = `FS-${now.getTime().toString().slice(-4)}`;
    const timeline = [
      {
        status: 'CRIADO',
        label: 'Pedido criado',
        timestamp: now.toISOString(),
        completed: true,
      },
      {
        status: 'PAGAMENTO_AUTORIZADO',
        label: 'Pagamento autorizado',
        timestamp: null,
        completed: false,
      },
      {
        status: 'EM_PREPARO',
        label: 'Em preparo',
        timestamp: null,
        completed: false,
      },
      {
        status: 'EM_ROTA',
        label: 'Saiu para entrega',
        timestamp: null,
        completed: false,
      },
      {
        status: 'ENTREGUE',
        label: 'Pedido entregue',
        timestamp: null,
        completed: false,
      },
    ];

    const order = {
      id: orderId,
      tenantId: state.store.id,
      status: 'CRIADO',
      createdAt: now.toISOString(),
      paymentChannel: state.cart.paymentChannel,
      changeFor: state.cart.changeFor,
      subtotal: cartTotals.subtotal,
      deliveryFee: cartTotals.deliveryFee,
      serviceFee: cartTotals.serviceFee,
      discount: cartTotals.discount,
      total: cartTotals.total,
      addressId: state.cart.selectedAddressId,
      items: state.cart.items.map((item) => ({
        id: item.id,
        menuItemId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      timeline,
    };

    dispatch({ type: actionMap.PLACE_ORDER, payload: order });
    return orderId;
  };

  const value = useMemo(
    () => ({
      ...state,
      cartTotals,
      productMaps,
      addToCart,
      updateCartItem,
      removeCartItem,
      setCartAddress,
      setCartPaymentChannel,
      setCartChangeFor,
      setCartNotes,
      saveAddress,
      placeOrder,
    }),
    [
      state,
      cartTotals,
      productMaps,
      addToCart,
      updateCartItem,
      removeCartItem,
      setCartAddress,
      setCartPaymentChannel,
      setCartChangeFor,
      setCartNotes,
      saveAddress,
      placeOrder,
    ]
  );

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
};

export const useStorefront = () => {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error('useStorefront must be used inside StorefrontProvider');
  }
  return context;
};
