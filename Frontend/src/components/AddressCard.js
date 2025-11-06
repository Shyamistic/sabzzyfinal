import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../theme/colors';

const AddressCard = ({ address, onPress, onEdit, onDelete, showActions = true }) => {
  return (
    <TouchableOpacity
      style={[styles.container, address.isDefault && styles.defaultContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons
            name={address.title === 'Home' ? 'home' : address.title === 'Work' ? 'briefcase' : 'location'}
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.title}>{address.title}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>

        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Ionicons name="pencil" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.address}>{address.fullAddress}</Text>
      {address.landmark && (
        <Text style={styles.landmark}>Near {address.landmark}</Text>
      )}
      <Text style={styles.location}>
        {address.city}, {address.state} - {address.pincode}
      </Text>
      <Text style={styles.phone}>{address.phoneNumber}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  defaultContainer: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: SPACING.sm,
  },
  defaultText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.background,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    padding: 4,
  },
  address: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  landmark: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  location: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: 4,
  },
  phone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default AddressCard;
