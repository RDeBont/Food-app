import { fetchProductByBarcode, ProductInfo, searchProductsByName } from '@/api/openFoodFacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Index() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [searchResults, setSearchResults] = useState<ProductInfo[]>([]);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [userAllergens, setUserAllergens] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const saved = await AsyncStorage.getItem('userAllergens');
        setUserAllergens(saved ? JSON.parse(saved) : []);
      })();
    }, [])
  );

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true);
    setError('');
    const result = await fetchProductByBarcode(data);
    if (result) {
      setProduct(result);
      setBarcode(data);
    } else {
      setError('❌ Product not found.');
      setProduct(null);
      setTimeout(() => setScanned(false), 5000); // <-- auto reset after 5s
    }
  };

  const handleNameSearch = async () => {
    setError('');
    setProduct(null);
    setSearching(true);
    const results = await searchProductsByName(name);
    if (results.length > 0) {
      setSearchResults(results);
    } else {
      setError('❌ No products found.');
      setSearchResults([]);
    }
    setSearching(false);
  };

  const handleResultPress = (item: ProductInfo) => {
    setProduct({
      name: item.product_name || item.name || 'No name',
      allergens: item.allergens_tags || item.allergens || [],
      ingredients: item.ingredients_text || item.ingredients || 'No info',
    });
    setSearchResults([]);
    setError('');
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        {/* Search bar */}
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleNameSearch}
          />
          
          {/* Settings icon (dummy) */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('setting')}
          >
            <Text style={{ fontSize: 24 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Scan box overlay */}
        <View style={styles.scanBoxContainer}>
          <View style={styles.scanBox}>
            <Text style={styles.scanBoxText}>Place the barcode inside the box</Text>
          </View>
        </View>

        {/* Search results */}
        {searchResults.length > 0 && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.overlayContainer}
            onPress={() => setSearchResults([])}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.productOverlay, { paddingTop: 40 }]}
              onPress={e => e.stopPropagation()}
            >
              {/* X button */}
              <TouchableOpacity
                style={styles.closeOverlayX}
                onPress={() => setSearchResults([])}
              >
                <Text style={{ fontSize: 22, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
              <Text style={styles.overlayTitle}>Search results</Text>
              <ScrollView style={{ width: '100%' }}>
                {searchResults.slice(0, 10).map((item, idx) => (
                  <TouchableOpacity
                    key={item.code || idx}
                    onPress={() => handleResultPress(item)}
                    style={styles.resultItem}
                  >
                    <Text style={{ fontWeight: 'bold' }}>{item.product_name || 'No name'}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Barcode: {item.code}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Brand: {item.brands}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Product info overlay */}
        {product && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.overlayContainer}
            onPress={() => { setProduct(null); setScanned(false); }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.productOverlay}
              onPress={e => e.stopPropagation()} // Zorgt dat klikken op de overlay zelf niet sluit
            >
              {/* X-knop rechtsboven */}
              <TouchableOpacity
                style={styles.closeOverlayX}
                onPress={() => { setProduct(null); setScanned(false); }}
              >
                <Text style={{ fontSize: 22, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
              <Text style={styles.overlayTitle}>Product information</Text>
              <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 16 }}>
                <View style={styles.overlayField}>
                  <Text style={styles.overlayFieldText}>{product.name}</Text>
                </View>
                <View style={styles.overlayField}>
                  <Text style={styles.overlayFieldText}>
                    {product.allergens.length > 0
                      ? product.allergens.map(a => a.replace(/^en:/, '')).join(', ')
                      : 'No allergen info'}
                  </Text>
                </View>
                {userAllergens.length > 0 && product.allergens.some(a =>
                  userAllergens.some(u => a.toLowerCase().includes(u))
                ) && (
                  <View style={styles.overlayField}>
                    <Text style={styles.overlayFieldText}>⚠️ WARNING: This product contains an allergen you selected!</Text>
                  </View>
                )}
                <View style={styles.overlayIngredients}>
                  <Text style={styles.overlayFieldText}>{product.ingredients || 'No ingredient info'}</Text>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Error */}
        {error ? (
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity
              style={styles.scanAgainBtn}
              onPress={() => { setScanned(false); setError(''); }}
            >
              <Text style={{ fontWeight: 'bold' }}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'rgba(240,240,240,0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  settingsButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,240,240,0.8)',
    borderRadius: 18,
  },
  transparentBox: {
    alignSelf: 'center',
    backgroundColor: 'rgba(200,200,200,0.5)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 40,
  },
  resultsBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
  },
  resultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  productOverlay: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 18,
  },
  overlayField: {
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  overlayFieldText: {
    fontSize: 15,
  },
  overlayIngredients: {
    width: '100%',
    backgroundColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    minHeight: 60,
    marginBottom: 18,
  },
  error: {
    color: 'red',
    alignSelf: 'center',
    marginTop: 10,
  },
  scanAgainBtn: {
    alignSelf: 'center',
    backgroundColor: 'rgba(240,240,240,0.8)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  transparentBottom: {
    alignSelf: 'center',
    marginTop: 40,
    backgroundColor: 'rgba(0,0,0,0.0)',
    padding: 10,
  },
  scanBoxContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'box-none',
  },
  scanBox: {
    width: 250,
    height: 120,
    borderWidth: 3,
    borderColor: '#00C853',
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBoxText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  closeOverlayBtn: {
    marginTop: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  closeOverlayX: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 8,
  },
});
