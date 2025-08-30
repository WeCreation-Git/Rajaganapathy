import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Search,
  Loader2,
  MoreHorizontal,
  PlusCircle,
  History,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

const ITEMS_PER_PAGE = 10;

const CompaniesTable = () => {
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("active");

  // Action modal state
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [transactionType, setTransactionType] = useState("buy");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!supabase) return;
      setLoadingCompanies(true);

      try {
        let filterQuery = "";
        if (filterStatus === "active") filterQuery = "isactive.eq.true";
        else if (filterStatus === "inactive") filterQuery = "isactive.eq.false";

        const { data: companiesData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .or(
            filterStatus === "all"
              ? "isactive.is.null,isactive.eq.true,isactive.eq.false"
              : filterQuery
          );

        if (companyError) throw companyError;

        const { data: billsData, error: billsError } = await supabase
          .from("bills")
          .select("company_id, amount");
        if (billsError) throw billsError;

        const { data: txData, error: txError } = await supabase
          .from("transactions")
          .select("company_id, type, amount");
        if (txError) throw txError;

        const billMap = new Map();
        for (const bill of billsData) {
          const companyId = String(bill.company_id);
          const amount = Number(bill.amount) || 0;
          billMap.set(companyId, {
            totalBills: (billMap.get(companyId)?.totalBills || 0) + 1,
            totalAmount: (billMap.get(companyId)?.totalAmount || 0) + amount,
          });
        }

        const txMap = new Map();
        for (const tx of txData) {
          const companyId = String(tx.company_id);
          const amount = Number(tx.amount) || 0;
          const stats = txMap.get(companyId) || { totalBuys: 0, totalSells: 0 };
          if (tx.type === "buy") stats.totalBuys += amount;
          if (tx.type === "sell") stats.totalSells += amount;
          txMap.set(companyId, stats);
        }

        const processed = companiesData.map((c) => {
          const billStats = billMap.get(String(c.id)) || {
            totalBills: 0,
            totalAmount: 0,
          };
          const txStats = txMap.get(String(c.id)) || {
            totalBuys: 0,
            totalSells: 0,
          };
          return {
            id: c.id,
            name: c.company_name,
            gst: c.gst_no,
            address: c.address,
            isactive: c.isactive !== false,
            totalBills: billStats.totalBills,
            totalAmount: billStats.totalAmount,
            totalBuys: txStats.totalBuys,
            totalSells: txStats.totalSells,
          };
        });

        setCompanies(processed);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching companies:", error.message);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [filterStatus, openActionDialog]);

  const handleFetchHistory = async (companyId) => {
    const { data: billsData, error: billsError } = await supabase
      .from("bills")
      .select("amount, created_at")
      .eq("company_id", companyId);

    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .select("amount, type, created_at")
      .eq("company_id", companyId);

    if (billsError || txError) {
      console.error("Error fetching history:", billsError || txError);
      return [];
    }

    const history = [
      ...billsData.map((b) => ({ ...b, type: "bill" })),
      ...txData.map((t) => ({ ...t, type: t.type })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return history;
  };

  const handleOpenActionDialog = async (company) => {
    setSelectedCompany(company);
    setOpenActionDialog(true);
    const history = await handleFetchHistory(company.id);
    setHistoryData(history);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!selectedCompany || !transactionAmount) return;

    const { error } = await supabase.from("transactions").insert([
      {
        company_id: selectedCompany.id,
        type: transactionType,
        amount: Number(transactionAmount),
      },
    ]);

    if (error) {
      console.error("Error adding transaction:", error.message);
      return;
    }

    setTransactionAmount("");
    setOpenActionDialog(false);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedCompany || !paymentAmount) return;

    const { error } = await supabase.from("bills").insert([
      {
        company_id: selectedCompany.id,
        amount: Number(paymentAmount),
      },
    ]);

    if (error) {
      console.error("Error adding payment:", error.message);
      return;
    }

    setPaymentAmount("");
    // Re-fetch history to update the list
    const updatedHistory = await handleFetchHistory(selectedCompany.id);
    setHistoryData(updatedHistory);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.gst.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCompanies = filteredCompanies.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const columns = [
    { key: "sno", label: "S.No" },
    { key: "name", label: "Company Name" },
    { key: "gst", label: "GST Number" },
    { key: "address", label: "Address" },
    { key: "totalBills", label: "Total Bills" },
    { key: "totalAmount", label: "Total Amount" },
    { key: "action", label: "Action" },
  ];

  const renderCell = (company, key, index) => {
    switch (key) {
      case "sno":
        return (
          <div className="font-medium text-center">{startIndex + index + 1}</div>
        );
      case "name":
        return <div className="font-medium text-foreground">{company.name}</div>;
      case "gst":
        return (
          <Badge variant="outline" className="text-xs">
            {company.gst}
          </Badge>
        );
      case "address":
        return (
          <div className="text-sm text-muted-foreground max-w-xs truncate">
            {company.address || "N/A"}
          </div>
        );
      case "totalBills":
        return (
          <div className="text-center font-medium">{company.totalBills}</div>
        );
      case "totalAmount":
        return (
          <div className="text-right font-medium text-green-600">
            ₹{(company.totalAmount ?? 0).toLocaleString()}
          </div>
        );
      case "action":
        return (
          <Dialog open={openActionDialog && selectedCompany?.id === company.id} onOpenChange={setOpenActionDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenActionDialog(company)}
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Actions for {selectedCompany?.name}</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="addTransaction" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="addTransaction">Add Transaction</TabsTrigger>
                  <TabsTrigger value="paymentHistory">Payment History</TabsTrigger>
                </TabsList>
                <TabsContent value="addTransaction" className="pt-4">
                  <form onSubmit={handleAddTransaction} className="space-y-4">
                    <div>
                      <Label htmlFor="transactionType">Transaction Type</Label>
                      <select
                        id="transactionType"
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                        className="border rounded w-full p-2 mt-1"
                      >
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="transactionAmount">Amount</Label>
                      <Input
                        id="transactionAmount"
                        type="number"
                        placeholder="Enter amount"
                        value={transactionAmount}
                        onChange={(e) => setTransactionAmount(e.target.value)}
                      />
                    </div>

                    <Button type="submit" className="w-full flex items-center gap-2">
                      <PlusCircle className="w-4 h-4" /> Add Transaction
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="paymentHistory" className="pt-4">
                  <div className="max-h-[40vh] overflow-y-auto pr-2">
                    {historyData.length === 0 ? (
                      <p className="text-center text-muted-foreground">No history found.</p>
                    ) : (
                      <div className="space-y-4">
                        {historyData.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-md border"
                          >
                            <div className="flex items-center space-x-3">
                              {item.type === "bill" ? (
                                <History className="text-blue-500" />
                              ) : item.type === "buy" ? (
                                <ArrowRight className="text-green-500" />
                              ) : (
                                <ArrowRight className="text-red-500 rotate-180" />
                              )}
                              <div>
                                <p className="font-medium">
                                  {item.type === "bill"
                                    ? "Bill Payment"
                                    : item.type === "buy"
                                    ? "Purchase"
                                    : "Sale"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="font-semibold text-lg">
                              ₹{item.amount.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleAddPayment} className="space-y-4 mt-4">
                    <div className="space-y-1">
                      <Label htmlFor="paymentAmount">Add a Payment</Label>
                      <Input
                        id="paymentAmount"
                        type="number"
                        placeholder="Enter amount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full flex items-center gap-2">
                      <PlusCircle className="w-4 h-4" /> Add Payment
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
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
          <h1 className="text-3xl font-bold text-foreground">
            Company Directory
          </h1>
          <p className="text-muted-foreground">
            View all business companies and their key data.
          </p>
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
              <p className="ml-4 text-lg text-muted-foreground">
                Loading companies...
              </p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4 opacity-70" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No companies found
              </h3>
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
                      <tr
                        key={company.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
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