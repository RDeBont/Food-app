export interface ProductInfo {
  name: string;
  allergens: string[];
  ingredients: string;
}

export async function fetchProductByBarcode(barcode: string): Promise<ProductInfo | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1) {
      return {
        name: data.product.product_name || 'Onbekend product',
        allergens: data.product.allergens_tags || [],
        ingredients: data.product.ingredients_text || 'Geen ingrediënten beschikbaar',
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Fout bij ophalen van product:', error);
    return null;
  }
}
