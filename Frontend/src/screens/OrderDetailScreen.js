import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../theme/colors';
import { ORDER_STATUS } from '../utils/constants';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const fetchOrderDetail = async () => {
    try {
      const response = await orderAPI.getById(orderId);
      setOrder(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load order details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const statusInfo = ORDER_STATUS[order.status];
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const deliveryAddress = order.deliveryAddress;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Order Status */}
      <View style={styles.statusCard}>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.background} />
          <Text style={styles.statusText}>{statusInfo.label}</Text>
        </View>
        <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
        <Text style={styles.orderDate}>Placed on {orderDate}</Text>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Image
              source={{ uri: item.product.imageUrl || 'https://via.placeholder.com/60' }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemQuantity}>
                Qty: {item.quantity} × ₹{item.price}
              </Text>
            </View>
            <Text style={styles.itemTotal}>₹{(item.quantity * item.price).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Vendor Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vendor</Text>
        <View style={styles.vendorCard}>
          <Ionicons name="storefront-outline" size={24} color={COLORS.primary} />
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>{order.vendor.shopName}</Text>
            <Text style={styles.vendorAddress}>{order.vendor.shopAddress}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={COLORS.rating} />
            <Text style={styles.rating}>{order.vendor.rating}</Text>
          </View>
        </View>
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.addressCard}>
          <Ionicons name="location-outline" size={24} color={COLORS.primary} />
          <View style={styles.addressInfo}>
            <Text style={styles.addressTitle}>{deliveryAddress.title}</Text>
            <Text style={styles.addressText}>{deliveryAddress.fullAddress}</Text>
            {deliveryAddress.landmark && (
              <Text style={styles.addressText}>Near {deliveryAddress.landmark}</Text>
            )}
            <Text style={styles.addressText}>
              {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
            </Text>
            <Text style={styles.addressPhone}>{deliveryAddress.phoneNumber}</Text>
          </View>
        </View>
      </View>

      {/* Payment Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{order.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.freeText}>FREE</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <Text style={styles.summaryValue}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  statusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginBottom: SPACING.md,
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background,
    marginLeft: SPACING.sm,
  },
  orderNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  itemTotal: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
  },
  vendorInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  vendorName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  vendorAddress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rating: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 4,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
  },
  addressInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  addressTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  addressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  freeText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default OrderDetailScreen;

