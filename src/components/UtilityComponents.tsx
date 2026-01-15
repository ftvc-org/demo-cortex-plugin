import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export const Heading: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <h1 className={clsx("mb-2", className)} {...props} />;

export const Section: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={clsx("flex flex-col gap-2", className)} {...props} />;

export const Subsection: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={clsx("flex flex-col gap-2 items-start", className)}
    {...props}
  />
);
