import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import { COLORS, SPACING, FONT_SIZES } from '../theme/colors';
import { addressAPI, orderAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import AddressCard from '../components/AddressCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CheckoutScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const { cart, total, clearCart } = useCart();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll();
      setAddresses(response.data);
      
      // Auto-select default address
      const defaultAddr = response.data.find((addr) => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      } else if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    try {
      setPlacing(true);

      const orderData = {
        addressId: selectedAddress.id,
        paymentMethod,
        notes: '',
      };

      const response = await orderAPI.create(orderData);
      const orders = response.data.orders;

      if (paymentMethod === 'UPI' || paymentMethod === 'Card') {
        // Handle Razorpay payment
        const razorpayOrder = orders[0]; // Use first order for payment
        
        const options = {
          description: 'Sabzzy Order Payment',
          image: 'https://your-logo-url.com/logo.png',
          currency: 'INR',
          key: response.data.razorpayKeyId,
          amount: Math.round(razorpayOrder.totalAmount * 100),
          order_id: razorpayOrder.paymentId,
          name: 'Sabzzy',
          prefill: {
            contact: selectedAddress.phoneNumber,
            name: selectedAddress.title,
          },
          theme: { color: COLORS.primary },
        };

        RazorpayCheckout.open(options)
          .then(async (data) => {
            // Payment successful
            await orderAPI.verifyPayment({
              razorpay_order_id: data.razorpay_order_id,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
              orderId: razorpayOrder.id,
            });

            await clearCart();
            Alert.alert('Success', 'Order placed successfully!', [
              {
                text: 'View Orders',
                onPress: () => navigation.replace('Orders'),
              },
            ]);
          })
          .catch((error) => {
            Alert.alert('Payment Failed', error.description || 'Payment was cancelled');
          });
      } else {
        // COD order
        await clearCart();
        Alert.alert('Success', 'Order placed successfully!', [
          {
            text: 'View Orders',
            onPress: () => navigation.replace('Orders'),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const paymentMethods = [
    { id: 'COD', name: 'Cash on Delivery', icon: 'cash-outline' },
    { id: 'UPI', name: 'UPI / QR Code', icon: 'qr-code-outline' },
    { id: 'Card', name: 'Credit / Debit Card', icon: 'card-outline' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Addresses')}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => navigation.navigate('AddAddress')}
            >
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.addAddressText}>Add Delivery Address</Text>
            </TouchableOpacity>
          ) : (
            <View>
              {selectedAddress && (
                <AddressCard
                  address={selectedAddress}
                  onPress={() => {}}
                  showActions={false}
                />
              )}
            </View>
          )}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                paymentMethod === method.id && styles.paymentOptionSelected,
              ]}
              onPress={() => setPaymentMethod(method.id)}
              activeOpacity={0.7}
            >
              <View style={styles.paymentInfo}>
                <Ionicons name={method.icon} size={24} color={COLORS.text} />
                <Text style={styles.paymentName}>{method.name}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  paymentMethod === method.id && styles.radioSelected,
                ]}
              >
                {paymentMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({cart.length})</Text>
              <Text style={styles.summaryValue}>₹{total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.freeText}>FREE</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total:</Text>
          <Text style={styles.footerTotalValue}>₹{total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, placing && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={placing || !selectedAddress}
          activeOpacity={0.8}
        >
          <Text style={styles.placeOrderText}>
            {placing ? 'Placing Order...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  changeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
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
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  footerTotal: {
    justifyContent: 'center',
  },
  footerTotalLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  footerTotalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  placeOrderButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  placeOrderButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  placeOrderText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background,
  },
});

export default CheckoutScreen;
