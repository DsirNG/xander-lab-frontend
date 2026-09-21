import React from "react";
import PropTypes from "prop-types";

export const Skeleton = ({ className = "", ...props }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-ink-muted/10 ${className}`}
            {...props}
        />
    );
};

Skeleton.propTypes = {
    className: PropTypes.string,
};

export const TableSkeleton = ({ rows = 6 }) => {
    return (
        <div className="w-full space-y-3 p-2">
            {/* Header skeleton */}
            <div className="flex items-center gap-4 pb-3 border-b border-border/80">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20 hidden sm:block" />
                <Skeleton className="h-4 w-20 hidden md:block" />
                <Skeleton className="h-4 w-24 hidden lg:block" />
                <Skeleton className="h-4 w-24 ml-auto" />
            </div>
            {/* Rows skeleton */}
            {Array.from({ length: rows }).map((_, idx) => (
                <div
                    key={idx}
                    className="flex items-center gap-4 py-3 border-b border-border/50"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                        <div className="space-y-1.5 flex-1 max-w-xs">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-16 hidden sm:block" />
                    <Skeleton className="h-4 w-16 hidden md:block" />
                    <Skeleton className="h-4 w-20 hidden lg:block" />
                    <Skeleton className="h-4 w-24 hidden sm:block" />
                    <Skeleton className="h-6 w-6 shrink-0 rounded-lg" />
                </div>
            ))}
        </div>
    );
};

TableSkeleton.propTypes = {
    rows: PropTypes.number,
};

export default Skeleton;
