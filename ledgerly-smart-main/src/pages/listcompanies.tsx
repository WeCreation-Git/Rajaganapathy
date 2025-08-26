import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ITEMS_PER_PAGE = 10;

const CompaniesTable = () => {
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("active");

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!supabase) return;
      setLoadingCompanies(true);

      try {
        // Fetch companies depending on filter
        let filterQuery = "";

        if (filterStatus === "active") {
          filterQuery = "isactive.eq.true";
        } else if (filterStatus === "inactive") {
          filterQuery = "isactive.eq.false";
        } // else 'all' no filter

        const { data: companiesData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .or(filterStatus === "all" ? "isactive.is.null,isactive.eq.true,isactive.eq.false" : filterQuery);

        if (companyError) throw companyError;

        // Fetch bills data
        const { data: billsData, error: billsError } = await supabase
          .from("bills")
          .select("company_id, amount")
          .not("company_id", "is", null);

        if (billsError) throw billsError;

        const billMap = new Map();

        for (const bill of billsData) {
          const companyId = String(bill.company_id);
          const amount = Number(bill.amount) || 0;

          if (!billMap.has(companyId)) {
            billMap.set(companyId, { totalBills: 0, totalAmount: 0 });
          }

          const stats = billMap.get(companyId);
          stats.totalBills += 1;
          stats.totalAmount += amount;
          billMap.set(companyId, stats);
        }

        const processed = companiesData.map((c) => {
          const stats = billMap.get(String(c.id)) || { totalBills: 0, totalAmount: 0 };
          return {
            id: c.id,
            name: c.company_name,
            gst: c.gst_no,
            address: c.address,
            isactive: c.isactive !== false,
            totalBills: stats.totalBills,
            totalAmount: stats.totalAmount,
          };
        });

        setCompanies(processed);
        setCurrentPage(1); // reset to page 1 on filter change
      } catch (error) {
        console.error("Error fetching companies or bills:", error.message);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [filterStatus]);

  // Filter + search
  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.gst.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const columns = [
    { key: "sno", label: "S.No" },
    { key: "name", label: "Company Name" },
    { key: "gst", label: "GST Number" },
    { key: "address", label: "Address" },
    { key: "totalBills", label: "Total Bills" },
    { key: "totalAmount", label: "Total Amount" },
  ];

  const renderCell = (company, key, index) => {
    switch (key) {
      case "sno":
        return <div className="font-medium text-center">{startIndex + index + 1}</div>;
      case "name":
        return <div className="font-medium text-foreground">{company.name}</div>;
      case "gst":
        return <Badge variant="outline" className="text-xs">{company.gst}</Badge>;
      case "address":
        return (
          <div className="text-sm text-muted-foreground max-w-xs truncate">
            {company.address || "N/A"}
          </div>
        );
      case "totalBills":
        return <div className="text-center font-medium">{company.totalBills}</div>;
      case "totalAmount":
        return (
          <div className="text-right font-medium text-green-600">
            ₹{(company.totalAmount ?? 0).toLocaleString()}
          </div>
        );
      default:
        return company[key];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Company Directory</h1>
          <p className="text-muted-foreground">View all business companies and their key data.</p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex space-x-3">
          {["all", "active", "inactive"].map((status) => (
            <button
              key={status}
              className={`px-4 py-1 rounded-full border ${
                filterStatus === status
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-muted-foreground border-muted-foreground"
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 relative max-w-md w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies by name or GST..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {loadingCompanies ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="ml-4 text-lg text-muted-foreground">Loading companies...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4 opacity-70" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No companies found</h3>
              <p className="text-muted-foreground max-w-md">
                {searchTerm
                  ? "No companies match your search criteria."
                  : "No companies are available to display."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {paginatedCompanies.map((company, index) => (
                      <tr key={company.id} className="hover:bg-muted/50 transition-colors">
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                          >
                            {renderCell(company, column.key, index)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-end items-center p-4 space-x-2">
                  <button
                    className="text-sm px-3 py-1 border rounded disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="text-sm px-3 py-1 border rounded disabled:opacity-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompaniesTable;
