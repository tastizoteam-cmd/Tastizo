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
    let restName = orderToPrint.restaurantName;
    if (!restName || restName === "Restaurant") {
      try {
        const userStr = localStorage.getItem("restaurant_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          restName = user.restaurantName || user.restaurant_name || user.restaurant?.name || user.name;
        }
        if (!restName || restName === "Restaurant") {
          const dataStr = localStorage.getItem("restaurant_data");
          if (dataStr) {
            const data = JSON.parse(dataStr);
            restName = data.restaurantName?.english || data.restaurantName;
          }
        }
      } catch (e) {
        console.error("Error getting restaurant name fallback:", e);
      }
    }
    doc.text(restName || "Restaurant", 105, 30, { align: "center" })

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
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Bill Summary:", 20, yPos)
      yPos += 7

      doc.setFont("helvetica", "normal")
      const pricing = orderToPrint.pricing || {};
      const itemTotal = pricing.subtotal || pricing.itemTotal || 0;
      const deliveryCharge = pricing.deliveryCharge || pricing.deliveryFee || 0;
      const platformFee = pricing.platformFee || 0;
      const packagingFee = pricing.packagingCharge || pricing.packagingFee || 0;
      const gst = pricing.tax || pricing.gst || 0;
      const discount = pricing.discount || pricing.couponDiscount || 0;
      const totalBill = pricing.total || orderToPrint.total || orderToPrint.totalAmount || 0;

      if (itemTotal > 0) {
        doc.text("Item Total:", 20, yPos)
        doc.text(`Rs.${Number(itemTotal).toFixed(2)}`, 190, yPos, { align: "right" })
        yPos += 5
      }
      if (packagingFee > 0) {
        doc.text("Packaging Fee:", 20, yPos)
        doc.text(`Rs.${Number(packagingFee).toFixed(2)}`, 190, yPos, { align: "right" })
        yPos += 5
      }
      if (gst > 0) {
        doc.text("GST / Taxes:", 20, yPos)
        doc.text(`Rs.${Number(gst).toFixed(2)}`, 190, yPos, { align: "right" })
        yPos += 5
      }
      if (deliveryCharge > 0) {
        doc.text("Delivery Fee:", 20, yPos)
        doc.text(`Rs.${Number(deliveryCharge).toFixed(2)}`, 190, yPos, { align: "right" })
        yPos += 5
      }
      if (platformFee > 0) {
        doc.text("Platform Fee:", 20, yPos)
        doc.text(`Rs.${Number(platformFee).toFixed(2)}`, 190, yPos, { align: "right" })
        yPos += 5
      }
      if (discount > 0) {
        doc.text("Discount:", 20, yPos)
        doc.text(`-Rs.${Number(discount).toFixed(2)}`, 190, yPos, { align: "right" })
        yPos += 5
      }

      yPos += 2
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.line(20, yPos, 190, yPos)
      yPos += 6

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Total Paid:", 20, yPos)
      doc.text(`Rs.${Number(totalBill).toFixed(2)}`, 190, yPos, { align: "right" })
      yPos += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const isCOD = (orderToPrint.paymentMethod || "").toLowerCase() === "cash" || (orderToPrint.paymentMethod || "").toLowerCase() === "cod";
      const isDelivered = orderToPrint.status === "delivered";
      const isPaid = !isCOD || isDelivered || orderToPrint.payment?.status === "paid" || orderToPrint.paymentStatus === "paid" || orderToPrint.status === "confirmed" || orderToPrint.status === "preparing" || orderToPrint.status === "ready" || orderToPrint.status === "out_for_delivery";
      const paymentStatusStr = isPaid ? "Paid" : "Pending";
      doc.text(`Payment Status: ${paymentStatusStr}`, 20, yPos)
      yPos += 5
      if (orderToPrint.paymentMethod) {
        doc.text(`Payment Method: ${orderToPrint.paymentMethod}`, 20, yPos)
      }
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
