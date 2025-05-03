// Visit status types
export type VisitStatus = "scheduled" | "confirmed" | "completed" | "canceled"

// Visit types
export type VisitTypes = "routine check" | "follow-up"

// Media type in issues
export interface Media {
    type: "photo" | "video"
    url: string
    _id: string
}

// Issue interface
export interface Issue {
    place: string
    issue: string
    type: string
    media: Media[]
    notes: string
    _id: string
}

// Client interface
export interface Client {
    _id: string
    fullname: string
    email: string
}

// Staff interface
export interface Staff {
    _id: string
    fullname: string
    email: string
}

// Visit data interface
export interface VisitData {
    _id: string
    client: Client
    staff: Staff
    address: string
    date: string
    status: string
    cancellationReason?: string
    type?: string
    notes?: string
    isPaid: boolean
    issues: Issue[]
    createdAt: string
    updatedAt: string
    __v: number
}

// Pagination metadata
export interface PaginationMeta {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
}

// API response interface
export interface ApiResponse {
    success: boolean
    data: VisitData[]
    meta: PaginationMeta
}
