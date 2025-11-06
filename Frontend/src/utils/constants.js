// Replace with your deployed backend URL
export const API_BASE_URL = 'https://your-backend-url.railway.app/api';

// For local development
// export const API_BASE_URL = 'http://192.168.1.x:3000/api'; // Use your local IP

export const CATEGORIES = [
  'All',
  'Vegetables',
  'Fruits',
  'Leafy Greens',
];

export const ORDER_STATUS = {
  PENDING: { label: 'Pending', color: '#F39C12' },
  CONFIRMED: { label: 'Confirmed', color: '#3498DB' },
  PREPARING: { label: 'Preparing', color: '#9B59B6' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: '#E67E22' },
  DELIVERED: { label: 'Delivered', color: '#2ECC71' },
  CANCELLED: { label: 'Cancelled', color: '#E74C3C' },
};
