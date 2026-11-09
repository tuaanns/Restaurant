import React from 'react';
import { Store, ShoppingBag, ShoppingCart, Bike, Video, PhoneCall, Globe } from 'lucide-react';

export const DEFAULT_SALES_CHANNELS = [
  {
    id: 'direct',
    label: {
      vi: 'Khách trực tiếp (Tại quán)',
      en: 'Dine-in / Direct',
      ko: '매장 방문',
      ru: 'В заведении'
    },
    shortLabel: {
      vi: 'Tại quán',
      en: 'Direct',
      ko: '매장',
      ru: 'Заведение'
    },
    color: '#1B5E20',
    bgColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    iconType: 'store'
  },
  {
    id: 'takeaway',
    label: {
      vi: 'Mang về (Takeaway)',
      en: 'Takeaway',
      ko: '포장 주문',
      ru: 'На вынос'
    },
    shortLabel: {
      vi: 'Mang về',
      en: 'Takeaway',
      ko: '포장',
      ru: 'На вынос'
    },
    color: '#0284c7',
    bgColor: '#e0f2fe',
    borderColor: '#bae6fd',
    iconType: 'bag'
  },
  {
    id: 'shopeefood',
    label: {
      vi: 'ShopeeFood',
      en: 'ShopeeFood',
      ko: '쇼피푸드 (ShopeeFood)',
      ru: 'ShopeeFood'
    },
    shortLabel: {
      vi: 'ShopeeFood',
      en: 'ShopeeFood',
      ko: 'ShopeeFood',
      ru: 'ShopeeFood'
    },
    color: '#ee4d2d',
    bgColor: '#fff0ec',
    borderColor: '#ffd0c4',
    iconType: 'bag',
    hasOrderCode: true
  },
  {
    id: 'grabfood',
    label: {
      vi: 'GrabFood',
      en: 'GrabFood',
      ko: '그랩푸드 (GrabFood)',
      ru: 'GrabFood'
    },
    shortLabel: {
      vi: 'GrabFood',
      en: 'GrabFood',
      ko: 'GrabFood',
      ru: 'GrabFood'
    },
    color: '#00b14f',
    bgColor: '#e8f8ef',
    borderColor: '#b2ebd0',
    iconType: 'bike',
    hasOrderCode: true
  },
  {
    id: 'gofood',
    label: {
      vi: 'GoFood (Gojek)',
      en: 'GoFood (Gojek)',
      ko: '고푸드 (GoFood)',
      ru: 'GoFood (Gojek)'
    },
    shortLabel: {
      vi: 'GoFood',
      en: 'GoFood',
      ko: 'GoFood',
      ru: 'GoFood'
    },
    color: '#ed1c24',
    bgColor: '#fee2e2',
    borderColor: '#fca5a5',
    iconType: 'bike',
    hasOrderCode: true
  },
  {
    id: 'befood',
    label: {
      vi: 'BeFood',
      en: 'BeFood',
      ko: '비푸드 (BeFood)',
      ru: 'BeFood'
    },
    shortLabel: {
      vi: 'BeFood',
      en: 'BeFood',
      ko: 'BeFood',
      ru: 'BeFood'
    },
    color: '#d97706',
    bgColor: '#fef3c7',
    borderColor: '#fde68a',
    iconType: 'bike',
    hasOrderCode: true
  },
  {
    id: 'tiktok',
    label: {
      vi: 'TikTok Shop',
      en: 'TikTok Shop',
      ko: '틱톡샵 (TikTok Shop)',
      ru: 'TikTok Shop'
    },
    shortLabel: {
      vi: 'TikTok',
      en: 'TikTok',
      ko: 'TikTok',
      ru: 'TikTok'
    },
    color: '#111827',
    bgColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    iconType: 'video',
    hasOrderCode: true
  },
  {
    id: 'facebook',
    label: {
      vi: 'Hotline / Facebook',
      en: 'Hotline / Social',
      ko: '전화 / SNS 주문',
      ru: 'Телефон / Соцсети'
    },
    shortLabel: {
      vi: 'Hotline/FB',
      en: 'Hotline/FB',
      ko: 'Hotline/FB',
      ru: 'Горячая линия'
    },
    color: '#1877f2',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    iconType: 'phone',
    hasOrderCode: true
  }
];

export const SALES_CHANNELS = DEFAULT_SALES_CHANNELS;

const STORAGE_KEY = 'aura_custom_sales_channels';

export function getCustomSalesChannels() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getAllSalesChannels() {
  const custom = getCustomSalesChannels();
  return [...DEFAULT_SALES_CHANNELS, ...custom];
}

export function addCustomSalesChannel(channel) {
  const custom = getCustomSalesChannels();
  const id = channel.id || `custom_${Date.now()}`;
  const newChannel = {
    ...channel,
    id,
    isCustom: true
  };
  const updated = [...custom, newChannel];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('aura_sales_channels_updated', { detail: updated }));
  } catch (e) {}
  return newChannel;
}

export function deleteCustomSalesChannel(channelId) {
  const custom = getCustomSalesChannels();
  const updated = custom.filter(c => c.id !== channelId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('aura_sales_channels_updated', { detail: updated }));
  } catch (e) {}
}

export function getSalesChannel(channelId) {
  const all = getAllSalesChannels();
  return all.find(c => c.id === channelId) || all[0];
}

export function formatChannelName(channelId, lang = 'vi', short = false) {
  const channel = getSalesChannel(channelId);
  if (!channel) return channelId || '';
  if (typeof channel.label === 'string') {
    return channel.label;
  }
  const target = short ? (channel.shortLabel || channel.label) : channel.label;
  if (typeof target === 'string') return target;
  return (target && target[lang]) || (target && target.vi) || channelId || '';
}

export function renderChannelIcon(iconType, size = 14, color = 'currentColor') {
  switch (iconType) {
    case 'store':
      return React.createElement(Store, { size, color });
    case 'bag':
      return React.createElement(ShoppingBag, { size, color });
    case 'cart':
      return React.createElement(ShoppingCart, { size, color });
    case 'bike':
      return React.createElement(Bike, { size, color });
    case 'video':
      return React.createElement(Video, { size, color });
    case 'phone':
      return React.createElement(PhoneCall, { size, color });
    default:
      return React.createElement(Globe, { size, color });
  }
}
