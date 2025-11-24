import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react';

/*
  Context alinhado ao modelo de banco
  cart = bag
*/

const StorefrontContext = createContext(null);

/* =========================================================
   MOCK DATA alinhado ao banco
   ========================================================= */

// user
const initialUser = {
  id: 'user-001',
  name: 'Ana Luiza',
  phone: '(11) 98888-7777',
  email: 'ana.luiza@email.com',
  status: 'active',
  created_at: '2024-01-10T12:00:00Z',
  password: 'hashed-only-mock',
};

// user_address
const initialAddresses = [
  {
    id: 'addr-home',
    user_id: initialUser.id,
    street: 'Rua Frei Caneca',
    street_number: '1010',
    neighborhood_id: 'nbh-consolacao',
    city: 'São Paulo',
    zip_code: '01307-003',
    complement: 'Apto 53B',
    geo_lat: -23.5578,
    geo_lng: -46.6561,
    is_default: true, // campo extra de front para facilitar
  },
  {
    id: 'addr-work',
    user_id: initialUser.id,
    street: 'Av. Paulista',
    street_number: '1374',
    neighborhood_id: 'nbh-bela-vista',
    city: 'São Paulo',
    zip_code: '01310-100',
    complement: '12º andar',
    geo_lat: -23.5615,
    geo_lng: -46.6559,
    is_default: false,
  },
];

// tenant
const initialTenant = {
  id: 'tenant-aurora',
  owner_user_id: initialUser.id,
  name: 'Aurora Burger & Co.',
  main_color: '#fd2c08ff',
  cnpj_cpf: '00.000.000/0001-00',
  address: 'Rua das Palmeiras, 123, SP',
  geo_lat: -23.561,
  geo_lng: -46.654,
  is_open: true,
  working_hours: '18:00-23:30',
  accepts_cash: true,
  delivery_method: 'own', // own | pool
  service_fee_percentage: 0.08,
  created_at: '2024-01-01T10:00:00Z',
  status: 'active',
  email: 'aurora@burger.com',
  password: 'hashed-only-mock',
  slug: 'aurora-burger',
  photo_url:
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',

  // extras de front que não precisam ir ao banco
  description:
    'Smash burgers autorais, acompanhamentos incríveis e sobremesas com assinatura própria.',
  rating: 4.8,
  review_count: 1324,
  delivery_estimate_min: 25,
  delivery_estimate_max: 35,
  delivery_fee: 6.9,
  payment_channels: ['pix', 'card', 'cash'],
};

// neighborhood (preço de entrega por bairro)
const initialNeighborhoods = [
  {
    id: 'nbh-consolacao',
    user_address_id: 'addr-home',
    tenant_id: initialTenant.id,
    name: 'Consolação',
    price: 6.9,
  },
  {
    id: 'nbh-bela-vista',
    user_address_id: 'addr-work',
    tenant_id: initialTenant.id,
    name: 'Bela Vista',
    price: 7.9,
  },
];

// menu_category
const initialMenuCategories = [
  { id: 'cat-combos', tenant_id: initialTenant.id, name: 'Combos autorais', order: 1 },
  { id: 'cat-burgers', tenant_id: initialTenant.id, name: 'Burgers artesanais', order: 2 },
  { id: 'cat-sides', tenant_id: initialTenant.id, name: 'Acompanhamentos', order: 3 },
  { id: 'cat-desserts', tenant_id: initialTenant.id, name: 'Sobremesas', order: 4 },
];

// menu_item
const initialMenuItems = [
  {
    id: 'item-combo-aurora',
    tenant_id: initialTenant.id,
    category_id: 'cat-combos',
    name: 'Combo Aurora Prime',
    description: 'Smash duplo 160g, queijo prato, maionese da casa, batata rústica e bebida.',
    price: 44.9,
    is_available: true,
    photo_url:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    highlights: ['Mais pedido'], // extra front
  },
  {
    id: 'item-combo-trufado',
    tenant_id: initialTenant.id,
    category_id: 'cat-combos',
    name: 'Combo Trufado',
    description: 'Burger angus com maionese trufada, cogumelos, batata canoa e chá gelado.',
    price: 48.9,
    is_available: true,
    photo_url:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80',
    highlights: ['Novo sabor'],
  },
  {
    id: 'item-burger-classic',
    tenant_id: initialTenant.id,
    category_id: 'cat-burgers',
    name: 'Aurora Classic',
    description: 'Burger 160g, cheddar inglês, picles e relish defumado.',
    price: 29.9,
    is_available: true,
    photo_url:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'item-burger-cheddar',
    tenant_id: initialTenant.id,
    category_id: 'cat-burgers',
    name: 'Cheddar Sunset',
    description: 'Blend 180g, cheddar inglês, cebola caramelizada e molho dijon.',
    price: 32.9,
    is_available: true,
    photo_url:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    highlights: ['Favorito da casa'],
  },
  {
    id: 'item-fries',
    tenant_id: initialTenant.id,
    category_id: 'cat-sides',
    name: 'Batata rústica com páprica',
    description: 'Porção 300g, finalizada com ervas frescas.',
    price: 18.9,
    is_available: true,
    photo_url:
      'https://images.unsplash.com/photo-1460306855393-0410f61241c7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'item-brownie',
    tenant_id: initialTenant.id,
    category_id: 'cat-desserts',
    name: 'Brownie com gelato',
    description: 'Brownie com nozes, calda de caramelo salgado e gelato de creme.',
    price: 22.9,
    is_available: true,
    photo_url:
      'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
  },
];

// option_group
const initialOptionGroups = [
  {
    id: 'grp-burger-extra',
    item_id: 'item-burger-classic',
    name: 'Extras',
    is_required: false,
    min: 0,
    max: 3,
  },
  {
    id: 'grp-combo-drink',
    item_id: 'item-combo-aurora',
    name: 'Escolha a bebida',
    is_required: true,
    min: 1,
    max: 1,
  },
];

// option
const initialOptions = [
  { id: 'opt-extra-bacon', group_id: 'grp-burger-extra', name: 'Bacon', additional_charge: 4.5 },
  { id: 'opt-extra-cheddar', group_id: 'grp-burger-extra', name: 'Cheddar', additional_charge: 3.9 },

  { id: 'opt-drink-cola', group_id: 'grp-combo-drink', name: 'Coca-Cola', additional_charge: 0 },
  { id: 'opt-drink-guarana', group_id: 'grp-combo-drink', name: 'Guaraná', additional_charge: 0 },
];

// banner
const initialBanners = [
  {
    id: 'bnr-1',
    tenant_id: initialTenant.id,
    banner_image:
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
    product_link: 'item-combo-aurora', // pode ser slug ou id, fica seu critério
    title: 'Festival Smash Aurora', // extra front
    subtitle: 'Combos com 20% OFF no aplicativo',
    description: 'Válido todos os dias após as 18h. Aproveite e acumule pontos.',
    badge: 'Exclusivo app',
  },
];

// cart (bag)
const initialCart = {
  id: 'cart-001',
  user_id: initialUser.id,
  tenant_id: initialTenant.id,
  subtotal: 0,
  delivery_fee: 0,
  total: 0,

  // extras de front
  notes: '',
  discount: 0,
  payment_channel: initialTenant.payment_channels[0],
  change: '',
  address_id:
    initialAddresses.find((a) => a.is_default)?.id || initialAddresses[0].id,
};

// cart_item
const initialCartItems = [];

// cart_item_option
const initialCartItemOptions = [];

// orders, status, order_item, order_item_option (mock simples)
const initialOrders = [
  {
    id: 'ord-1001',
    user_id: initialUser.id,
    tenant_id: initialTenant.id,
    address_id: 'addr-home',
    subtotal: 118.2,
    service_fee: 118.2 * initialTenant.service_fee_percentage,
    delivery_fee: initialTenant.delivery_fee,
    discount: 0,
    total: 118.2 + initialTenant.delivery_fee + 118.2 * initialTenant.service_fee_percentage,
    payment_channel: 'card',
    created_at: '2024-02-04T18:20:00Z',
    change: '',
  },
];

const initialStatuses = [
  {
    id: 'st-1',
    order_id: 'ord-1001',
    status: 'CREATED',
    created_at: '2024-02-04T18:20:00Z',
  },
  {
    id: 'st-2',
    order_id: 'ord-1001',
    status: 'PAYMENT_AUTHORIZED',
    created_at: '2024-02-04T18:21:00Z',
  },
  {
    id: 'st-3',
    order_id: 'ord-1001',
    status: 'IN_PREPARATION',
    created_at: '2024-02-04T18:25:00Z',
  },
];

const initialOrderItems = [
  {
    id: 'oit-1',
    order_id: 'ord-1001',
    item_id: 'item-combo-aurora',
    item_name_snapshot: 'Combo Aurora Prime',
    unit_price: 44.9,
    quantity: 1,
    notes: '',
    highlights: ['Mais pedido'],
  },
  {
    id: 'oit-2',
    order_id: 'ord-1001',
    item_id: 'item-burger-cheddar',
    item_name_snapshot: 'Cheddar Sunset',
    unit_price: 32.9,
    quantity: 2,
    notes: '',
    highlights: [],
  },
];

const initialOrderItemOptions = [
  // exemplo de opções que foram escolhidas num item do pedido
];

/* =========================================================
   HELPERS
   ========================================================= */

const indexById = (arr) =>
  arr.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

const getDeliveryFeeForAddress = (addressId, neighborhoods, addresses) => {
  const address = addresses.find((a) => a.id === addressId);
  if (!address) return 0;
  const neighborhood = neighborhoods.find((n) => n.id === address.neighborhood_id);
  return neighborhood?.price ?? 0;
};

const calcCartTotals = ({
  cart,
  cartItems,
  cartItemOptions,
  menuItems,
  options,
  tenant,
  neighborhoods,
  addresses,
}) => {
  const menuItemMap = indexById(menuItems);
  const optionMap = indexById(options);

  const subtotal = cartItems.reduce((sum, ci) => {
    const base = menuItemMap[ci.item_id]?.price ?? 0;

    const selectedOptions = cartItemOptions.filter(
      (cio) => cio.cart_item_id === ci.id
    );

    const optionsTotal = selectedOptions.reduce((optSum, cio) => {
      return optSum + (optionMap[cio.option_id]?.additional_charge ?? 0);
    }, 0);

    return sum + (base + optionsTotal) * ci.quantity;
  }, 0);

  const serviceFee = subtotal * (tenant.service_fee_percentage || 0);
  const deliveryFee =
    cartItems.length > 0
      ? getDeliveryFeeForAddress(cart.address_id, neighborhoods, addresses)
      : 0;

  const discount = cart.discount || 0;
  const total = subtotal + serviceFee + deliveryFee - discount;

  return { subtotal, serviceFee, deliveryFee, discount, total };
};

/* =========================================================
   ACTIONS + REDUCER
   ========================================================= */

const actionMap = {
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_CART_ITEM: 'REMOVE_CART_ITEM',
  TOGGLE_CART_ITEM_OPTION: 'TOGGLE_CART_ITEM_OPTION',
  SET_CART_ADDRESS: 'SET_CART_ADDRESS',
  SET_CART_PAYMENT: 'SET_CART_PAYMENT',
  SET_CART_CHANGE: 'SET_CART_CHANGE',
  SET_CART_NOTES: 'SET_CART_NOTES',
  CLEAR_CART: 'CLEAR_CART',
  SAVE_ADDRESS: 'SAVE_ADDRESS',
  PLACE_ORDER: 'PLACE_ORDER',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionMap.ADD_TO_CART: {
      const { itemId, quantity = 1, notes = '' } = action.payload;
      if (quantity <= 0) return state;

      const existing = state.cartItems.find(
        (ci) => ci.item_id === itemId && ci.cart_id === state.cart.id
      );

      let cartItems = [...state.cartItems];

      if (existing) {
        cartItems = cartItems.map((ci) =>
          ci.id === existing.id
            ? { ...ci, quantity: ci.quantity + quantity }
            : ci
        );
      } else {
        cartItems.push({
          id: `ci-${Date.now()}`,
          cart_id: state.cart.id,
          item_id: itemId,
          quantity,
          notes,
        });
      }

      return { ...state, cartItems };
    }

    case actionMap.UPDATE_CART_ITEM: {
      const { cartItemId, quantity } = action.payload;
      let cartItems = state.cartItems.map((ci) =>
        ci.id === cartItemId ? { ...ci, quantity } : ci
      );
      cartItems = cartItems.filter((ci) => ci.quantity > 0);
      const cartItemOptions = state.cartItemOptions.filter(
        (cio) => cartItems.some((ci) => ci.id === cio.cart_item_id)
      );
      return { ...state, cartItems, cartItemOptions };
    }

    case actionMap.REMOVE_CART_ITEM: {
      const cartItemId = action.payload;
      const cartItems = state.cartItems.filter((ci) => ci.id !== cartItemId);
      const cartItemOptions = state.cartItemOptions.filter(
        (cio) => cio.cart_item_id !== cartItemId
      );
      return { ...state, cartItems, cartItemOptions };
    }

    case actionMap.TOGGLE_CART_ITEM_OPTION: {
      const { cartItemId, optionId } = action.payload;

      const exists = state.cartItemOptions.some(
        (cio) => cio.cart_item_id === cartItemId && cio.option_id === optionId
      );

      let cartItemOptions = [...state.cartItemOptions];

      if (exists) {
        cartItemOptions = cartItemOptions.filter(
          (cio) => !(cio.cart_item_id === cartItemId && cio.option_id === optionId)
        );
      } else {
        cartItemOptions.push({
          id: `cio-${Date.now()}`,
          cart_item_id: cartItemId,
          option_id: optionId,
        });
      }

      return { ...state, cartItemOptions };
    }

    case actionMap.SET_CART_ADDRESS:
      return {
        ...state,
        cart: { ...state.cart, address_id: action.payload },
      };

    case actionMap.SET_CART_PAYMENT:
      return {
        ...state,
        cart: { ...state.cart, payment_channel: action.payload },
      };

    case actionMap.SET_CART_CHANGE:
      return {
        ...state,
        cart: { ...state.cart, change: action.payload },
      };

    case actionMap.SET_CART_NOTES:
      return {
        ...state,
        cart: { ...state.cart, notes: action.payload },
      };

    case actionMap.CLEAR_CART:
      return {
        ...state,
        cartItems: [],
        cartItemOptions: [],
        cart: {
          ...state.cart,
          subtotal: 0,
          delivery_fee: 0,
          total: 0,
          discount: 0,
          notes: '',
          change: '',
        },
      };

    case actionMap.SAVE_ADDRESS: {
      const { address } = action.payload;
      const id = address.id || `addr-${Date.now()}`;
      const exists = state.addresses.some((a) => a.id === id);

      const addresses = exists
        ? state.addresses.map((a) => (a.id === id ? { ...address, id } : a))
        : [...state.addresses, { ...address, id }];

      const updated = addresses.map((a) => ({
        ...a,
        is_default: address.is_default ? a.id === id : a.is_default,
      }));

      return {
        ...state,
        addresses: updated,
        cart: {
          ...state.cart,
          address_id: address.is_default ? id : state.cart.address_id || id,
        },
      };
    }

    case actionMap.PLACE_ORDER: {
      const { order, statuses, orderItems, orderItemOptions } = action.payload;

      return {
        ...state,
        orders: [order, ...state.orders],
        statuses: [...statuses, ...state.statuses],
        orderItems: [...orderItems, ...state.orderItems],
        orderItemOptions: [...orderItemOptions, ...state.orderItemOptions],
        cartItems: [],
        cartItemOptions: [],
        cart: {
          ...state.cart,
          subtotal: 0,
          delivery_fee: 0,
          total: 0,
          discount: 0,
          notes: '',
          change: '',
        },
      };
    }

    default:
      return state;
  }
};

/* =========================================================
   PROVIDER + API DO CONTEXTO
   ========================================================= */

export const StorefrontProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    tenant: initialTenant,
    banners: initialBanners,
    menuCategories: initialMenuCategories,
    menuItems: initialMenuItems,
    optionGroups: initialOptionGroups,
    options: initialOptions,
    neighborhoods: initialNeighborhoods,
    user: initialUser,
    addresses: initialAddresses,
    cart: initialCart,
    cartItems: initialCartItems,
    cartItemOptions: initialCartItemOptions,
    orders: initialOrders,
    statuses: initialStatuses,
    orderItems: initialOrderItems,
    orderItemOptions: initialOrderItemOptions,
  });

  const maps = useMemo(() => {
    return {
      menuItemMap: indexById(state.menuItems),
      categoryMap: indexById(state.menuCategories),
      optionGroupMap: indexById(state.optionGroups),
      optionMap: indexById(state.options),
      addressMap: indexById(state.addresses),
      neighborhoodMap: indexById(state.neighborhoods),
    };
  }, [
    state.menuItems,
    state.menuCategories,
    state.optionGroups,
    state.options,
    state.addresses,
    state.neighborhoods,
  ]);

  const cartTotals = useMemo(() => {
    return calcCartTotals({
      cart: state.cart,
      cartItems: state.cartItems,
      cartItemOptions: state.cartItemOptions,
      menuItems: state.menuItems,
      options: state.options,
      tenant: state.tenant,
      neighborhoods: state.neighborhoods,
      addresses: state.addresses,
    });
  }, [
    state.cart,
    state.cartItems,
    state.cartItemOptions,
    state.menuItems,
    state.options,
    state.tenant,
    state.neighborhoods,
    state.addresses,
  ]);

  /* ------------ Selectors úteis para o front ------------ */

  const getMenuItemsByCategory = (categoryId) =>
    state.menuItems
      .filter((mi) => mi.category_id === categoryId)
      .sort((a, b) => a.name.localeCompare(b.name));

  const getOptionGroupsForItem = (itemId) =>
    state.optionGroups.filter((g) => g.item_id === itemId);

  const getOptionsForGroup = (groupId) =>
    state.options.filter((o) => o.group_id === groupId);

  const getCartDetailedItems = () => {
    return state.cartItems.map((ci) => {
      const item = maps.menuItemMap[ci.item_id];
      const selectedOptions = state.cartItemOptions
        .filter((cio) => cio.cart_item_id === ci.id)
        .map((cio) => maps.optionMap[cio.option_id])
        .filter(Boolean);

      const optionsTotal = selectedOptions.reduce(
        (sum, o) => sum + (o.additional_charge || 0),
        0
      );

      return {
        ...ci,
        item,
        selectedOptions,
        unit_price_with_options: (item?.price || 0) + optionsTotal,
        line_total: ((item?.price || 0) + optionsTotal) * ci.quantity,
      };
    });
  };

  const getOrderDetailed = (orderId) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const items = state.orderItems
      .filter((oi) => oi.order_id === orderId)
      .map((oi) => {
        const opts = state.orderItemOptions
          .filter((oio) => oio.order_item_id === oi.id)
          .map((oio) => ({
            ...oio,
            option: maps.optionMap[oio.option_id],
          }));

        return { ...oi, options: opts };
      });

    const timeline = state.statuses
      .filter((s) => s.order_id === orderId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return { order, items, timeline };
  };

  /* ------------ Actions para você testar no front ------------ */

  const addToCart = (itemId, quantity = 1, notes = '') =>
    dispatch({
      type: actionMap.ADD_TO_CART,
      payload: { itemId, quantity, notes },
    });

  const updateCartItem = (cartItemId, quantity) =>
    dispatch({
      type: actionMap.UPDATE_CART_ITEM,
      payload: { cartItemId, quantity },
    });

  const removeCartItem = (cartItemId) =>
    dispatch({
      type: actionMap.REMOVE_CART_ITEM,
      payload: cartItemId,
    });

  const toggleOptionInCartItem = (cartItemId, optionId) =>
    dispatch({
      type: actionMap.TOGGLE_CART_ITEM_OPTION,
      payload: { cartItemId, optionId },
    });

  const setCartAddress = (addressId) =>
    dispatch({
      type: actionMap.SET_CART_ADDRESS,
      payload: addressId,
    });

  const setCartPaymentChannel = (channel) =>
    dispatch({
      type: actionMap.SET_CART_PAYMENT,
      payload: channel,
    });

  const setCartChangeFor = (value) =>
    dispatch({
      type: actionMap.SET_CART_CHANGE,
      payload: value,
    });

  const setCartNotes = (notes) =>
    dispatch({
      type: actionMap.SET_CART_NOTES,
      payload: notes,
    });

  const saveAddress = (address) => {
    const id = address.id || `addr-${Date.now()}`;
    dispatch({
      type: actionMap.SAVE_ADDRESS,
      payload: { address: { ...address, id } },
    });
    return id;
  };

  const placeOrder = () => {
    if (!state.cartItems.length) return null;

    const now = new Date();
    const orderId = `ord-${now.getTime()}`;

    const order = {
      id: orderId,
      user_id: state.user.id,
      tenant_id: state.tenant.id,
      address_id: state.cart.address_id,
      subtotal: cartTotals.subtotal,
      service_fee: cartTotals.serviceFee,
      delivery_fee: cartTotals.deliveryFee,
      discount: cartTotals.discount,
      total: cartTotals.total,
      payment_channel: state.cart.payment_channel,
      created_at: now.toISOString(),
      change: state.cart.change,
    };

    const statuses = [
      {
        id: `st-${now.getTime()}-1`,
        order_id: orderId,
        status: 'CREATED',
        created_at: now.toISOString(),
      },
    ];

    const optionMap = maps.optionMap;

    const orderItems = state.cartItems.map((ci) => {
      const item = maps.menuItemMap[ci.item_id];
      return {
        id: `oit-${ci.id}`,
        order_id: orderId,
        item_id: ci.item_id,
        item_name_snapshot: item?.name || '',
        unit_price: item?.price || 0,
        quantity: ci.quantity,
        notes: ci.notes || '',
        highlights: item?.highlights || [],
      };
    });

    const orderItemOptions = state.cartItemOptions.map((cio) => {
      const opt = optionMap[cio.option_id];
      return {
        id: `oio-${cio.id}`,
        order_item_id: `oit-${cio.cart_item_id}`,
        option_id: cio.option_id,
        option_name_snapshot: opt?.name || '',
        additional_charge: opt?.additional_charge || 0,
      };
    });

    dispatch({
      type: actionMap.PLACE_ORDER,
      payload: { order, statuses, orderItems, orderItemOptions },
    });

    return orderId;
  };

  const value = useMemo(
    () => ({
      ...state,
      maps,
      cartTotals,

      // selectors
      getMenuItemsByCategory,
      getOptionGroupsForItem,
      getOptionsForGroup,
      getCartDetailedItems,
      getOrderDetailed,

      // actions
      addToCart,
      updateCartItem,
      removeCartItem,
      toggleOptionInCartItem,
      setCartAddress,
      setCartPaymentChannel,
      setCartChangeFor,
      setCartNotes,
      saveAddress,
      placeOrder,
    }),
    [
      state,
      maps,
      cartTotals,
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
