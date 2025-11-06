import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../theme/colors';
import { productAPI, wishlistAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProductDetail();
  }, []);

  const fetchProductDetail = async () => {
    try {
      const response = await productAPI.getById(productId);
      setProduct(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const result = await addToCart(product.id, quantity);
    if (result.success) {
      Alert.alert('Success', 'Product added to cart', [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') },
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(product.id);
        setIsWishlisted(false);
        Alert.alert('Success', 'Removed from wishlist');
      } else {
        await wishlistAPI.add(product.id);
        setIsWishlisted(true);
        Alert.alert('Success', 'Added to wishlist');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update wishlist');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.imageUrl || 'https://via.placeholder.com/400' }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleWishlistToggle}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={24}
              color={isWishlisted ? COLORS.error : COLORS.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{product.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{displayPrice}</Text>
                <Text style={styles.unit}>/{product.unit}</Text>
                {hasDiscount && (
                  <>
                    <Text style={styles.originalPrice}>₹{product.price}</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{discountPercent}% OFF</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vendor Information</Text>
            <View style={styles.vendorCard}>
              <View>
                <Text style={styles.vendorName}>{product.vendor.shopName}</Text>
                <Text style={styles.vendorAddress}>{product.vendor.shopAddress}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={COLORS.rating} />
                <Text style={styles.rating}>{product.vendor.rating}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            {product.stock > 0 ? (
              <Text style={styles.inStock}>
                ✓ In Stock ({product.stock} {product.unit} available)
              </Text>
            ) : (
              <Text style={styles.outOfStock}>✗ Out of Stock</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Ionicons
              name="remove"
              size={20}
              color={quantity <= 1 ? COLORS.textSecondary : COLORS.primary}
            />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
          >
            <Ionicons
              name="add"
              size={20}
              color={quantity >= product.stock ? COLORS.textSecondary : COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, product.stock === 0 && styles.addButtonDisabled]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={20} color={COLORS.background} />
          <Text style={styles.addButtonText}>
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
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
  imageContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: COLORS.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wishlistButton: {
    position: 'absolute',
    top: 40,
    right: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  unit: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: SPACING.sm,
  },
  discountBadge: {
    backgroundColor: COLORS.discount,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: SPACING.sm,
  },
  discountText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  vendorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
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
  inStock: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    fontWeight: '500',
  },
  outOfStock: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
  },
  quantityButton: {
    padding: SPACING.sm,
  },
  quantity: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
    minWidth: 30,
    textAlign: 'center',
  },
  addButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background,
  },
});

export default ProductDetailScreen;
