import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

/* eslint-disable @typescript-eslint/no-explicit-any */
export const generatePaymentPDF = (payment: any) => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Payment Receipt", 105, 15, { align: "center" })

    // Add logo placeholder
    doc.setFontSize(10)
    doc.text("Royal House Check", 20, 20)

    // Add payment details
    doc.setFontSize(12)

    // Customer info
    doc.text("Customer Information:", 20, 40)
    autoTable(doc, {
        startY: 45,
        head: [["Customer Name", "User ID"]],
        body: [[payment.user?.fullname || "N/A", payment.user?.id || "N/A"]],
        theme: "grid",
        headStyles: { fillColor: [75, 75, 75] },
        margin: { left: 20, right: 20 },
    })

    // Payment details
    doc.text("Payment Details:", 20, 70)
    autoTable(doc, {
        startY: 75,
        head: [["Transaction ID", "Amount", "Status", "Payment Method"]],
        body: [
            [
                payment.transactionId || "N/A",
                payment.formattedAmount || "N/A",
                payment.status === "completed" ? "Paid" : payment.status,
                payment.paymentMethod || "N/A",
            ],
        ],
        theme: "grid",
        headStyles: { fillColor: [75, 75, 75] },
        margin: { left: 20, right: 20 },
    })

    // Date information
    doc.text("Date Information:", 20, 100)
    autoTable(doc, {
        startY: 105,
        head: [["Payment Date", "Created At"]],
        body: [
            [
                new Date(payment.paymentDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }) || "N/A",
                new Date(payment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }) || "N/A",
            ],
        ],
        theme: "grid",
        headStyles: { fillColor: [75, 75, 75] },
        margin: { left: 20, right: 20 },
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.text("Thank you for your business!", 105, doc.internal.pageSize.height - 20, { align: "center" })
        doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: "center" })
    }

    return doc
}
