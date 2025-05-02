"use client";

import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number; // Add totalItems prop
    itemsPerPage: number; // Add itemsPerPage prop
    onPageChange: (page: number) => void;
}

const PaginationLink = ({
    isActive,
    children,
    className,
    disabled,
    ...props
}: {
    isActive?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
} & React.ComponentProps<"a">) => (
    <a
        aria-current={isActive ? "page" : undefined}
        className={cn(
            buttonVariants({
                variant: isActive ? "outline" : "ghost",
                size: "icon",
            }),
            isActive
                ? "border border-primary text-primary"
                : "border border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
            "rounded-md",
            className
        )}
        {...(disabled ? {} : props)} // Disable props like onClick if disabled
    >
        {children}
    </a>
);

const PaginationComponent: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}) => {
    const handleClick = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        page: number
    ) => {
        e.preventDefault();
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    const getPages = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5; // Show up to 5 page numbers

        if (totalPages <= maxVisiblePages) {
            // Show all pages if totalPages <= maxVisiblePages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate start and end for visible pages
            let startPage = Math.max(2, currentPage - 2);
            let endPage = Math.min(totalPages - 1, currentPage + 2);

            // Adjust if near the start or end
            if (currentPage <= 3) {
                endPage = maxVisiblePages - 1;
            }
            if (currentPage >= totalPages - 2) {
                startPage = totalPages - (maxVisiblePages - 2);
            }

            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pages.push("...");
            }

            // Add visible pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pages.push("...");
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <Pagination className="flex items-center justify-between px-5 py-3 mt-5">
            <div className="">
                <p className="text-[#374151] text-base">Showing {startIndex} to {endIndex} of {totalItems} results</p>
            </div>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e: any) => handleClick(e, currentPage - 1)}
                        aria-disabled={currentPage === 1}
                        className={cn(currentPage === 1 && "opacity-50 cursor-not-allowed")}
                    />
                </PaginationItem>

                {getPages().map((page, index) =>
                    typeof page === "string" ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={page}>
                            <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={(e) => handleClick(e, page)}
                                disabled={page === currentPage}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    )
                )}

                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e: any) => handleClick(e, currentPage + 1)}
                        aria-disabled={currentPage === totalPages}
                        className={cn(
                            currentPage === totalPages && "opacity-50 cursor-not-allowed"
                        )}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationComponent;