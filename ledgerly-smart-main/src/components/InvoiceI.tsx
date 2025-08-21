import React from 'react';

const InvoiceI = ({ billData }) => {
  if (!billData) {
    return <div className="p-4 text-center text-gray-500">No bill data available for this template.</div>;
  }

  // Helper function to format date as DD-Mon-YY
  const formatDate = (dateString) => {
    if (!dateString) return ''; // Return empty string for invalid dates to avoid "N/A" in empty fields
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return ''; // Check for invalid date object
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
    return `${day}-${month}-${year}`;
  };

  // Dynamic Seller data (now Rajaganapathy Traders as per request)
  // This data should ideally come from billData.sellerDetails
  const seller = billData.sellerDetails || {
    name: "ESWARI PAPER AND BOARDS",
    address: "VP ELASTIC COMPOUND, 237/5D, SAKTHI NAGAR\nPOYAMPALAYAM, POOLUVAPATTI (PO)\nTIRUPUR - 641 602",
    cell: "9384703330,9750003330",
    gstin: "33AVDPK6519J1ZJ",
    state: "Tamil Nadu",
    stateCode: "33",
    email: "abcprinttech@gmail.com",
    pan: "AVDPK6519J",
    bankName: "HDFC BANK",
    accountNo: "50200055475660",
    branchIfsc: "AVINASHI ROAD-TIRUPUR, & HDFC0002408",
    declaration: "We declare that this invoice shows the actual price of\nthe goods described and that all particulars are true",
  };

  // Dynamic Consignee (Ship to) data
  const consignee = billData.consigneeDetails || {
    name: "RAJAGANAPATHY TRADERS",
    address: "No50A JAWAHAR NAGAR, THIRUNEELAGANDAPURAM",
    city: "TIRUPUR",
    gstin: "33APAPG7827C1ZC",
    state: "Tamil Nadu",
    stateCode: "33",
  };

  // Dynamic Buyer (Bill to) data
  const buyer = billData.buyerDetails || {
    name: "RAJAGANAPATHY TRADERS",
    address: "No50A JAWAHAR NAGAR, THIRUNEELAGANDAPURAM",
    city: "TIRUPUR",
    gstin: "33APAPG7827C1ZC",
    state: "Tamil Nadu",
    stateCode: "33",
  };

  const items = billData.items && billData.items.length > 0 ? billData.items : [
    {
      description: "FOLDING BOX SHEET\nDC#28*36.5CM 250 GSM-",
      hsn: "48109900",
      gstRate: 12,
      quantity: 11988,
      rate: 2.05,
      unit: "pcs",
      amount: 24575.40,
    },
  ];

  // Calculate totals based on dynamic items
  const totalTaxableValue = items.reduce((sum, item) => sum + item.amount, 0);
  const outputCGST = items.reduce((sum, item) => sum + (item.amount * (item.gstRate / 2 / 100)), 0);
  const outputSGST = items.reduce((sum, item) => sum + (item.amount * (item.gstRate / 2 / 100)), 0);
  const calculatedTotalAmount = totalTaxableValue + outputCGST + outputSGST;

  const roundOff = billData.roundOff !== undefined ? billData.roundOff : -0.44; // Using example value
  const finalTotalAmount = calculatedTotalAmount + roundOff;

  const totalTaxAmount = outputCGST + outputSGST;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="font-sans text-[10px] sm:text-xs bg-white text-gray-800 border-[1.5px] border-gray-900 mx-auto p-2 sm:p-4 print-page">
      {/* Header Section */}
      <div className="mb-2">
        <div className="flex items-start justify-between">
          <h1 className="flex-1 text-center text-xl font-bold">Tax Invoice</h1>
          <span className="text-xs ml-2 whitespace-nowrap">e-Invoice</span>
        </div>
        <div className="mt-1 text-[10px] leading-tight">
          <p><strong>IRN:</strong> {billData.irn || "7bc9ba00f9738d60aa4f0ff940ad3f96e0b14b6611-f5babb59a2acffa77979e5"}</p>
          <p><strong>Ack No.:</strong> {billData.ackNo || "152522310691498"}</p>
          <p><strong>Ack Date:</strong> {formatDate(billData.ackDate || "2025-07-10")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 mb-2">
        {/* Left stacked boxes: Seller, Consignee, Buyer */}
        <div className="space-y-2">
          <div className="border border-gray-400 p-2">
            <h2 className="text-sm font-bold">{seller.name}</h2>
            {seller.address.split('\n').map((line, index) => (
              <p key={index} className="whitespace-pre-wrap">{line}</p>
            ))}
            <p>Cell: {seller.cell}</p>
            <p>GSTIN/UIN: {seller.gstin}</p>
            <p>State Name: {seller.state}, Code: {seller.stateCode}</p>
            <p>E-Mail: {seller.email}</p>
          </div>
          <div className="border border-gray-400 p-2">
            <p className="font-bold">Consignee (Ship to)</p>
            <p className="font-bold">{consignee.name}</p>
            <p>{consignee.address}</p>
            <p>{consignee.city}</p>
            <p>GSTIN/UIN: {consignee.gstin}</p>
            <p>State Name: {consignee.state}, Code: {consignee.stateCode}</p>
          </div>
          <div className="border border-gray-400 p-2">
            <p className="font-bold">Buyer (Bill to)</p>
            <p className="font-bold">{buyer.name}</p>
            <p>{buyer.address}</p>
            <p>{buyer.city}</p>
            <p>GSTIN/UIN: {buyer.gstin}</p>
            <p>State Name: {buyer.state}, Code: {buyer.stateCode}</p>
          </div>
        </div>

        {/* Right meta table */}
        <div>
          <div className="grid grid-cols-[auto,1fr,auto,1fr] border border-gray-400">
            <div className="border-r border-b border-gray-400 p-1 font-bold">Invoice No.</div>
            <div className="border-r border-b border-gray-400 p-1">{billData.bill_number || "EPB-0716/25-26"}</div>
            <div className="border-r border-b border-gray-400 p-1 font-bold">Dated</div>
            <div className="border-b border-gray-400 p-1">{formatDate(billData.issue_date || "2025-07-10")}</div>

            <div className="border-r border-b border-gray-400 p-1">Delivery Note</div>
            <div className="border-r border-b border-gray-400 p-1">{billData.deliveryNote || ""}</div>
            <div className="border-r border-b border-gray-400 p-1">Mode/Terms of Payment</div>
            <div className="border-b border-gray-400 p-1">{billData.paymentTerms || ""}</div>

            <div className="border-r border-b border-gray-400 p-1">Reference No. & Date.</div>
            <div className="border-r border-b border-gray-400 p-1">{billData.referenceNoAndDate || ""}</div>
            <div className="border-r border-b border-gray-400 p-1">Other References</div>
            <div className="border-b border-gray-400 p-1">{billData.otherReferences || ""}</div>

            <div className="border-r border-b border-gray-400 p-1">Buyer's Order No.</div>
            <div className="border-r border-b border-gray-400 p-1">{billData.buyerOrderNo || ""}</div>
            <div className="border-r border-b border-gray-400 p-1">Dated</div>
            <div className="border-b border-gray-400 p-1">{formatDate(billData.buyerOrderDate || "")}</div>

            <div className="border-r border-b border-gray-400 p-1">Dispatch Doc No.</div>
            <div className="border-r border-b border-gray-400 p-1">{billData.dispatchDocNo || ""}</div>
            <div className="border-r border-b border-gray-400 p-1">Delivery Note Date</div>
            <div className="border-b border-gray-400 p-1">{formatDate(billData.deliveryNoteDate || "")}</div>

            <div className="border-r border-b border-gray-400 p-1">Dispatched through</div>
            <div className="border-r border-b border-gray-400 p-1">{billData.dispatchedThrough || ""}</div>
            <div className="border-r border-b border-gray-400 p-1">Destination</div>
            <div className="border-b border-gray-400 p-1">{billData.destination || ""}</div>

            <div className="border-r border-gray-400 p-1 col-span-3">Terms of Delivery</div>
            <div className="p-1">{billData.termsOfDelivery || ""}</div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* ========= START: UPDATED MAIN ITEMS TABLE STRUCTURE ============ */}
      {/* ================================================================== */}
      <table className="w-full border-collapse border border-gray-400 mb-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 p-1 text-center">SI No.</th>
            <th className="border border-gray-400 p-1 text-center">Description of Goods</th>
            <th className="border border-gray-400 p-1 text-center">HSN/SAC</th>
            <th className="border border-gray-400 p-1 text-center">GST Rate</th>
            <th className="border border-gray-400 p-1 text-center">Quantity</th>
            <th className="border border-gray-400 p-1 text-center">Rate</th>
            <th className="border border-gray-400 p-1 text-center">per</th>
            <th className="border border-gray-400 p-1 text-center">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="border-l border-r border-gray-400 p-1 text-center">{index + 1}</td>
              <td className="border-l border-r border-gray-400 p-1 text-left whitespace-pre-wrap">{item.description}</td>
              <td className="border-l border-r border-gray-400 p-1 text-center">{item.hsn}</td>
              <td className="border-l border-r border-gray-400 p-1 text-center">{item.gstRate}%</td>
              <td className="border-l border-r border-gray-400 p-1 text-right">{item.quantity.toLocaleString('en-IN', { minimumFractionDigits: 3 })}</td>
              <td className="border-l border-r border-gray-400 p-1 text-right">{item.rate.toFixed(2)}</td>
              <td className="border-l border-r border-gray-400 p-1 text-center">{item.unit}</td>
              <td className="border-l border-r border-gray-400 p-1 text-right">{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          ))}
          {/* Calculation Rows - Styled to match the invoice */}
          <tr>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1 font-bold">Output CGST {items[0]?.gstRate / 2}%</td>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1 text-right">{outputCGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1 font-bold">Output SGST {items[0]?.gstRate / 2}%</td>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1"></td>
            <td className="border-l border-r border-gray-400 p-1 text-right">{outputSGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td className="border-l border-r border-b border-gray-400 p-1">Less :</td>
            <td className="border-l border-r border-b border-gray-400 p-1 font-bold">ROUND OFF</td>
            <td className="border-l border-r border-b border-gray-400 p-1"></td>
            <td className="border-l border-r border-b border-gray-400 p-1"></td>
            <td className="border-l border-r border-b border-gray-400 p-1"></td>
            <td className="border-l border-r border-b border-gray-400 p-1"></td>
            <td className="border-l border-r border-b border-gray-400 p-1"></td>
            <td className="border-l border-r border-b border-gray-400 p-1 text-right">(-) {Math.abs(roundOff).toFixed(2)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-gray-100">
            <td className="border border-gray-400 p-1 font-bold" colSpan={2}>Total</td>
            <td className="border border-gray-400 p-1"></td>
            <td className="border border-gray-400 p-1"></td>
            <td className="border border-gray-400 p-1 text-right font-bold">{totalQuantity.toLocaleString('en-IN', { minimumFractionDigits: 3 })} pcs</td>
            <td className="border border-gray-400 p-1"></td>
            <td className="border border-gray-400 p-1"></td>
            <td className="border border-gray-400 p-1 text-right font-bold">₹{finalTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>
      {/* ================================================================== */}
      {/* ========= END: UPDATED MAIN ITEMS TABLE STRUCTURE ============== */}
      {/* ================================================================== */}

      <div className="mb-2">
        <p><span className="font-bold">Amount Chargeable (in words):</span> {billData.amountInWords || "INR Twenty Seven Thousand Five Hundred Twenty Four Only"}</p>
        <p className="text-right text-xs mt-1">E. & O.E</p>
      </div>

      {/* ================================================================== */}
      {/* ========= START: UPDATED TAX SUMMARY TABLE STRUCTURE =========== */}
      {/* ================================================================== */}
      <table className="w-full border-collapse border border-gray-400 mb-2">
        <thead>
          <tr className="bg-gray-100">
            <th rowSpan={2} className="border border-gray-400 p-1 text-center">HSN/SAC</th>
            <th rowSpan={2} className="border border-gray-400 p-1 text-center">Taxable Value</th>
            <th colSpan={2} className="border border-gray-400 p-1 text-center">CGST</th>
            <th colSpan={2} className="border border-gray-400 p-1 text-center">SGST/UTGST</th>
            <th rowSpan={2} className="border border-gray-400 p-1 text-center">Total Tax Amount</th>
          </tr>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 p-1 text-center">Rate</th>
            <th className="border border-gray-400 p-1 text-center">Amount</th>
            <th className="border border-gray-400 p-1 text-center">Rate</th>
            <th className="border border-gray-400 p-1 text-center">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 p-1 text-center">{items[0]?.hsn}</td>
            <td className="border border-gray-400 p-1 text-right">{totalTaxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="border border-gray-400 p-1 text-center">{items[0]?.gstRate / 2}%</td>
            <td className="border border-gray-400 p-1 text-right">{outputCGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="border border-gray-400 p-1 text-center">{items[0]?.gstRate / 2}%</td>
            <td className="border border-gray-400 p-1 text-right">{outputSGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="border border-gray-400 p-1 text-right">{totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-gray-100">
            <td className="border border-gray-400 p-1 font-bold text-center">Total</td>
            <td className="border border-gray-400 p-1 font-bold text-right">{totalTaxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="border border-gray-400 p-1"></td>
            <td className="border border-gray-400 p-1 font-bold text-right">{outputCGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="border border-gray-400 p-1"></td>
            <td className="border border-gray-400 p-1 font-bold text-right">{outputSGST.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="border border-gray-400 p-1 font-bold text-right">{totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>
      {/* ================================================================== */}
      {/* ========= END: UPDATED TAX SUMMARY TABLE STRUCTURE ============= */}
      {/* ================================================================== */}

      {/* Bottom bordered block: Tax amount words + PAN/Declaration + Bank + Signature row */}
      <div className="border border-gray-400 mb-2">
        {/* Tax amount row spanning full width */}
        <div className="border-b border-gray-400 p-2">
          <span className="font-bold">Tax Amount (in words)</span>
          <span> : {billData.taxAmountInWords || "INR Two Thousand Nine Hundred Forty Nine and Four paise Only"}</span>
        </div>
        {/* Two-column content */}
        <div className="grid grid-cols-2">
          <div className="border-r border-gray-400 p-2">
            <p>Company's PAN <span className="inline-block w-1">:</span> <span className="font-bold">{seller.pan}</span></p>
            <p className="mt-2">Declaration_</p>
            {seller.declaration.split('\n').map((line, index) => (
              <p key={index} className="text-justify">{line}</p>
            ))}
          </div>
          <div className="p-2">
            <p className="font-bold">Company's Bank Details</p>
            <div className="grid grid-cols-[120px_1fr] gap-y-0.5 mt-1">
              <div>Bank Name</div><div>: {seller.bankName}</div>
              <div>A/c No</div><div>: {seller.accountNo}</div>
              <div>Branch & IFS Code</div><div>: {seller.branchIfsc}</div>
            </div>
            <p className="text-right font-bold mt-4">for {seller.name}</p>
          </div>
        </div>
        {/* Bottom single-cell row with three labels aligned */}
        <div className="border-t border-gray-400 p-2 text-[10px]">
          <div className="flex items-center justify-between w-full">
            <span>Prepared by</span>
            <span>Verified by</span>
            <span>Authorised Signatory</span>
          </div>
        </div>
      </div>

      <p className="text-center mt-2 text-xs text-gray-600">SUBJECT TO TIRUPUR JURISDICTION</p>
      <p className="text-center text-xs text-gray-600">This is a Computer Generated Invoice</p>
    </div>
  );
};

export default InvoiceI;