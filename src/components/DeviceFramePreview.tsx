import type { ReactNode } from "react";

import tabletDeviceFrame from "@/assets/tablet-device-frame.png";
import { cn } from "@/lib/utils";

type DeviceFramePreviewProps = {
  imageSrc?: string | null;
  imageAlt: string;
  className?: string;
  fallback?: ReactNode;
};

const DEVICE_VIEWPORT_STYLE = {
  top: "22.1%",
  left: "25.2%",
  width: "49.6%",
  height: "61.1%",
  borderRadius: "0.5rem",
} as const;

export function DeviceFramePreview({ imageSrc, imageAlt, className, fallback }: DeviceFramePreviewProps) {
  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[440px] sm:max-w-[480px]", className)}>
      <div className="absolute" style={DEVICE_VIEWPORT_STYLE}>
        <div className="h-full w-full overflow-hidden rounded-[inherit] bg-card">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
          ) : (
            fallback
          )}
        </div>
      </div>

      <img
        src={tabletDeviceFrame}
        alt=""
        aria-hidden="true"
        className="device-frame-shadow pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
      />
    </div>
  );
}