import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "quiet";

// One interaction language: a 1px lift and a colour/border response over 200ms. Quiet links underline instead.
const styles: Record<Variant, string> = {
  primary: "rounded-md bg-accent px-5 py-2.5 text-abyss hover:-translate-y-px hover:bg-white",
  secondary: "rounded-md border border-mist/35 px-5 py-2.5 text-silver hover:-translate-y-px hover:border-accent/70 hover:text-white",
  quiet: "link-underline rounded-sm px-1 py-2.5 text-mist hover:text-white",
};

interface ButtonLinkProps extends ComponentProps<"a"> {
  variant?: Variant;
}

export function ButtonLink({ variant = "secondary", className = "", children, ...props }: ButtonLinkProps) {
  const external = typeof props.href === "string" && /^https?:/.test(props.href);
  const file = typeof props.href === "string" && props.href.endsWith(".pdf");
  return (
    <a
      {...(external || file ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex items-center gap-2 text-sm font-medium transition-[translate,background-color,border-color,color] duration-200 ease-out ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
      {(external || file) && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
