import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export const printOrderPDF = async (orderToPrint, isKOT = false) => {
  if (!orderToPrint) return

  try {
    const doc = new jsPDF()
    doc.setFont("helvetica", "bold")

    doc.setFontSize(20)
    doc.text(isKOT ? "Kitchen Order Ticket (KOT)" : "Order Receipt", 105, 20, { align: "center" })

    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.text(orderToPrint.restaurantName || "Restaurant", 105, 30, { align: "center" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(`Order ID: ${orderToPrint.orderId || orderToPrint._id || "N/A"}`, 20, 45)
    doc.setFont("helvetica", "normal")

    const orderDate = orderToPrint.createdAt
      ? new Date(orderToPrint.createdAt).toLocaleString("en-GB", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit"
        })
      : new Date().toLocaleString("en-GB")

    doc.text(`Date: ${orderDate}`, 20, 52)

    if (!isKOT && (orderToPrint.customerAddress || orderToPrint.address || orderToPrint.deliveryAddress)) {
      doc.setFont("helvetica", "bold")
      doc.text("Delivery Address:", 20, 62)
      doc.setFont("helvetica", "normal")
      const addr = orderToPrint.customerAddress || orderToPrint.address || orderToPrint.deliveryAddress
      const addressText = [addr.street, addr.city, addr.state, addr.address].filter(Boolean).join(", ") || "Address not available"
      const addressLines = doc.splitTextToSize(addressText, 170)
      doc.text(addressLines, 20, 69)
    }

    let yPos = isKOT ? 62 : 85
    if (orderToPrint.items && orderToPrint.items.length > 0) {
      doc.setFont("helvetica", "bold")
      doc.text("Items:", 20, yPos)
      yPos += 8

      const tableData = orderToPrint.items.map((item) => {
        const qty = item.quantity || 1
        const price = item.price || 0
        if (isKOT) {
          return [item.name || "Item", qty]
        }
        return [
          item.name || "Item",
          qty,
          `Rs.${price.toFixed(2)}`,
          `Rs.${(price * qty).toFixed(2)}`
        ]
      })

      const head = isKOT ? [["Item", "Qty"]] : [["Item", "Qty", "Price", "Total"]]
      const columnStyles = isKOT 
        ? { 0: { cellWidth: 140 }, 1: { cellWidth: 30, halign: "center" } }
        : { 0: { cellWidth: 80 }, 1: { cellWidth: 30, halign: "center" }, 2: { cellWidth: 35, halign: "right" }, 3: { cellWidth: 35, halign: "right" } }

      autoTable(doc, {
        startY: yPos,
        head,
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9 },
        columnStyles
      })

      yPos = doc.lastAutoTable.finalY + 10
    }

    if (!isKOT) {
      doc.setFontSize(12)
      const total = orderToPrint.total || orderToPrint.pricing?.total || orderToPrint.totalAmount || 0
      doc.text(`Total: Rs.${Number(total).toFixed(2)}`, 20, yPos)

      yPos += 10
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Payment Status: ${orderToPrint.status === "confirmed" ? "Paid" : "Pending"}`, 20, yPos)
    }

    if (orderToPrint.note) {
      yPos += 10
      doc.setFont("helvetica", "bold")
      doc.text("Note:", 20, yPos)
      doc.setFont("helvetica", "normal")
      const noteLines = doc.splitTextToSize(orderToPrint.note, 170)
      doc.text(noteLines, 20, yPos + 7)
    }

    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text(`Generated on ${new Date().toLocaleString("en-GB")}`, 105, pageHeight - 10, { align: "center" })

    const prefix = isKOT ? "KOT" : "Order"
    const fileName = `${prefix}-${orderToPrint.orderId || "Receipt"}-${Date.now()}.pdf`
    doc.save(fileName)
  } catch (err) {
    console.error("Failed to print PDF:", err)
  }
}
