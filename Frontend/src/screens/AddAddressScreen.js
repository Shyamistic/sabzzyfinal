import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../theme/colors';
import { addressAPI } from '../services/api';

const AddAddressScreen = ({ route, navigation }) => {
  const existingAddress = route.params?.address;
  const isEditing = !!existingAddress;

  const [formData, setFormData] = useState({
    title: '',
    fullAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    phoneNumber: '',
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingAddress) {
      setFormData(existingAddress);
    }
  }, [existingAddress]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.fullAddress.trim()) {
      Alert.alert('Error', 'Please enter full address');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return false;
    }
    if (!formData.state.trim()) {
      Alert.alert('Error', 'Please enter state');
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      Alert.alert('Error', 'Please enter valid 6-digit pincode');
      return false;
    }
    if (!/^\+?\d{10,13}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Please enter valid phone number');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditing) {
        await addressAPI.update(existingAddress.id, formData);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        await addressAPI.create(formData);
        Alert.alert('Success', 'Address added successfully');
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const addressTypes = ['Home', 'Work', 'Other'];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Address Type</Text>
        <View style={styles.typeContainer}>
          {addressTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                formData.title === type && styles.typeButtonActive,
              ]}
              onPress={() => handleChange('title', type)}
            >
              <Text
                style={[
                  styles.typeText,
                  formData.title === type && styles.typeTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Full Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.fullAddress}
          onChangeText={(text) => handleChange('fullAddress', text)}
          placeholder="House no., Building name, Street"
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Landmark (Optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.landmark}
          onChangeText={(text) => handleChange('landmark', text)}
          placeholder="Near famous place or building"
          placeholderTextColor={COLORS.textSecondary}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
              placeholder="City"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.halfInput}>
            <Text style={styles.label}>Pincode *</Text>
            <TextInput
              style={styles.input}
              value={formData.pincode}
              onChangeText={(text) => handleChange('pincode', text)}
              placeholder="6-digit pincode"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        <Text style={styles.label}>State *</Text>
        <TextInput
          style={styles.input}
          value={formData.state}
          onChangeText={(text) => handleChange('state', text)}
          placeholder="State"
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.phoneNumber}
          onChangeText={(text) => handleChange('phoneNumber', text)}
          placeholder="+91XXXXXXXXXX"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.defaultCheckbox}
          onPress={() => handleChange('isDefault', !formData.isDefault)}
        >
          <View
            style={[
              styles.checkbox,
              formData.isDefault && styles.checkboxActive,
            ]}
          >
            {formData.isDefault && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
          <Text style={styles.checkboxLabel}>Set as default address</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : isEditing ? 'Update Address' : 'Save Address'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  typeTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.background,
  },
});

export default AddAddressScreen;
