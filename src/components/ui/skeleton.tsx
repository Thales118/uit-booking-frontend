import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      // Thêm bg-gray-200 để chắc chắn nhìn thấy màu xám
      className={cn("animate-pulse rounded-md bg-muted/10 bg-gray-200", className)}
      {...props}
    />
  );
}

export { Skeleton };
