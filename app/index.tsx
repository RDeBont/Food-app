import { fetchProductByBarcode, ProductInfo } from '@/api/openFoodFacts';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as BarCodeScanner from 'expo-barcode-scanner';

const Index = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [error, setError] = useState('');

  // Vraag toestemming voor camera
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <Text>⏳ Toestemming voor camera wordt gevraagd...</Text>;
  }

  if (hasPermission === false) {
    return <Text>❌ Geen toegang tot de camera.</Text>;
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setError('');
    const result = await fetchProductByBarcode(data);

    if (result) {
      setProduct(result);
    } else {
      setProduct(null);
      setError('❌ Product niet gevonden.');
    }

    // Heractiveren na 5 seconden
    setTimeout(() => setScanned(false), 5000);
  };

  if (hasPermission === null) {
    return <Text>⏳ Toestemming voor camera wordt gevraagd...</Text>;
  }

  if (hasPermission === false) {
    return <Text>❌ Geen toegang tot de camera.</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Food Scanner 📷</Text>

        <View style={styles.scannerContainer}>
          <BarCodeScanner.BarCodeScanner
            style={StyleSheet.absoluteFillObject}
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          {scanned && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.buttonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {product && (
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            
            {product.allergens.length > 0 && (
              <View style={styles.allergenContainer}>
                <Text style={styles.allergenText}>
                  <MaterialIcons name="warning" size={20} color="#dc3545" />
                  Allergenen gevonden:
                </Text>
                <Text style={styles.allergenText}>
                  {product.allergens.join(', ')}
                </Text>
              </View>
            )}

            <Text style={styles.ingredients}>
              Ingrediënten:
              {product.ingredients}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  allergenContainer: {
    backgroundColor: '#fff3f3',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  allergenText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  ingredients: {
    fontSize: 16,
    lineHeight: 22,
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

