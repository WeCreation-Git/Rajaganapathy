import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Search, Edit, Trash2, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from 'react-hot-toast';

// Supabase import

// IMPORTANT: Replace "e0ec3e760daf7219d04dfed7539ade58" with your actual GST API key
// from gstincheck.co.in. This is a placeholder.
const GST_API_KEY = "e0ec3e760daf7219d04dfed7539ade58";

const Companies = () => {
  // Supabase and Authentication states
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // State for controlling the "Add Company" modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // States for new company form fields
  const [newGstNumber, setNewGstNumber] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newAddress, setNewAddress] = useState("");

  // States for GST API fetching status and messages
  const [isFetchingGstDetails, setIsFetchingGstDetails] = useState(false);
  const [gstFetchError, setGstFetchError] = useState("");
  const [gstSuccessMessage, setGstSuccessMessage] = useState("");

  // Ref for debouncing the GST API call
  const debounceTimeoutRef = useRef(null);

  // State for companies, initialized as empty as data will be fetched from Supabase
  const [companies, setCompanies] = useState([]);

  // Edit functionality states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editFormData, setEditFormData] = useState({
    company_name: "",
    gst_no: "",
    address: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  // Delete functionality states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Effect hook for initializing Supabase client and listening for Supabase Auth changes.
   * This runs once when the component mounts.
   */
  
  /**
   * Effect hook for fetching companies from Supabase.
   * This runs whenever the Supabase client or userId becomes available.
   */
  useEffect(() => {
    const fetchCompanies = async () => {
      // Only attempt to fetch if Supabase client and a userId are available
      if (supabase) {
        setLoadingCompanies(true); // Set loading state to true before fetching
        try {
          // Fetch companies associated with the current user ID from the 'companies' table
          // Only fetch active companies (isactive = true or null for backward compatibility)
          const { data, error } = await supabase
            .from('companies')
            .select('*')
            .or('isactive.is.null,isactive.eq.true'); // Include companies where isactive is null (old records) or true

          if (error) throw error; // If there's an error, throw it to be caught

          // Map the fetched Supabase data to the component's expected format
          setCompanies(data.map(c => ({
            id: c.id,
            name: c.company_name,
            gst: c.gst_no,
            address: c.address,
            isactive: c.isactive !== false, // Default to true if null or true
            totalBills: 0, // Placeholder, as these are not stored in DB yet
            totalAmount: 0 // Placeholder, as these are not stored in DB yet
          })));
        } catch (error) {
          console.error("Error fetching companies:", error.message);
          // Provide a user-friendly error message if RLS prevents access
          if (error.message.includes("permission denied")) {
            setGstFetchError("Access denied. Please ensure you are logged in via Supabase and have the necessary permissions.");
          }
        } finally {
          setLoadingCompanies(false); // Set loading state to false after fetching (or error)
        }
      } else if (supabase) {
        // If Supabase is initialized but no userId (no active session),
        // stop loading and clear companies, as RLS would prevent access.
        setLoadingCompanies(false);
        setCompanies([]);
      }
    };

    fetchCompanies();
  }, [supabase]); // Dependencies: re-run this effect when supabase client or userId changes

  // Filter companies based on search term (case-insensitive)
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.gst.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Fetches GST details from the gstincheck.co.in API.
   * Populates company name (tradeNam) and address (pradr.adr) fields.
   * Displays loading, error, or success messages to the user.
   * @param {string} gstin - The 15-digit GSTIN to fetch details for.
   */
  const fetchGstDetails = async (gstin) => {
    // Basic validation: GSTIN must be 15 digits long
    if (!gstin || gstin.length !== 15) {
      setGstFetchError("Please enter a valid 15-digit GSTIN.");
      setNewCompanyName("");
      setNewAddress("");
      setGstSuccessMessage(""); // Clear any previous success message
      return;
    }

    // Set loading state and clear previous messages/data before API call
    setIsFetchingGstDetails(true);
    setGstFetchError("");
    setGstSuccessMessage("");
    setNewCompanyName("");
    setNewAddress("");

    try {
      const response = await fetch(`https://sheet.gstincheck.co.in/check/${GST_API_KEY}/${gstin}`);
      const data = await response.json();

      console.log("GST API Response:", data);

      // Check if the API response indicates success and contains relevant data
      if (data.flag === true && data.data) {
        // Prioritize 'tradeNam' (trade name), fall back to 'lgnm' (legal name) if not available
        setNewCompanyName(data.data.tradeNam || data.data.lgnm || "");
        // Use optional chaining for 'pradr.adr' to safely access nested properties
        setNewAddress(data.data.pradr?.adr || "");
        setGstSuccessMessage("GSTIN found.");
      } else {
        // If API call was successful but data is missing or flag is false
        setGstFetchError(data.message || "Could not fetch GST details. Please check the GSTIN.");
      }
    } catch (error) {
      // Catch network errors or issues with parsing the response
      console.error("Error fetching GST details:", error);
      setGstFetchError("Failed to connect to GST API. Please try again.");
    } finally {
      setIsFetchingGstDetails(false); // Always reset fetching state
    }
  };

  /**
   * useEffect hook to debounce the GST API call.
   * This prevents excessive API calls while the user is typing.
   * It waits for 500ms after the user stops typing before calling the API.
   * Also clears fields and messages when the GSTIN input is empty.
   */
  useEffect(() => {
    // Clear any existing debounce timeout to avoid multiple calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // If there's a new GST number, set a new debounce timeout
    if (newGstNumber) {
      debounceTimeoutRef.current = setTimeout(() => {
        fetchGstDetails(newGstNumber);
      }, 500); // 500ms debounce delay
    } else {
      // If GST number is cleared, reset all related form fields and messages
      setNewCompanyName("");
      setNewAddress("");
      setGstFetchError("");
      setGstSuccessMessage("");
    }

    // Cleanup function: clears the timeout when the component unmounts or newGstNumber changes
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [newGstNumber]); // Dependency array: re-run this effect when newGstNumber changes

  /**
   * Handles the addition of a new company to Supabase.
   * This function inserts the company data into the 'companies' table.
   */
  const handleAddCompany = async () => {
    // Ensure Supabase client and user ID are available before attempting to add
    if (!supabase) {
      console.error("Supabase client or User ID not available. Cannot add company.");
      setGstFetchError("Authentication or database connection issue. Please ensure you are logged in.");
      return;
    }

    // Basic validation for required fields before insertion
    if (!newGstNumber || !newCompanyName) {
      setGstFetchError("GST Number and Company Name are required.");
      return;
    }

    try {
      // Insert the new company data into the 'companies' table in Supabase
      const { data, error } = await supabase
        .from('companies')
        .insert([
          {
            company_name: newCompanyName,
            gst_no: newGstNumber,
            address: newAddress,
            isactive: true, // Set as active by default
            // owner_name, phone, email are not in the current form, so they will be null in DB
          }
        ])
        .select(); // Request the inserted row back to update local state

      if (error) throw error; // If Supabase returns an error, throw it

      // If insertion is successful and data is returned, update the local state
      if (data && data.length > 0) {
        const addedCompany = data[0];
        setCompanies(prevCompanies => [
          ...prevCompanies,
          {
            id: addedCompany.id,
            name: addedCompany.company_name,
            gst: addedCompany.gst_no,
            address: addedCompany.address,
            isactive: addedCompany.isactive !== false,
            totalBills: 0, // Default for new company, can be updated later
            totalAmount: 0 // Default for new company, can be updated later
          }
        ]);
        // Close the modal and reset all form fields and messages
        setIsAddModalOpen(false);
        setNewGstNumber("");
        setNewCompanyName("");
        setNewAddress("");
        setGstFetchError("");
        setGstSuccessMessage("");
        toast.success("Company added successfully!");
      }
    } catch (error) {
      console.error("Error adding company to Supabase:", error.message);
      // Display a user-friendly error message
      setGstFetchError(`Failed to add company: ${error.message}`);
      toast.error(`Failed to add company: ${error.message}`);
    }
  };

  /**
   * Opens the edit modal and populates it with company data
   */
  const handleEditClick = (company) => {
    setEditingCompany(company);
    setEditFormData({
      company_name: company.name,
      gst_no: company.gst,
      address: company.address || ""
    });
    setIsEditModalOpen(true);
  };

  /**
   * Handles the update of company data in Supabase
   */
  const handleUpdateCompany = async () => {
    if (!editingCompany || !supabase) {
      toast.error("Cannot update company. Please try again.");
      return;
    }

    // Basic validation
    if (!editFormData.company_name || !editFormData.gst_no) {
      toast.error("Company name and GST number are required.");
      return;
    }

    setIsEditing(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({
          company_name: editFormData.company_name,
          gst_no: editFormData.gst_no,
          address: editFormData.address
        })
        .eq('id', editingCompany.id)
        .select();

      if (error) throw error;

      // Update local state
      setCompanies(prevCompanies => 
        prevCompanies.map(company => 
          company.id === editingCompany.id 
            ? {
                ...company,
                name: editFormData.company_name,
                gst: editFormData.gst_no,
                address: editFormData.address
              }
            : company
        )
      );

      setIsEditModalOpen(false);
      setEditingCompany(null);
      setEditFormData({ company_name: "", gst_no: "", address: "" });
      toast.success("Company updated successfully!");
    } catch (error) {
      console.error("Error updating company:", error.message);
      toast.error(`Failed to update company: ${error.message}`);
    } finally {
      setIsEditing(false);
    }
  };

  /**
   * Opens the delete confirmation dialog
   */
  const handleDeleteClick = (company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handles the soft delete of a company by setting isactive to false
   */
  const handleDeleteCompany = async () => {
    if (!companyToDelete || !supabase) {
      toast.error("Cannot delete company. Please try again.");
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ isactive: false })
        .eq('id', companyToDelete.id);

      if (error) throw error;

      // Remove from local state
      setCompanies(prevCompanies => 
        prevCompanies.filter(company => company.id !== companyToDelete.id)
      );

      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
      toast.success("Company deleted successfully!");
    } catch (error) {
      console.error("Error deleting company:", error.message);
      toast.error(`Failed to delete company: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Company Management</h1>
          <p className="text-muted-foreground">
            Manage all your business companies and their details
          </p>
        </div>

        {/* Add Company Dialog (Modal) */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="gst" className="text-sm font-medium text-foreground">GST Number *</Label>
                <Input
                  id="gst"
                  placeholder="Enter 15-digit GST number"
                  value={newGstNumber}
                  onChange={(e) => setNewGstNumber(e.target.value.toUpperCase())}
                  maxLength={15}
                  className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {isFetchingGstDetails && (
                  <p className="text-sm text-blue-500 flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching details...
                  </p>
                )}
                {gstFetchError && (
                  <p className="text-sm text-red-500">{gstFetchError}</p>
                )}
                {gstSuccessMessage && (
                  <p className="text-sm text-green-600">{gstSuccessMessage}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">Company Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter company name"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  readOnly={isFetchingGstDetails || (newCompanyName && newGstNumber && !gstFetchError)}
                  className={`w-full px-3 py-2 border border-input rounded-md ${isFetchingGstDetails || (newCompanyName && newGstNumber && !gstFetchError) ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500 focus:border-transparent"} transition-all duration-200`}
                />
              </div>

              {/* Address Textarea */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-foreground">Address (Optional)</Label>
                <Textarea
                  id="address"
                  placeholder="Enter company address"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  readOnly={isFetchingGstDetails || (newAddress && newGstNumber && !gstFetchError)}
                  className={`w-full px-3 py-2 border border-input rounded-md min-h-[80px] ${isFetchingGstDetails || (newAddress && newGstNumber && !gstFetchError) ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500 focus:border-transparent"} transition-all duration-200`}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsAddModalOpen(false);
                  setNewGstNumber("");
                  setNewCompanyName("");
                  setNewAddress("");
                  setGstFetchError("");
                  setGstSuccessMessage("");
                }} className="w-full sm:w-auto border border-gray-300 hover:bg-gray-100 rounded-md">
                  Cancel
                </Button>
                <Button onClick={handleAddCompany} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md"
                  disabled={!newGstNumber || !newCompanyName || isFetchingGstDetails}>
                  Add Company
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Company Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-gst" className="text-sm font-medium text-foreground">GST Number *</Label>
              <Input
                id="edit-gst"
                placeholder="Enter 15-digit GST number"
                value={editFormData.gst_no}
                onChange={(e) => setEditFormData(prev => ({ ...prev, gst_no: e.target.value.toUpperCase() }))}
                maxLength={15}
                className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium text-foreground">Company Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter company name"
                value={editFormData.company_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, company_name: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address" className="text-sm font-medium text-foreground">Address (Optional)</Label>
              <Textarea
                id="edit-address"
                placeholder="Enter company address"
                value={editFormData.address}
                onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-input rounded-md min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCompany(null);
                  setEditFormData({ company_name: "", gst_no: "", address: "" });
                }} 
                className="w-full sm:w-auto border border-gray-300 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateCompany} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md"
                disabled={!editFormData.gst_no || !editFormData.company_name || isEditing}
              >
                {isEditing ? "Updating..." : "Update Company"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{companyToDelete?.name}"? This action cannot be undone.
              The company will be marked as inactive and removed from the active companies list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCompany}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Company"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies by name or GST..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">{companies.length}</div>
            <div>Total Companies</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-foreground text-lg">
              {companies.reduce((acc, curr) => acc + curr.totalBills, 0)}
            </div>
            <div>Total Bills</div>
          </div>
        </div>
      </div>

      {/* Companies Grid Display or Loading/No Companies Message */}
      {loadingCompanies ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="ml-4 text-lg text-muted-foreground">Loading companies...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card className="border-2 border-dashed border-border shadow-none bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4 opacity-70" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No companies found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchTerm ? "No companies match your search criteria. Try a different search term." : "Get started by adding your first company using the 'Add Company' button above."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    GST: {company.gst}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditClick(company)}
                  >
                    <Edit className="h-4 w-4 text-muted-foreground hover:text-blue-500" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="hover:bg-destructive/10 hover:text-destructive rounded-md p-1"
                    onClick={() => handleDeleteClick(company)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {company.address && (
                  <div className="flex items-start space-x-2 mb-4 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-500" />
                    <p className="leading-relaxed">
                      {company.address}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bills</p>
                    <p className="text-xl font-semibold text-foreground">{company.totalBills}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-xl font-semibold text-green-600">
                      ₹{company.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-sm" variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;
