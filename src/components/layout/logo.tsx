import { cn } from '@/lib/utils';
import { ImageUp } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <span
      aria-label="ImageSEOFix"
      className={cn(
        'flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground',
        className
      )}
    >
      <ImageUp className="size-4" />
    </span>
  );
}
