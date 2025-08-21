import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, Search, Edit, Trash2, XCircle } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast'; // Import Toaster from react-hot-toast

import { supabase } from "@/lib/supabase";

const Products = () => {
  // State for the Add Product modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State for storing product data fetched from Supabase
  const [products, setProducts] = useState([]);
  // Loading state for data fetching
  const [loading, setLoading] = useState(true);
  // Error state for data fetching
  const [error, setError] = useState(null);

  // State for the new product form inputs, simplified to name and unitPrice (corrected)
  const [newProduct, setNewProduct] = useState({
    name: "",
    unitPrice: 0, // Corrected to unitPrice
  });
  // Loading state for saving a new product
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Fetches product data from the 'products' table in Supabase.
   * Now only fetches id, name, and unitPrice.
   */
  const fetchProducts = async () => {
    setLoading(true); // Set loading state to true before fetching
    setError(null);    // Clear any previous errors
    try {
      // Fetch 'id', 'name', and '"unitPrice"' (note quotes for case sensitivity) from the 'products' table
      const { data, error } = await supabase
        .from('products')
        .select('id, name, "unitPrice"'); // Corrected column name here

      if (error) {
        throw error; // Throw an error if the Supabase call fails
      }
      setProducts(data); // Update the products state with fetched data
    } catch (err) {
      console.error("Error fetching products:", err.message);
      setError("Failed to load products. Please check your Supabase connection and table setup.");
      toast.error("Failed to load products."); // Using react-hot-toast
    } finally {
      setLoading(false); // Set loading state to false after fetching (success or failure)
    }
  };

  /**
   * Handles the submission of the Add Product form, inserting a new product into Supabase.
   * Now only inserts name and unitPrice.
   */
  const handleAddProduct = async () => {
    // Basic client-side validation for required fields
    if (!newProduct.name || newProduct.unitPrice <= 0) { // Corrected to unitPrice
      toast.error("Please fill in all required fields and ensure price is greater than 0."); // Using react-hot-toast
      return;
    }

    setIsSaving(true); // Set saving state to true
    try {
      // Insert the new product data into the 'products' table
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: newProduct.name,
            "unitPrice": newProduct.unitPrice, // Corrected column name here (with quotes for case sensitivity)
          },
        ])
        .select(); // Use .select() to return the newly inserted row(s)

      if (error) {
        throw error; // Throw an error if the Supabase insertion fails
      }

      // Add the newly inserted product to the local state to update the UI immediately
      setProducts((prevProducts) => [...prevProducts, data[0]]);
      toast.success("Product added successfully!"); // Using react-hot-toast
      setIsAddModalOpen(false); // Close the modal after successful addition
      // Reset the form fields to their initial empty state
      setNewProduct({
        name: "",
        unitPrice: 0, // Corrected to unitPrice
      });
    } catch (err) {
      console.error("Error adding product:", err.message);
      toast.error(`Failed to add product: ${err.message}`); // Using react-hot-toast
    } finally {
      setIsSaving(false); // Set saving state to false after operation completes
    }
  };

  /**
   * Handles changes to the input fields in the Add Product form.
   * @param {Object} e - The event object from the input change.
   */
  const handleNewProductChange = (e) => {
    const { id, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      // Convert unitPrice to number, default to 0 if parsing fails
      [id]: id === "unitPrice" ? parseFloat(value) || 0 : value, // Corrected to unitPrice
    }));
  };

  // useEffect hook to fetch products when the component mounts
  useEffect(() => {
    fetchProducts();
  }, []); // Empty dependency array ensures this runs only once on mount

  const displayProducts = products; // Directly use products as there's no filtering

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 font-inter w-full">
      <Toaster position="bottom-right" /> {/* Toaster component for react-hot-toast */}

      {/* Header section with title, description, and Add Product button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Track product details (Name and Price)
          </p>
        </div>

        {/* Dialog for adding a new product */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-200 ease-in-out">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl bg-card text-card-foreground rounded-lg p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Product Name input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-medium">Product Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={newProduct.name}
                  onChange={handleNewProductChange}
                  className="rounded-md"
                />
              </div>
              {/* Price input */}
              <div className="space-y-2">
                <Label htmlFor="unitPrice" className="font-medium">Price <span className="text-red-500">*</span></Label> {/* Corrected htmlFor and id */}
                <Input
                  id="unitPrice" // Corrected id
                  type="number"
                  placeholder="0.00"
                  value={newProduct.unitPrice} // Corrected to unitPrice
                  onChange={handleNewProductChange}
                  className="rounded-md"
                />
              </div>
              {/* Action buttons for the modal */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-md">
                  Cancel
                </Button>
                <Button onClick={handleAddProduct} disabled={isSaving} className="rounded-md shadow-sm">
                  {isSaving ? "Adding..." : "Add Product"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <Card className="rounded-lg shadow-sm w-full">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-xl md:text-2xl font-bold">Product Details</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            // Loading indicator
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : error ? (
            // Error message display
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
              <XCircle className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading products</h3>
              <p className="text-center">{error}</p>
            </div>
          ) : (
            // Product table display
            <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
              <table className="min-w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-foreground text-base md:text-lg">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600 text-base md:text-lg">
                        ₹{(product.unitPrice ?? 0).toLocaleString()} {/* Corrected to unitPrice */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm md:text-base font-medium">
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="hover:bg-primary/10 rounded-md p-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-destructive/10 rounded-md p-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Message when no products are found */}
          {displayProducts.length === 0 && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground text-center">
                Get started by adding your first product.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;