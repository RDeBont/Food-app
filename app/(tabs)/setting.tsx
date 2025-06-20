import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ALLERGENS = [
  { key: 'gluten', label: 'Gluten' },
  { key: 'milk', label: 'Milk/Lactose' },
  { key: 'nuts', label: 'Nuts' },
  { key: 'egg', label: 'Egg' },
  { key: 'soy', label: 'Soy' },
  { key: 'peanut', label: 'Peanut' },
  { key: 'sesame', label: 'Sesame' },
  { key: 'fish', label: 'Fish' },
];

export default function SettingScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('userAllergens');
      if (saved) setSelected(JSON.parse(saved));
    })();
  }, []);

  const toggleAllergen = async (key: string) => {
    let newSelected;
    if (selected.includes(key)) {
      newSelected = selected.filter(a => a !== key);
    } else {
      newSelected = [...selected, key];
    }
    setSelected(newSelected);
    await AsyncStorage.setItem('userAllergens', JSON.stringify(newSelected));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Settings</Text>
          </View>
        }
        data={ALLERGENS}
        keyExtractor={item => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => toggleAllergen(item.key)}
          >
            <View style={[styles.checkbox, selected.includes(item.key) && styles.checkboxChecked]}>
              {selected.includes(item.key) && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </View>
            <Text style={styles.label}>{item.label} check box</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View>
            {/* Terms and Conditions Dropdown */}
            <TouchableOpacity style={styles.dropdownHeader} onPress={() => setShowTerms(!showTerms)}>
              <Text style={styles.dropdownTitle}>Terms and Conditions</Text>
              <Ionicons name={showTerms ? 'chevron-up' : 'chevron-down'} size={20} />
            </TouchableOpacity>
            {showTerms && (
              <View style={styles.dropdownContent}>
                <Text style={styles.text}>
                  By using this app, you agree to the following terms and conditions:
                  {"\n\n"}
                  1. You will use this app for lawful purposes only and in accordance with all applicable laws and regulations.
                  {"\n\n"}
                  2. The app is provided "as is" without any warranties, expressed or implied. We do not guarantee the accuracy or completeness of product information.
                  {"\n\n"}
                  3. We are not liable for any damages or losses resulting from the use of this app.
                  {"\n\n"}
                  4. You are responsible for verifying product information and allergen warnings before consumption.
                  {"\n\n"}
                  5. We reserve the right to update these terms at any time. Continued use of the app means you accept any changes.
                </Text>
              </View>
            )}

            {/* Privacy Policy Dropdown */}
            <TouchableOpacity style={styles.dropdownHeader} onPress={() => setShowPrivacy(!showPrivacy)}>
              <Text style={styles.dropdownTitle}>Privacy Policy</Text>
              <Ionicons name={showPrivacy ? 'chevron-up' : 'chevron-down'} size={20} />
            </TouchableOpacity>
            {showPrivacy && (
              <View style={styles.dropdownContent}>
                <Text style={styles.text}>
                  Your privacy is important to us. This app handles your data as follows:
                  {"\n\n"}
                  • Allergen selections and preferences are stored locally on your device and are not shared with third parties.
                  {"\n\n"}
                  • We do not collect, store, or transmit any personal data unless you explicitly provide consent.
                  {"\n\n"}
                  • The app may request access to your camera for barcode scanning. Camera images are not stored or transmitted.
                  {"\n\n"}
                  • If you have questions about your privacy, please contact us via the support page.
                </Text>
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.scrollContainer}
      />
      <vie
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  checkbox: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#ddd',
    marginRight: 18, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#00C853' },
  label: { fontSize: 16 },

  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginTop: 20,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  dropdownContent: {
    paddingVertical: 10,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
});
