import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../theme/colors';
import { addressAPI } from '../services/api';
import AddressCard from '../components/AddressCard';
import LoadingSpinner from '../components/LoadingSpinner';

const AddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAddresses();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressAPI.getAll();
      setAddresses(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEdit = (address) => {
    navigation.navigate('AddAddress', { address });
  };

  const handleDelete = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await addressAPI.delete(addressId);
              fetchAddresses();
              Alert.alert('Success', 'Address deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId) => {
    try {
      await addressAPI.setDefault(addressId);
      fetchAddresses();
    } catch (error) {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAddresses();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onPress={() => handleSetDefault(item.id)}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No addresses saved yet</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddAddress')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={COLORS.background} />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background,
  },
});

export default AddressesScreen;
