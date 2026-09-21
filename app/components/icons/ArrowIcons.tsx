import type { SVGProps } from "react";

type ArrowIconProps = SVGProps<SVGSVGElement>;

const sharedProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: "false" as const,
};

export function ArrowUpRightIcon(props: ArrowIconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function ArrowRightIcon(props: ArrowIconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: ArrowIconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}
