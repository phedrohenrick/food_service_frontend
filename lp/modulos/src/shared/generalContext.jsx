import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import api from './services/api';

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
  id: 1,
  name: 'Ana Luiza',
  phone: '(11) 98888-7777',
  email: 'ana.luiza@email.com',
  status: 'active',
  created_at: '2024-01-10T12:00:00Z',
  password: 'hashed-only-mock',
};

// user_address
const initialAddresses = [];

// tenant
const initialTenant = {
  id: 1,
  owner_user_id: initialUser.id,
  name: 'Aurora Burger & Co.',
  main_color: '#e94600ff',
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
  id: null,
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
  address_id: null,
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
    created_at: '2025-11-24T18:20:00Z',
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
  SET_ADDRESSES: 'SET_ADDRESSES',
  PLACE_ORDER: 'PLACE_ORDER',
  UPDATE_TENANT: 'UPDATE_TENANT',
  ADD_ORDER_STATUS: 'ADD_ORDER_STATUS',
  UPSERT_MENU_CATEGORY: 'UPSERT_MENU_CATEGORY',
  REORDER_MENU_CATEGORIES: 'REORDER_MENU_CATEGORIES',
  UPSERT_MENU_ITEM: 'UPSERT_MENU_ITEM',
  DELETE_MENU_ITEM: 'DELETE_MENU_ITEM',
  TOGGLE_MENU_ITEM_AVAILABILITY: 'TOGGLE_MENU_ITEM_AVAILABILITY',
  UPSERT_OPTION_GROUP: 'UPSERT_OPTION_GROUP',
  DELETE_OPTION_GROUP: 'DELETE_OPTION_GROUP',
  UPSERT_OPTION: 'UPSERT_OPTION',
  DELETE_OPTION: 'DELETE_OPTION',
  UPSERT_BANNER: 'UPSERT_BANNER',
  DELETE_BANNER: 'DELETE_BANNER',
  UPSERT_NEIGHBORHOOD: 'UPSERT_NEIGHBORHOOD',
  DELETE_NEIGHBORHOOD: 'DELETE_NEIGHBORHOOD',
  SET_CART: 'SET_CART',
  DELETE_ADDRESS: 'DELETE_ADDRESS',
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionMap.DELETE_ADDRESS: {
      const id = action.payload;
      const addresses = state.addresses.filter((a) => a.id !== id);
      const cart = state.cart.address_id === id 
        ? { ...state.cart, address_id: null } 
        : state.cart;
      return { ...state, addresses, cart };
    }
    case actionMap.SET_CART:
      return {
        ...state,
        cart: { ...state.cart, ...action.payload },
      };

    case actionMap.ADD_TO_CART: {
      const { itemId, quantity = 1, notes = '', selectedOptionIds = [] } = action.payload;
      if (quantity <= 0) return state;

      const newId = `ci-${Date.now()}-${state.cartItems.length}`;

      const cartItems = [
        ...state.cartItems,
        {
          id: newId,
          cart_id: state.cart.id,
          item_id: itemId,
          quantity,
          notes,
        },
      ];

      const newOptions = selectedOptionIds.map((optionId, index) => ({
        id: `cio-${Date.now()}-${optionId}-${index}`,
        cart_item_id: newId,
        option_id: optionId,
      }));

      const cartItemOptions = [...state.cartItemOptions, ...newOptions];

      return { ...state, cartItems, cartItemOptions };
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

    case actionMap.SET_ADDRESSES: {
      const { addresses } = action.payload || {};
      const list = Array.isArray(addresses) ? addresses : [];
      const defaultAddress =
        list.find((a) => a.is_default) || list[0] || null;

      return {
        ...state,
        addresses: list,
        cart: defaultAddress
          ? { ...state.cart, address_id: defaultAddress.id }
          : state.cart,
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

    case actionMap.UPDATE_TENANT: {
      const partial = action.payload || {};
      return {
        ...state,
        tenant: { ...state.tenant, ...partial },
      };
    }

    case actionMap.ADD_ORDER_STATUS: {
      const { orderId, status } = action.payload;
      if (!orderId || !status) return state;
      const id = `st-${Date.now()}`;
      const created_at = new Date().toISOString();
      const last = state.statuses
        .filter((s) => s.order_id === orderId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      // Evitar adicionar após COMPLETED ou CANCELED
      if (last && (last.status === 'COMPLETED' || last.status === 'CANCELED')) {
        return state;
      }
      return {
        ...state,
        statuses: [
          ...state.statuses,
          { id, order_id: orderId, status, created_at },
        ],
      };
    }

    // ---------------------- MENU: Categorias ----------------------
    case actionMap.UPSERT_MENU_CATEGORY: {
      const cat = action.payload;
      const id = cat.id || `cat-${Date.now()}`;
      const idx = state.menuCategories.findIndex((c) => c.id === id);
      const next = { ...cat, id, tenant_id: cat.tenant_id || state.tenant.id };
      let menuCategories;
      if (idx >= 0) {
        menuCategories = state.menuCategories.map((c) => (c.id === id ? { ...c, ...next } : c));
      } else {
        const maxOrder = Math.max(0, ...state.menuCategories.map((c) => c.order || 0));
        menuCategories = [...state.menuCategories, { ...next, order: next.order ?? maxOrder + 1 }];
      }
      return { ...state, menuCategories };
    }
    case actionMap.REORDER_MENU_CATEGORIES: {
      const ids = action.payload; // array de ids na nova ordem
      const orderMap = new Map(ids.map((id, i) => [id, i + 1]));
      const menuCategories = state.menuCategories.map((c) => ({
        ...c,
        order: orderMap.get(c.id) ?? c.order,
      }));
      return { ...state, menuCategories };
    }

    // ---------------------- MENU: Itens ----------------------
    case actionMap.UPSERT_MENU_ITEM: {
      const item = action.payload;
      // Backend integration is handled in the action creator (middleware pattern simulation)
      // but here we update the store optimistically or with the result
      const id = item.id; 
      const idx = state.menuItems.findIndex((mi) => mi.id === id);
      const next = {
        ...item,
        tenant_id: item.tenant_id || state.tenant.id,
        is_available: item.is_available ?? true,
      };
      const menuItems = idx >= 0
        ? state.menuItems.map((mi) => (mi.id === id ? { ...mi, ...next } : mi))
        : [...state.menuItems, next];
      return { ...state, menuItems };
    }
    case actionMap.DELETE_MENU_ITEM: {
      const itemId = action.payload;
      const menuItems = state.menuItems.filter((mi) => mi.id !== itemId);
      // Remover grupos e opções ligados ao item
      const optionGroups = state.optionGroups.filter((g) => g.item_id !== itemId);
      const removedGroupIds = new Set(state.optionGroups.filter((g) => g.item_id === itemId).map((g) => g.id));
      const options = state.options.filter((o) => !removedGroupIds.has(o.group_id));
      return { ...state, menuItems, optionGroups, options };
    }
    case actionMap.TOGGLE_MENU_ITEM_AVAILABILITY: {
      const itemId = action.payload;
      const menuItems = state.menuItems.map((mi) =>
        mi.id === itemId ? { ...mi, is_available: !mi.is_available } : mi
      );
      return { ...state, menuItems };
    }

    // ---------------------- MENU: Grupos de opção ----------------------
    case actionMap.UPSERT_OPTION_GROUP: {
      const grp = action.payload;
      const id = grp.id || `grp-${Date.now()}`;
      const idx = state.optionGroups.findIndex((g) => g.id === id);
      const next = {
        ...grp,
        id,
        is_required: grp.is_required ?? false,
        min: grp.min ?? 0,
        max: grp.max ?? 1,
      };
      const optionGroups = idx >= 0
        ? state.optionGroups.map((g) => (g.id === id ? { ...g, ...next } : g))
        : [...state.optionGroups, next];
      return { ...state, optionGroups };
    }
    case actionMap.DELETE_OPTION_GROUP: {
      const groupId = action.payload;
      const optionGroups = state.optionGroups.filter((g) => g.id !== groupId);
      const options = state.options.filter((o) => o.group_id !== groupId);
      return { ...state, optionGroups, options };
    }

    // ---------------------- MENU: Opções ----------------------
    case actionMap.UPSERT_OPTION: {
      const opt = action.payload;
      const id = opt.id || `opt-${Date.now()}`;
      const idx = state.options.findIndex((o) => o.id === id);
      const next = { ...opt, id, additional_charge: opt.additional_charge ?? 0 };
      const options = idx >= 0
        ? state.options.map((o) => (o.id === id ? { ...o, ...next } : o))
        : [...state.options, next];
      return { ...state, options };
    }
    case actionMap.DELETE_OPTION: {
      const optionId = action.payload;
      const options = state.options.filter((o) => o.id !== optionId);
      return { ...state, options };
    }

    // ---------------------- Banners ----------------------
    case actionMap.UPSERT_BANNER: {
      const b = action.payload;
      const id = b.id || `bnr-${Date.now()}`;
      const idx = state.banners.findIndex((x) => x.id === id);
      const next = { ...b, id, tenant_id: b.tenant_id || state.tenant.id };
      const banners = idx >= 0
        ? state.banners.map((x) => (x.id === id ? { ...x, ...next } : x))
        : [...state.banners, next];
      return { ...state, banners };
    }
    case actionMap.DELETE_BANNER: {
      const id = action.payload;
      const banners = state.banners.filter((b) => b.id !== id);
      return { ...state, banners };
    }

    // ---------------------- Neighborhoods ----------------------
    case actionMap.UPSERT_NEIGHBORHOOD: {
      const n = action.payload;
      const id = n.id || `nh-${Date.now()}`;
      const idx = state.neighborhoods.findIndex((x) => x.id === id);
      const next = { ...n, id, tenant_id: n.tenant_id || state.tenant.id };
      const neighborhoods = idx >= 0
        ? state.neighborhoods.map((x) => (x.id === id ? { ...x, ...next } : x))
        : [...state.neighborhoods, next];
      return { ...state, neighborhoods };
    }
    case actionMap.DELETE_NEIGHBORHOOD: {
      const id = action.payload;
      const neighborhoods = state.neighborhoods.filter((n) => n.id !== id);
      return { ...state, neighborhoods };
    }

    case actionMap.SET_DATA: {
      return {
        ...state,
        ...action.payload,
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

  const loadData = async () => {
    try {
      // ID fixo para demo ou pegar de configuração
      const tenantId = 1;
      const userId = 1; // Mock user ID for now

      // Carregamento paralelo de dados
      const [
        rawTenant,
        rawMenuCategories,
        rawMenuItems,
        rawOptionGroups,
        rawOptions,
        rawBanners,
        rawNeighborhoods,
        rawAddresses,
        rawUser,
        rawOrdersList,
        rawCart,
      ] = await Promise.all([
        api.get(`/tenants/${tenantId}`).catch(() => initialTenant),
        api.get(`/menu-categories?tenantId=${tenantId}`).catch(() => []),
        api.get(`/menu-items?tenantId=${tenantId}`).catch(() => []),
        api.get(`/option-groups?tenantId=${tenantId}`).catch(() => []),
        api.get(`/options?tenantId=${tenantId}`).catch(() => []),
        api.get(`/banners?tenantId=${tenantId}`).catch(() => []),
        api.get(`/neighborhoods?tenantId=${tenantId}`).catch(() => []),
        api.get(`/user-addresses/by-user/${userId}`).catch(() => []),
        api.get(`/users/${userId}`).catch(() => initialUser),
        api.get(`/orders/by-user/${userId}`).catch(() => []),
        api.get(`/cart?userId=${userId}&tenantId=${tenantId}`).catch(() => null),
      ]);

      // Fetch details for orders (items + timeline)
      const detailedOrders = await Promise.all(
        (Array.isArray(rawOrdersList) ? rawOrdersList : []).map(async (o) => {
             try {
                 const res = await api.get(`/orders/${o.id}`);
                 return res;
             } catch (e) {
                 return null;
             }
        })
      );
      
      const validDetailedOrders = detailedOrders.filter(Boolean);

      // Normalize User
      const user = rawUser ? {
          ...rawUser,
          created_at: rawUser.createdAt || rawUser.created_at,
      } : initialUser;

      // Normalize Orders, Items, Statuses
      const orders = [];
      const statuses = [];
      const orderItems = [];
      const orderItemOptions = [];

      validDetailedOrders.forEach(detailed => {
          const o = detailed.order;
          if(!o) return;

          // Order
          orders.push({
              ...o,
              user_id: o.userId || o.user_id,
              tenant_id: o.tenantId || o.tenant_id,
              address_id: o.addressId || o.address_id,
              payment_channel: o.paymentChannel || o.payment_channel,
              service_fee: o.serviceFee || o.service_fee,
              delivery_fee: o.deliveryFee || o.delivery_fee,
              created_at: o.createdAt || o.created_at,
              // Ensure numbers for calculations
              subtotal: Number(o.subtotal),
              service_fee: Number(o.serviceFee || o.service_fee),
              delivery_fee: Number(o.deliveryFee || o.delivery_fee),
              discount: Number(o.discount || 0),
              total: Number(o.total),
              change: o.change ? String(o.change) : '',
          });

          // Statuses
          if (detailed.timeline && Array.isArray(detailed.timeline)) {
              detailed.timeline.forEach(t => {
                  statuses.push({
                      id: t.id || `st-${Date.now()}-${Math.random()}`,
                      order_id: o.id,
                      status: t.status,
                      label: t.label, 
                      created_at: t.timestamp || t.created_at, // Critical for sort
                      timestamp: t.timestamp || t.created_at, // For OrderDetails.jsx
                      completed: t.completed
                  });
              });
          }

          // Items
          if (detailed.items && Array.isArray(detailed.items)) {
              detailed.items.forEach(i => {
                  orderItems.push({
                      id: i.id,
                      order_id: i.orderId || i.order_id,
                      item_id: i.itemId || i.item_id,
                      item_name_snapshot: i.itemNameSnapshot || i.item_name_snapshot,
                      unit_price: Number(i.unitPrice || i.unit_price),
                      quantity: i.quantity,
                      notes: i.notes,
                      highlights: i.highlights ? [i.highlights] : [],
                  });

                  if (i.options && Array.isArray(i.options)) {
                      i.options.forEach(opt => {
                           orderItemOptions.push({
                               id: `oio-${i.id}-${opt.optionId}`,
                               order_item_id: i.id,
                               option_id: opt.optionId,
                               // Map option details if needed by getOrderDetailed selectors
                           });
                      });
                  }
              });
          }
      });

      // Normalize Tenant
      const mapDeliveryMethodFromBackend = (dm) => {
          if (dm === 'OWN_DELIVERY') return 'own';
          if (dm === 'POOL') return 'pool';
          return dm || 'own';
      };

      const tenant = rawTenant ? {
          ...rawTenant,
          main_color: rawTenant.mainColor || rawTenant.main_color,
          delivery_fee: rawTenant.deliveryFee || rawTenant.delivery_fee,
          service_fee_percentage: rawTenant.serviceFeePercentage || rawTenant.service_fee_percentage,
          delivery_method: mapDeliveryMethodFromBackend(rawTenant.deliveryMethod || rawTenant.delivery_method),
          working_hours: rawTenant.workingHours || rawTenant.working_hours,
          accepts_cash: rawTenant.acceptsCash || rawTenant.accepts_cash,
          photo_url: rawTenant.photoUrl || rawTenant.photo_url,
          payment_channels: rawTenant.paymentChannels || rawTenant.payment_channels || (rawTenant.paymentChannel ? [rawTenant.paymentChannel] : []),
          is_open: rawTenant.isOpen !== undefined ? rawTenant.isOpen : rawTenant.is_open,
          delivery_estimate_min: rawTenant.deliveryEstimateMin || rawTenant.delivery_estimate_min,
          delivery_estimate_max: rawTenant.deliveryEstimateMax || rawTenant.delivery_estimate_max,
          owner_user_id: rawTenant.ownerUserId || rawTenant.owner_user_id,
      } : initialTenant;

      // Normalize Menu Items
      const menuItems = Array.isArray(rawMenuItems) ? rawMenuItems.map(m => ({
          ...m,
          category_id: (m.categoryId && typeof m.categoryId === 'object') ? m.categoryId.id : (m.categoryId || m.category_id),
          photo_url: m.photoUrl || m.photo_url,
          is_available: m.isAvailable !== undefined ? m.isAvailable : m.is_available,
          tenant_id: (m.tenant && typeof m.tenant === 'object') ? m.tenant.id : (m.tenantId || m.tenant_id),
      })) : [];

      // Normalize Categories
      const menuCategories = Array.isArray(rawMenuCategories) ? rawMenuCategories.map(c => ({
          ...c,
          tenant_id: (c.tenant && typeof c.tenant === 'object') ? c.tenant.id : (c.tenantId || c.tenant_id),
          display_order: c.displayOrder || c.display_order || c.order,
          order: c.displayOrder || c.order,
      })) : [];

      // Normalize Option Groups
      const optionGroups = Array.isArray(rawOptionGroups) ? rawOptionGroups.map(g => ({
          ...g,
          item_id: g.itemId || g.item_id,
          is_required: g.isRequired !== undefined ? g.isRequired : g.is_required ?? g.required,
          min: g.min ?? g.minOptions ?? 0,
          max: g.max ?? g.maxOptions ?? 0,
      })) : [];
      
      // Normalize Options
      const options = Array.isArray(rawOptions) ? rawOptions.map(o => ({
          ...o,
          // Backend envia OptionDTO com "group" aninhado; garantir que group_id seja o id desse grupo
          group_id: (o.group && o.group.id) || o.groupId || o.group_id,
          additional_charge: o.additionalPrice !== undefined ? o.additionalPrice : (o.additional_charge || 0),
      })) : [];

      // Normalize Neighborhoods
       const neighborhoods = Array.isArray(rawNeighborhoods) ? rawNeighborhoods.map(n => ({
          ...n,
          tenant_id: n.tenantId || n.tenant_id,
      })) : [];

      // Normalize Addresses
      const addresses = Array.isArray(rawAddresses) ? rawAddresses.map(a => ({
          ...a,
          user_id: a.userId || a.user_id,
          zip_code: a.zipCode || a.zip_code,
          street_number: a.streetNumber || a.street_number,
          neighborhood_id: a.neighborhoodId || a.neighborhood_id,
          geo_lat: a.geoLat || a.geo_lat,
          geo_lng: a.geoLng || a.geo_lng,
          is_default: a.isDefault || a.is_default,
      })) : [];
      
      // Banners
       const banners = Array.isArray(rawBanners) ? rawBanners.map(b => ({
          ...b,
          tenant_id: b.tenantId || b.tenant_id,
          banner_image: b.bannerImage || b.banner_image,
      })) : [];

      // Carregar Carrinho Ativo
      let cart = initialCart;
      let cartItems = [];
      let cartItemOptions = [];

      if (rawCart) {
         cart = {
             ...rawCart,
             user_id: rawCart.userId || rawCart.user_id,
             tenant_id: rawCart.tenantId || rawCart.tenant_id,
             address_id: rawCart.addressId || rawCart.address_id,
             payment_channel: rawCart.paymentChannel || rawCart.payment_channel,
             change: rawCart.changeFor || rawCart.change,
             delivery_fee: rawCart.deliveryFee || rawCart.delivery_fee,
             notes: rawCart.notes,
             discount: rawCart.discount || 0,
         };

         if (rawCart.items && Array.isArray(rawCart.items)) {
            cartItems = rawCart.items.map(ci => ({
                ...ci,
                cart_id: ci.cartId || ci.cart_id,
                item_id: ci.itemId || ci.item_id,
            }));
            
            cartItemOptions = rawCart.items.flatMap(ci => {
                if (ci.selectedOptions && Array.isArray(ci.selectedOptions)) {
                    return ci.selectedOptions.map(opt => ({
                        id: opt.id,
                        cart_item_id: ci.id,
                        option_id: opt.optionId,
                    }));
                }
                return [];
            });
         }
      }

      dispatch({
        type: actionMap.SET_DATA,
        payload: {
          user,
          tenant,
          menuCategories,
          menuItems,
          optionGroups,
          options,
          banners,
          neighborhoods,
          addresses,
          cart: cart || initialCart,
          cartItems,
          cartItemOptions,
          orders,
          statuses,
          orderItems,
          orderItemOptions,
        },
      });
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    state.optionGroups.filter(
      (g) =>
        g.item_id === itemId &&
        (g.active === undefined || g.active === null || g.active === true)
    );

  const getOptionsForGroup = (groupId) =>
    state.options.filter(
      (o) =>
        o.group_id === groupId &&
        (o.active === undefined || o.active === null || o.active === true)
    );

  const getCartDetailedItems = () => {
    return state.cartItems.map((ci) => {
      const item = maps.menuItemMap[ci.item_id];
      const selectedOptions = state.cartItemOptions
        .filter((cio) => cio.cart_item_id === ci.id)
        .map((cio) => {
          const option = maps.optionMap[cio.option_id];
          if (!option) return null;
          const group = maps.optionGroupMap[option.group_id];
          return {
            ...option,
            groupName: group ? group.name : undefined,
          };
        })
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
    // Garantir que orderId seja string para comparação, pois na URL vem string
    // e no banco vem number.
    const order = state.orders.find((o) => String(o.id) === String(orderId));
    if (!order) return null;

    const items = state.orderItems
      .filter((oi) => String(oi.order_id) === String(order.id))
      .map((oi) => {
        const opts = state.orderItemOptions
          .filter((oio) => String(oio.order_item_id) === String(oi.id))
          .map((oio) => {
            const option = maps.optionMap[oio.option_id];
            const group = option ? maps.optionGroupMap[option.group_id] : null;
            return {
              ...oio,
              option,
              groupName: group ? group.name : undefined,
            };
          });

        return { ...oi, options: opts };
      });

    const timeline = state.statuses
      .filter((s) => String(s.order_id) === String(order.id))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return { order, items, timeline };
  };

  /* ------------ Actions Integradas com Backend ------------ */

  const getEffectiveCartId = async () => {
    if (state.cart && state.cart.id) return state.cart.id;
    try {
      // Tenta buscar/criar o carrinho
      const res = await api.get(`/cart?userId=${state.user.id}&tenantId=${state.tenant.id}`);
      if (res && res.id) {
        const normalizedCart = {
           ...res,
           user_id: res.userId || res.user_id,
           tenant_id: res.tenantId || res.tenant_id,
           address_id: res.addressId || res.address_id,
           payment_channel: res.paymentChannel || res.payment_channel,
           change: res.changeFor || res.change,
           delivery_fee: res.deliveryFee || res.delivery_fee,
           notes: res.notes,
           discount: res.discount || 0,
        };
        dispatch({ type: actionMap.SET_CART, payload: normalizedCart });
        return res.id;
      }
    } catch (error) {
      console.error('Erro ao recuperar ID do carrinho:', error);
    }
    return null;
  };

  const addToCart = async (itemId, quantity = 1, notes = '', selectedOptionIds = []) => {
    // Optimistic
    dispatch({
      type: actionMap.ADD_TO_CART,
      payload: { itemId, quantity, notes, selectedOptionIds },
    });

    try {
      const cartId = await getEffectiveCartId();
      if (!cartId) throw new Error("Cart ID not available");

      const res = await api.post(`/cart/items`, {
        cartId,
        itemId,
        quantity,
        notes,
        selectedOptions: Array.isArray(selectedOptionIds)
          ? selectedOptionIds.map((optionId) => ({
              optionId,
            }))
          : [],
      });
      const data = res?.data ?? res;
      if (data && typeof data === 'object') {
        const normalizedCart = {
          id: data.id,
          user_id: data.userId || data.user_id,
          tenant_id: data.tenantId || data.tenant_id,
          address_id: data.addressId || data.address_id,
          subtotal: data.subtotal ?? 0,
          delivery_fee: data.deliveryFee ?? data.delivery_fee ?? 0,
          total: data.total ?? 0,
          payment_channel: data.paymentChannel || data.payment_channel,
          change: data.changeFor || data.change,
          notes: data.notes ?? '',
          discount: data.discount ?? 0,
        };
        let cartItems = [];
        let cartItemOptions = [];
        if (Array.isArray(data.items)) {
          cartItems = data.items.map((ci) => ({
            id: ci.id,
            cart_id: ci.cartId || ci.cart_id,
            item_id: ci.itemId || ci.item_id,
            quantity: ci.quantity,
            notes: ci.notes,
          }));
          cartItemOptions = data.items.flatMap((ci) => {
            if (Array.isArray(ci.selectedOptions)) {
              return ci.selectedOptions.map((opt) => ({
                id: opt.id,
                cart_item_id: ci.id,
                option_id: opt.optionId || opt.option_id,
              }));
            }
            return [];
          });
        }
        dispatch({
          type: actionMap.SET_DATA,
          payload: {
            cart: normalizedCart,
            cartItems,
            cartItemOptions,
          },
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      // TODO: Reverter em caso de erro crítico
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    dispatch({
      type: actionMap.UPDATE_CART_ITEM,
      payload: { cartItemId, quantity },
    });

    try {
      const cartId = await getEffectiveCartId();
      if (!cartId) return;

      const isNumeric = typeof cartItemId === 'number' || (/^\d+$/).test(String(cartItemId));
      if (!isNumeric) return;
      await api.put(`/cart/items/${cartItemId}?cartId=${cartId}`, { quantity });
    } catch (error) {
      console.error('Erro ao atualizar item do carrinho:', error);
    }
  };

  const removeCartItem = async (cartItemId) => {
    dispatch({
      type: actionMap.REMOVE_CART_ITEM,
      payload: cartItemId,
    });

    try {
      const cartId = await getEffectiveCartId();
      if (!cartId) return;

      const isNumeric = typeof cartItemId === 'number' || (/^\d+$/).test(String(cartItemId));
      if (!isNumeric) return;
      await api.delete(`/cart/items/${cartItemId}?cartId=${cartId}`);
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
    }
  };

  const toggleOptionInCartItem = async (cartItemId, optionId) => {
    dispatch({
      type: actionMap.TOGGLE_CART_ITEM_OPTION,
      payload: { cartItemId, optionId },
    });

    try {
      const cartId = await getEffectiveCartId();
      if (!cartId) return;

      await api.post(`/carts/${cartId}/items/${cartItemId}/toggle-option`, {
        option_id: optionId,
      });
    } catch (error) {
      console.error('Erro ao alternar opção:', error);
    }
  };

  const setCartAddress = async (addressId) => {
    dispatch({
      type: actionMap.SET_CART_ADDRESS,
      payload: addressId,
    });
    try {
      const cartId = await getEffectiveCartId();
      if (!cartId) return;

      await api.put(`/cart/${cartId}/details`, { addressId });
    } catch (error) {
      console.error('Erro ao definir endereço do carrinho:', error);
    }
  };

  const setCartPaymentChannel = async (channel) => {
    dispatch({
      type: actionMap.SET_CART_PAYMENT,
      payload: channel,
    });
    try {
      const cartId = await getEffectiveCartId();
      if (!cartId) return;

      await api.put(`/cart/${cartId}/details`, { paymentChannel: channel });
    } catch (error) {
      console.error('Erro ao definir pagamento:', error);
    }
  };

  const setCartChangeFor = async (value) => {
    dispatch({
      type: actionMap.SET_CART_CHANGE,
      payload: value,
    });
    // Debounce idealmente, mas direto por enquanto
    try {
      const cartId = await getEffectiveCartId();
      if (!cartId) return;

      await api.put(`/cart/${cartId}/details`, { changeFor: value });
    } catch (error) {
      console.error('Erro ao definir troco:', error);
    }
  };

  const setCartNotes = async (notes) => {
    dispatch({
      type: actionMap.SET_CART_NOTES,
      payload: notes,
    });
    try {
      const cartId = await getEffectiveCartId();
      if (!cartId) return;

      await api.put(`/cart/${cartId}/details`, { notes });
    } catch (error) {
      console.error('Erro ao definir observações:', error);
    }
  };

  const saveAddress = async (address) => {
    try {
      // Se tiver ID, é update, senão create
      const method = address.id && !address.id.startsWith('addr-') ? 'put' : 'post';
      const url = method === 'put' ? `/user-addresses/${address.id}` : '/user-addresses';
      
      const payload = { ...address, user_id: state.user.id };
      const saved = await api[method](url, payload);

      // Refresh addresses from server to ensure sync
      const userId = state.user.id;
      const updatedAddresses = await api.get(`/user-addresses/by-user/${userId}`);

      dispatch({ 
        type: actionMap.SET_ADDRESSES, 
        payload: { addresses: updatedAddresses } 
      });
      return saved.id;
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      // Fallback para mock local se falhar, para não travar a UI na demo
      const id = address.id || `addr-${Date.now()}`;
      dispatch({
        type: actionMap.SAVE_ADDRESS,
        payload: { address: { ...address, id } },
      });
      return id;
    }
  };

  const deleteAddress = async (id) => {
    dispatch({ type: actionMap.DELETE_ADDRESS, payload: id });
    try {
      await api.delete(`/user-addresses/${id}`);
      
      // Refresh addresses from server to ensure sync
      const userId = state.user.id;
      const updatedAddresses = await api.get(`/user-addresses/by-user/${userId}`);
      
      dispatch({ 
        type: actionMap.SET_ADDRESSES, 
        payload: { addresses: updatedAddresses } 
      });
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
      // Opcional: Reverter estado ou exibir erro
    }
  };

  const placeOrder = async () => {
    if (!state.cartItems.length) return null;

    try {
      // Construct OrderDTO compatible payload (camelCase)
      const orderItems = state.cartItems.map((ci) => {
        const item = maps.menuItemMap[ci.item_id];
        const selectedOptions = state.cartItemOptions
          .filter((cio) => cio.cart_item_id === ci.id)
          .map((cio) => {
            const opt = maps.optionMap[cio.option_id];
            return {
              optionId: cio.option_id,
              optionNameSnapshot: opt?.name,
              additionalCharge: opt?.additional_charge || 0,
            };
          });

        return {
          itemId: ci.item_id,
          itemNameSnapshot: item?.name,
          quantity: ci.quantity,
          unitPrice: item?.price || 0,
          notes: ci.notes,
          highlights: null,
          options: selectedOptions,
        };
      });

      const payload = {
        tenantId: state.tenant?.id ? Number(state.tenant.id) : value.tenantId,
        userId: state.user?.id ? Number(state.user.id) : value.userId,
        addressId: state.cart.address_id ? Number(state.cart.address_id) : null,
        subtotal: cartTotals.subtotal,
        serviceFee: cartTotals.serviceFee,
        deliveryFee: cartTotals.deliveryFee,
        discount: cartTotals.discount,
        total: cartTotals.total,
        paymentChannel: state.cart.payment_channel ? state.cart.payment_channel.toUpperCase() : null,
        change: state.cart.change ? parseFloat(state.cart.change.replace(',', '.')) : 0,
        status: 'CREATED',
        orderItem: orderItems,
      };

      console.log('Place Order Payload:', payload);

      const order = await api.post('/orders', payload);

      // O backend deve retornar a order completa
      // Se retornar, usamos. Se não, fallback para mock visual ou reload.
      
      // Assumindo que retorna estrutura compatível ou precisamos recarregar pedidos
      if (order && order.id) {
         // Mock conversion ou uso direto
         // Simplificação: reload orders via loadData ou apenas limpar carrinho
         dispatch({
             type: actionMap.CLEAR_CART
         });
         // Adicionar order na lista
         // dispatch({ type: actionMap.ADD_ORDER, payload: order }); // Se existir action
         
         // Por enquanto, vamos manter o comportamento de limpar o carrinho e retornar o ID
         return order.id;
      }
    } catch (error) {
      console.error('Erro ao realizar pedido:', error);
    }
    return null;
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
      setAddresses: (addresses) =>
        dispatch({ type: actionMap.SET_ADDRESSES, payload: { addresses } }),
      saveAddress,
      deleteAddress,
      placeOrder,
      reloadOrders: loadData,
      updateTenant: async (partial) => {
        dispatch({ type: actionMap.UPDATE_TENANT, payload: partial });
        
        try {
            const current = state.tenant;
            const updated = { ...current, ...partial };
            
            const mapDeliveryMethodToBackend = (dm) => {
                if (dm === 'own') return 'OWN_DELIVERY';
                if (dm === 'pool') return 'POOL';
                return dm;
            };

            const payload = {
                id: updated.id,
                ownerUserId: updated.owner_user_id,
                name: updated.name,
                mainColor: updated.main_color,
                cnpjCpf: updated.cnpj_cpf,
                address: updated.address,
                geoLat: updated.geo_lat ? Number(updated.geo_lat) : null,
                geoLng: updated.geo_lng ? Number(updated.geo_lng) : null,
                isOpen: updated.is_open,
                workingHours: updated.working_hours,
                acceptsCash: updated.accepts_cash,
                deliveryMethod: mapDeliveryMethodToBackend(updated.delivery_method),
                serviceFeePercentage: updated.service_fee_percentage,
                deliveryFee: updated.delivery_fee,
                deliveryEstimateMin: updated.delivery_estimate_min,
                deliveryEstimateMax: updated.delivery_estimate_max,
                status: updated.status,
                email: updated.email,
                slug: updated.slug,
                photoUrl: updated.photo_url,
                paymentChannels: updated.payment_channels
            };

            if (updated.id) {
                await api.put(`/tenants/${updated.id}`, payload);
            } else {
                await api.post('/tenants/create', payload);
            }
            return true;
        } catch (e) {
            console.error("Error updating tenant", e);
            return false;
        }
      },
      addOrderStatus: (orderId, status) =>
        dispatch({ type: actionMap.ADD_ORDER_STATUS, payload: { orderId, status } }),
      updateOrderStatus: async (orderId, status) => {
        try {
          if (!orderId || !status) return false;
          await api.put(`/orders/${orderId}/status`, { status });
          dispatch({ type: actionMap.ADD_ORDER_STATUS, payload: { orderId, status } });
          return true;
        } catch (e) {
          console.error('Erro ao atualizar status do pedido no backend', e);
          return false;
        }
      },
      // menu: categorias
      saveMenuCategory: async (category) => {
        try {
          // Normalize payload for backend (camelCase)
          const payload = {
              id: category.id,
              name: category.name,
              tenantId: category.tenant_id || state.tenant.id,
              displayOrder: category.order || category.display_order
          };
          
          // Determine if create or update
          // Currently backend only shows /create, assuming upsert or create only for now
          await api.post('/menu-categories/create', payload);
          
          // Reload data or optimistic update (simplified: reload for consistency)
          // For now, dispatch optimistic
          dispatch({ type: actionMap.UPSERT_MENU_CATEGORY, payload: category });
        } catch (e) {
          console.error("Error saving category", e);
        }
      },
      reorderMenuCategories: (ids) =>
        dispatch({ type: actionMap.REORDER_MENU_CATEGORIES, payload: ids }),
      // menu: itens
      saveMenuItem: async (item) => {
          try {
              const payload = {
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  isAvailable: item.is_available,
                  photoUrl: item.photo_url,
                  categoryId: { id: item.category_id },
                  tenantId: { id: item.tenant_id || state.tenant.id }
              };
              
              const savedDto = await api.post('/menu-items', payload);
              
              // Normalize returned DTO to match frontend state
              const savedItem = {
                  ...item,
                  id: savedDto.id,
                  category_id: savedDto.categoryId?.id || savedDto.categoryId, // Ensure we extract ID if object
                  tenant_id: savedDto.tenant?.id || savedDto.tenantId,
              };

              dispatch({ type: actionMap.UPSERT_MENU_ITEM, payload: savedItem });
              return savedItem;
          } catch(e) {
              console.error("Error saving menu item", e);
              return null;
          }
      },
      deleteMenuItem: async (itemId) => {
          try {
              await api.delete(`/menu-items/${itemId}`);
              dispatch({ type: actionMap.DELETE_MENU_ITEM, payload: itemId });
          } catch (e) {
              console.error("Error deleting menu item", e);
          }
      },
      toggleItemAvailability: async (itemId) => {
          const item = state.menuItems.find(i => i.id === itemId);
          if (!item) return;
          
          try {
             const payload = {
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  isAvailable: !item.is_available,
                  photoUrl: item.photo_url,
                  categoryId: { id: item.category_id },
                  tenantId: { id: item.tenant_id }
             };
             await api.post('/menu-items', payload);
             dispatch({ type: actionMap.TOGGLE_MENU_ITEM_AVAILABILITY, payload: itemId });
          } catch (e) {
             console.error("Error toggling item availability", e);
          }
      },
      // menu: grupos de opção
      saveOptionGroup: async (group) => {
          try {
             const payload = {
              id: group.id,
              itemId: group.item_id,
              name: group.name,
              required: group.is_required ?? group.required ?? false,
              minOptions: group.min,
              maxOptions: group.max
          };
             const res = await api.post('/option-groups/create', payload);
             const nextGroup = {
                 ...group,
                 id: res.id
             };
             dispatch({ 
                 type: actionMap.UPSERT_OPTION_GROUP, 
                 payload: nextGroup
             });
             return nextGroup;
          } catch(e) {
              console.error("Error saving option group", e);
              return null;
          }
      },
      deleteOptionGroup: async (groupId) => {
        try {
          await api.delete(`/option-groups/${groupId}`);
          dispatch({ type: actionMap.DELETE_OPTION_GROUP, payload: groupId });
        } catch (e) {
          console.error('Error deleting option group', e);
        }
      },
      // menu: opções
      saveOption: async (option) => {
          try {
              const isTempId = typeof option.id === 'string' && option.id.startsWith('opt-');
              const payload = {
                  id: isTempId ? null : option.id,
                  group: { id: option.group_id },
                  name: option.name,
                  additionalPrice: option.additional_charge
              };
              const res = await api.post('/options/create', payload);
              const nextOption = {
                  ...option,
                  id: res.id
              };
              dispatch({ 
                  type: actionMap.UPSERT_OPTION, 
                  payload: nextOption
              });
              return nextOption;
          } catch(e) {
              console.error("Error saving option", e);
              return null;
          }
      },
      deleteOption: async (optionId) => {
        try {
          await api.delete(`/options/${optionId}`);
          dispatch({ type: actionMap.DELETE_OPTION, payload: optionId });
        } catch (e) {
          console.error('Error deleting option', e);
        }
      },
      // banners
      saveBanner: async (banner) => {
        try {
          const payload = {
            id: banner.id,
            tenantId: { id: banner.tenant_id || state.tenant.id },
            bannerImage: banner.banner_image,
            productLink: banner.product_link,
          };

          await api.post('/banners', payload);
          const raw = await api.get(`/banners?tenantId=${state.tenant.id}`);
          const refreshed = Array.isArray(raw) ? raw.map(b => ({
            id: b.id,
            tenant_id: b.tenantId?.id || b.tenantId,
            banner_image: b.bannerImage,
            product_link: b.productLink,
          })) : [];
          dispatch({ type: actionMap.SET_DATA, payload: { banners: refreshed } });
        } catch (e) {
          console.error('Error saving banner', e);
        }
      },
      deleteBanner: async (bannerId) => {
        try {
          const isTemp = typeof bannerId === 'string' && bannerId.startsWith('bnr-');
          if (!isTemp) {
            await api.delete(`/banners/${bannerId}`);
          }
          dispatch({ type: actionMap.DELETE_BANNER, payload: bannerId });
        } catch (e) {
          console.error('Error deleting banner', e);
        }
      },
      // neighborhoods
      saveNeighborhood: (neighborhood) =>
        dispatch({ type: actionMap.UPSERT_NEIGHBORHOOD, payload: neighborhood }),
      deleteNeighborhood: (neighborhoodId) =>
        dispatch({ type: actionMap.DELETE_NEIGHBORHOOD, payload: neighborhoodId }),
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
