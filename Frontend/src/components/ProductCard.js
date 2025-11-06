import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../theme/colors';

const ProductCard = ({ product, onPress }) => {
  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: product.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {hasDiscount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        <Text style={styles.vendor} numberOfLines={1}>
          {product.vendor?.shopName}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{displayPrice}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>₹{product.price}</Text>
          )}
          <Text style={styles.unit}>/{product.unit}</Text>
        </View>

        {product.stock > 0 ? (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>In Stock</Text>
          </View>
        ) : (
          <View style={[styles.stockBadge, styles.outOfStock]}>
            <Text style={[styles.stockText, styles.outOfStockText]}>Out of Stock</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '47%',
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.discount,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: SPACING.sm,
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
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  unit: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  stockBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  stockText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  outOfStock: {
    backgroundColor: COLORS.error + '20',
  },
  outOfStockText: {
    color: COLORS.error,
  },
});

export default ProductCard;
