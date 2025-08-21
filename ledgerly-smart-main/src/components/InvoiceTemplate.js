import React from 'react'

/*
  InvoiceTemplate
  - Pixel-consistent print-ready invoice component
  - Tailwind only; all content driven by props

  Usage:
  <InvoiceTemplate
    header={{ title: 'Tax Invoice', subTitle: 'e-Invoice' }}
    irn={{ irn: '...', ackNo: '...', ackDt: '...' }}
    invoice={{ number: 'DPB-067125-26', date: '10-Jul-25', refNo: '', buyerOrderNo: '' }}
    seller={{
      name: 'ESWARI PAPER AND BOARDS',
      addressLines: [
        'VP ELASTIC COMPOUND, 23/70, SAKTHI NAGAR',
        'PUDUPALAYAM POOLUVAPATTI (PO)',
        'TIRUPUR 641 602'
      ],
      phone: ['GST: 93943033, 9796033300'],
      email: 'test@gmail.com',
      stateName: 'Tamil Nadu, Code : 33',
      gstin: '33AAVPC6782C1ZC'
    }}
    consignee={{ name: 'RAJAGANAPATHY TRADERS', addressLines: ['...'], stateName: 'Tamil Nadu, Code : 33', gstin: '33AAPC98767C1ZC' }}
    buyer={{ name: 'RAJAGANAPATHY TRADERS', addressLines: ['...'], stateName: 'Tamil Nadu, Code : 33', gstin: '33AAPC98767C1ZC' }}
    delivery={{ note: '', mode: '', terms: '' }}
    dispatch={{ through: '', ref: '', destination: '' }}
    items={[{ description: 'FOLDING BOX SHEET', details: 'DC#28*36.5CM 250 GSM-', hsn: '48109900', gstRate: 12, qty: 188.000, rate: 2.05, per: '', amount: 24575.40 }]}
    summary={{ cgstRate: 6, sgstRate: 6, cgst: 1474.52, sgst: 1474.52, roundOff: -0.44 }}
    totals={{ taxable: 24575.40, invoiceValue: 27524.00, amountInWords: 'Twenty Seven Thousand Five Hundred Twenty Four Only', taxAmountWords: 'Two Thousand Nine Hundred Forty Nine and Four Paise Only' }}
    bank={{
      accountName: 'HDFC BANK',
      branch: 'AVPCKP6513',
      ifsc: 'HDFC0002488',
      accountNo: '50200055456660'
    }}
    qr={{ placeholder: true }}
  />
*/

const toINR = (value) => {
  if (value === undefined || value === null || isNaN(Number(value))) return ''
  return Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Simple number to words for INR (short, print-safe)
const numberToWords = (num) => {
  if (num === undefined || num === null || isNaN(Number(num))) return ''
  const a = [ '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen' ]
  const b = [ '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety' ]
  const inWordsUpto99 = (n) => (n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : ''))
  const inWords = (n) => {
    let s = ''
    if (n >= 10000000) { s += inWords(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000 }
    if (n >= 100000) { s += inWords(Math.floor(n / 100000)) + ' Lakh '; n %= 100000 }
    if (n >= 1000) { s += inWords(Math.floor(n / 1000)) + ' Thousand '; n %= 1000 }
    if (n >= 100) { s += inWords(Math.floor(n / 100)) + ' Hundred '; n %= 100 }
    if (n > 0) s += (s !== '' ? 'and ' : '') + inWordsUpto99(n)
    return s.trim()
  }
  const whole = Math.floor(Number(num))
  const paise = Math.round((Number(num) - whole) * 100)
  const wholeText = inWords(whole) || 'Zero'
  const paiseText = paise ? `${inWords(paise)} Paise` : 'Only'
  return `${wholeText} ${paise ? 'and ' + paiseText : 'Only'}`
}

const Label = ({ children }) => (
  <div className="text-[10px] leading-[10px] text-gray-700">{children}</div>
)

const Box = ({ children, className = '' }) => (
  <div className={`border border-black/70 ${className}`}>{children}</div>
)

const InvoiceTemplate = ({
  header = { title: 'Tax Invoice', subTitle: 'e-Invoice' },
  irn = { irn: '', ackNo: '', ackDt: '' },
  invoice = { number: '', date: '', refNo: '', buyerOrderNo: '', dispatchDocNo: '', dispatchDate: '', modeOfPayment: '', otherRef: '', buyerOrderDt: '', deliveryNote: '', deliveryNoteDate: '' },
  seller = { name: '', addressLines: [], phone: [], email: '', stateName: '', gstin: '' },
  consignee = { name: '', addressLines: [], stateName: '', gstin: '' },
  buyer = { name: '', addressLines: [], stateName: '', gstin: '' },
  delivery = { note: '', mode: '', terms: '' },
  dispatch = { through: '', ref: '', destination: '' },
  items = [],
  summary = { cgstRate: 0, sgstRate: 0, cgst: 0, sgst: 0, roundOff: 0 },
  totals = { taxable: 0, invoiceValue: 0, amountInWords: '', taxAmountWords: '' },
  bank = { accountName: '', branch: '', ifsc: '', accountNo: '' },
  qr = { placeholder: true, src: '' }
}) => {
  const amountInWords = totals.amountInWords || numberToWords(totals.invoiceValue)
  const taxAmountWords = totals.taxAmountWords || numberToWords((summary?.cgst || 0) + (summary?.sgst || 0))

  return (
    <div className="w-[794px] mx-auto bg-white text-black text-[11px] leading-tight">
      <style>
        {`@page { size: A4; margin: 10mm; }
          @media print { html, body { background: white; } .no-print { display: none !important; } }
          .table th, .table td { border-color: rgba(0,0,0,0.7); }
        `}
      </style>

      {/* Border wrapper */}
      <div className="border border-black/80">
        {/* Top ribbon */}
        <div className="flex items-center justify-between px-2 py-1 border-b border-black/70">
          <div className="text-[11px] font-semibold" />
          <div className="text-[12px] font-semibold">{header.title}</div>
          <div className="text-[11px]">{header.subTitle}</div>
        </div>

        {/* IRN + QR */}
        <div className="grid grid-cols-[1fr_150px] gap-2 p-2 border-b border-black/70">
          <div className="space-y-0.5">
            <div className="flex gap-2"><span className="w-[70px]">IRN</span><span className="flex-1 truncate">: {irn.irn}</span></div>
            <div className="flex gap-2"><span className="w-[70px]">Ack No.</span><span className="flex-1 truncate">: {irn.ackNo}</span></div>
            <div className="flex gap-2"><span className="w-[70px]">Ack Dt.</span><span className="flex-1 truncate">: {irn.ackDt}</span></div>
          </div>
          <div className="border border-black/70 h-[120px] w-[120px] ml-auto flex items-center justify-center">
            {qr.src ? (
              <img src={qr.src} alt="QR" className="h-full w-full object-contain" />
            ) : (
              <div className="text-[10px] text-gray-600">QR CODE</div>
            )}
          </div>
        </div>

        {/* Parties + Invoice Meta */}
        <div className="grid grid-cols-[1fr_1fr] gap-0">
          <Box className="p-1">
            <div className="font-semibold">{seller.name}</div>
            <div className="text-[10px]">
              {seller.addressLines?.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
              {seller.phone?.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
              {seller.email && <div>E-mail : {seller.email}</div>}
              {seller.stateName && <div>State Name : {seller.stateName}</div>}
              {seller.gstin && <div>GSTIN/UIN : {seller.gstin}</div>}
            </div>
          </Box>
          <div className="grid grid-cols-2">
            <Box className="p-1">
              <div className="grid grid-cols-[120px_1fr] gap-y-0.5 text-[10px]">
                <div><Label>Invoice No.</Label></div>
                <div className="font-medium">{invoice.number}</div>
                <div><Label>Dated</Label></div>
                <div>{invoice.date}</div>
                <div><Label>Delivery Note</Label></div>
                <div>{delivery.note}</div>
                <div><Label>Mode/Terms of Payment</Label></div>
                <div>{delivery.mode}</div>
                <div><Label>Reference No. & Date</Label></div>
                <div>{invoice.refNo}</div>
                <div><Label>Other References</Label></div>
                <div>{invoice.otherRef}</div>
                <div><Label>Buyer's Order No.</Label></div>
                <div>{invoice.buyerOrderNo}</div>
                <div><Label>Dated</Label></div>
                <div>{invoice.buyerOrderDt}</div>
                <div><Label>Dispatch Doc No.</Label></div>
                <div>{invoice.dispatchDocNo}</div>
                <div><Label>Delivery Note Date</Label></div>
                <div>{invoice.deliveryNoteDate}</div>
                <div><Label>Dispatch Through</Label></div>
                <div>{dispatch.through}</div>
                <div><Label>Destination</Label></div>
                <div>{dispatch.destination}</div>
                <div><Label>Terms of Delivery</Label></div>
                <div>{delivery.terms}</div>
              </div>
            </Box>
            <Box className="p-1">
              <div className="font-semibold">Consignee (Ship to)</div>
              <div className="text-[10px]">
                <div className="font-medium">{consignee.name}</div>
                {consignee.addressLines?.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
                {consignee.stateName && <div>State Name : {consignee.stateName}</div>}
                {consignee.gstin && <div>GSTIN/UIN : {consignee.gstin}</div>}
              </div>
            </Box>
          </div>
          <Box className="p-1 col-span-1">
            <div className="font-semibold">Buyer (Bill to)</div>
            <div className="text-[10px]">
              <div className="font-medium">{buyer.name}</div>
              {buyer.addressLines?.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
              {buyer.stateName && <div>State Name : {buyer.stateName}</div>}
              {buyer.gstin && <div>GSTIN/UIN : {buyer.gstin}</div>}
            </div>
          </Box>
          <Box className="p-1 col-span-1">
            <div className="font-semibold">Place of Supply</div>
            <div className="text-[10px]">{seller.stateName || '—'}</div>
          </Box>
        </div>

        {/* Items table */}
        <div className="border-t border-black/70">
          <table className="w-full table-fixed border-collapse table">
            <thead>
              <tr className="text-[10px]">
                <th className="border border-black/70 px-1 py-1 text-left w-[28px]">S.No</th>
                <th className="border border-black/70 px-1 py-1 text-left">Description of Goods</th>
                <th className="border border-black/70 px-1 py-1 text-center w-[80px]">HSN/SAC</th>
                <th className="border border-black/70 px-1 py-1 text-center w-[60px]">GST</th>
                <th className="border border-black/70 px-1 py-1 text-right w-[60px]">Qty</th>
                <th className="border border-black/70 px-1 py-1 text-right w-[80px]">Rate</th>
                <th className="border border-black/70 px-1 py-1 text-right w-[90px]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="align-top">
                  <td className="border border-black/70 px-1 py-1 text-center">{idx + 1}</td>
                  <td className="border border-black/70 px-1 py-1">
                    <div className="font-medium">{it.description}</div>
                    {it.details && <div className="text-[10px] text-gray-700">{it.details}</div>}
                  </td>
                  <td className="border border-black/70 px-1 py-1 text-center">{it.hsn}</td>
                  <td className="border border-black/70 px-1 py-1 text-center">{it.gstRate}%</td>
                  <td className="border border-black/70 px-1 py-1 text-right">{toINR(it.qty)}</td>
                  <td className="border border-black/70 px-1 py-1 text-right">{toINR(it.rate)}</td>
                  <td className="border border-black/70 px-1 py-1 text-right">{toINR(it.amount)}</td>
                </tr>
              ))}
              {/* Tax rows under items */}
              <tr>
                <td className="border border-black/70 px-1 py-1 text-right" colSpan={6}>Output CGST {summary.cgstRate}%</td>
                <td className="border border-black/70 px-1 py-1 text-right">{toINR(summary.cgst)}</td>
              </tr>
              <tr>
                <td className="border border-black/70 px-1 py-1 text-right" colSpan={6}>Output SGST {summary.sgstRate}%</td>
                <td className="border border-black/70 px-1 py-1 text-right">{toINR(summary.sgst)}</td>
              </tr>
              <tr>
                <td className="border border-black/70 px-1 py-1 text-right" colSpan={6}>ROUND OFF</td>
                <td className="border border-black/70 px-1 py-1 text-right">{toINR(summary.roundOff)}</td>
              </tr>
              <tr className="font-semibold bg-black/5">
                <td className="border border-black/70 px-1 py-1 text-right" colSpan={6}>₹</td>
                <td className="border border-black/70 px-1 py-1 text-right">{toINR(totals.invoiceValue)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in words */}
        <div className="grid grid-cols-[1fr_180px]">
          <Box className="p-1">
            <div className="flex items-start gap-2">
              <div className="whitespace-nowrap">Amount Chargeable (in words)</div>
              <div className="font-medium">INR {amountInWords}</div>
            </div>
          </Box>
          <Box className="p-1">
            <div className="text-right">E & O E</div>
          </Box>
        </div>

        {/* HSN Summary */}
        <div className="grid grid-cols-[1fr_180px]">
          <Box className="p-1">
            <table className="w-full table-fixed border-collapse table">
              <thead>
                <tr className="text-[10px]">
                  <th className="border border-black/70 px-1 py-1 text-left w-[90px]">HSN/SAC</th>
                  <th className="border border-black/70 px-1 py-1 text-right">Taxable Value</th>
                  <th className="border border-black/70 px-1 py-1 text-right">CGST</th>
                  <th className="border border-black/70 px-1 py-1 text-right">SGST/UTGST</th>
                  <th className="border border-black/70 px-1 py-1 text-right">Total Tax Amt</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="border border-black/70 px-1 py-1">{it.hsn}</td>
                    <td className="border border-black/70 px-1 py-1 text-right">{toINR(it.amount)}</td>
                    <td className="border border-black/70 px-1 py-1 text-right">{toINR((summary.cgst || 0) / items.length)}</td>
                    <td className="border border-black/70 px-1 py-1 text-right">{toINR((summary.sgst || 0) / items.length)}</td>
                    <td className="border border-black/70 px-1 py-1 text-right">{toINR(((summary.cgst || 0) + (summary.sgst || 0)) / items.length)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="border border-black/70 px-1 py-1 text-right">Total</td>
                  <td className="border border-black/70 px-1 py-1 text-right">{toINR(totals.taxable || 0)}</td>
                  <td className="border border-black/70 px-1 py-1 text-right">{toINR(summary.cgst || 0)}</td>
                  <td className="border border-black/70 px-1 py-1 text-right">{toINR(summary.sgst || 0)}</td>
                  <td className="border border-black/70 px-1 py-1 text-right">{toINR((summary.cgst || 0) + (summary.sgst || 0))}</td>
                </tr>
              </tbody>
            </table>
          </Box>
          <Box className="p-1 text-[10px]">
            <div>Tax Amount (in words) : <span className="font-medium">INR {taxAmountWords}</span></div>
            <div className="mt-1">Company's PAN : <span className="font-medium">{bank.branch}</span></div>
            <div className="mt-1">Company's Bank Details</div>
            <div className="grid grid-cols-[120px_1fr] gap-y-0.5 mt-0.5">
              <div>Bank Name :</div><div>{bank.accountName}</div>
              <div>A/c No :</div><div>{bank.accountNo}</div>
              <div>IFSC :</div><div>{bank.ifsc}</div>
              <div>Branch :</div><div>{bank.branch}</div>
            </div>
          </Box>
        </div>

        {/* Footer declaration and signature */}
        <div className="grid grid-cols-[1fr_180px]">
          <Box className="p-1 text-[10px]">
            <div>
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </div>
            <div className="mt-6">Customer's Seal & Signature</div>
          </Box>
          <Box className="p-1 text-[10px]">
            <div className="text-right">for <span className="font-medium">{seller.name}</span></div>
            <div className="h-[60px]" />
            <div className="flex justify-between text-[10px]"><span>Prepared by</span><span>Authorised Signatory</span></div>
          </Box>
        </div>

        <div className="px-2 py-1 text-center text-[10px] border-t border-black/70">
          SUBJECT TO TIRUPUR JURISDICTION
        </div>
        <div className="px-2 pb-2 text-center text-[10px]">This is a Computer Generated Invoice</div>
      </div>
    </div>
  )
}

export default InvoiceTemplate


