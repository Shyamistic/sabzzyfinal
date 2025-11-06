import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../theme/colors';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const price = item.product.discountPrice || item.product.price;
  const subtotal = price * item.quantity;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: item.product.imageUrl || 'https://via.placeholder.com/80' }}
        style={styles.image}
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {item.product.name}
        </Text>
        
        <Text style={styles.vendor}>{item.product.vendor?.shopName}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price}</Text>
          <Text style={styles.unit}>/{item.product.unit}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeButton}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Ionicons
              name="remove"
              size={18}
              color={item.quantity <= 1 ? COLORS.textSecondary : COLORS.primary}
            />
          </TouchableOpacity>
          
          <Text style={styles.quantity}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.product.stock}
          >
            <Ionicons
              name="add"
              size={18}
              color={item.quantity >= item.product.stock ? COLORS.textSecondary : COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtotal}>₹{subtotal.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  vendor: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  unit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  actionsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    padding: 6,
  },
  quantity: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default CartItem;
