import {
  Page,
  Layout,
  Card,
  Button,
  TextField,
  BlockStack,
  Text,
  List,
  InlineStack,
  Badge,
} from "@shopify/polaris";
import { useState } from "react";

interface SelectedProduct {
  id: string;
  title: string;
  handle?: string;
  variants?: any[];
}

export default function MetafieldsPage() {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );
  const [customFieldValue, setCustomFieldValue] = useState("");

  const openProductPicker = async () => {
    try {
      // Resource picker
      const selected = await shopify.resourcePicker({
        type: "product",
        multiple: true,
      });

      if (selected && selected.length > 0) {
        const products = selected.map((product: any) => ({
          id: String(product.id),
          title: product.title,
          handle: product.handle,
          variants: product.variants,
        }));

        setSelectedProducts(products);

        // Log the products data
        console.log("=== SELECTED PRODUCTS ===");
        console.log("Count:", products.length);
        console.log("Products:", products);

        // Log each product details
        products.forEach((product: SelectedProduct, index: number) => {
          console.log(`\nProduct ${index + 1}:`);
          console.log("  ID:", product.id);
          console.log("  Title:", product.title);
          console.log("  Handle:", product.handle);
          console.log("  Variants:", product.variants);
        });
      }
    } catch (error) {
      console.error("Error opening product picker:", error);
    }
  };

  const handlePreviewSave = () => {
    if (selectedProducts.length === 0) {
      console.warn("No products selected");
      return;
    }

    if (!customFieldValue.trim()) {
      console.warn("No custom field value entered");
      return;
    }

    // Log what will be added
    console.log("\n=== SAVE PREVIEW ===");
    console.log("Custom Field Value:", customFieldValue);
    console.log("Products to update:", selectedProducts.length);

    selectedProducts.forEach((product, index) => {
      console.log(`\nProduct ${index + 1} - ${product.title}`);
      console.log("  Product ID:", product.id);
      console.log("  Metafield that would be created:");
      console.log("    namespace: 'custom'");
      console.log("    key: 'custom_field'");
      console.log("    value:", customFieldValue);
      console.log("    type: 'single_line_text_field'");
    });
  };

  const clearSelection = () => {
    setSelectedProducts([]);
    console.log("Selection cleared");
  };

  const canSave =
    selectedProducts.length > 0 && customFieldValue.trim().length > 0;

  return (
    <Page title="Product Custom Metafields">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              // Product Selection Section
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Select Products
                </Text>
                <InlineStack gap="200">
                  <Button onClick={openProductPicker}>
                    {selectedProducts.length > 0
                      ? "Change Selection"
                      : "Select Products"}
                  </Button>
                  {selectedProducts.length > 0 && (
                    <Button onClick={clearSelection} tone="critical">
                      Clear
                    </Button>
                  )}
                </InlineStack>
              </BlockStack>

              // Display the Selected Products as a List
              {selectedProducts.length > 0 && (
                <BlockStack gap="200">
                  <InlineStack gap="200" align="center">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      Selected Products:
                    </Text>
                    <Badge tone="info">
                      {selectedProducts.length.toString()}
                    </Badge>
                  </InlineStack>
                  <Card background="bg-surface-secondary">
                    <List>
                      {selectedProducts.map((product) => (
                        <List.Item key={product.id}>
                          <InlineStack gap="200" align="space-between">
                            <Text as="span">{product.title}</Text>
                            <Text as="span" tone="subdued" variant="bodySm">
                              {product.id.split("/").pop()}
                            </Text>
                          </InlineStack>
                        </List.Item>
                      ))}
                    </List>
                  </Card>
                </BlockStack>
              )}

              // The Custom Field Input
              <TextField
                autoComplete="off"
                label="Custom field value"
                placeholder="Enter custom field value"
                value={customFieldValue}
                onChange={setCustomFieldValue}
                disabled={selectedProducts.length === 0}
                helpText={
                  selectedProducts.length > 0
                    ? `This value will be saved to ${selectedProducts.length} product${selectedProducts.length !== 1 ? "s" : ""}`
                    : "Select products first"
                }
              />

              // Save Button
              <Button
                variant="primary"
                onClick={handlePreviewSave}
                disabled={!canSave}
                fullWidth
              >
                Save
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
