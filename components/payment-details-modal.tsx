import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PaymentDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    /* eslint-disable @typescript-eslint/no-explicit-any */
    payment: any
}

export function PaymentDetailsModal({ isOpen, onClose, payment }: PaymentDetailsModalProps) {
    if (!payment) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Payment Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                            <p className="text-sm font-medium break-all">{payment.transactionId}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge
                                className={cn("px-2 py-1 rounded-full text-xs font-medium", {
                                    "bg-[#B3E9C9] text-[#033618]": payment.status === "completed",
                                    "bg-[#FFD6D6] text-[#5C0000]": payment.status === "failed",
                                    "bg-[#FFF3CD] text-[#856404]": payment.status === "pending",
                                    "bg-[#CCE5FF] text-[#004085]": payment.status === "refunded",
                                })}
                            >
                                {payment.status === "completed" ? "Paid" : payment.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Amount</p>
                            <p className="text-sm font-medium">{payment.formattedAmount}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                            <p className="text-sm font-medium capitalize">{payment.paymentMethod}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                            <p className="text-sm font-medium">{formatDate(payment.paymentDate)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Created At</p>
                            <p className="text-sm font-medium">{formatDate(payment.createdAt)}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Customer</p>
                        <p className="text-sm font-medium">{payment.user?.fullname}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
