import { useState, type ImgHTMLAttributes } from "react";

/**
 * Drop-in `<img>` replacement that shows a shimmer placeholder while loading.
 * Accepts all standard img attributes. The shimmer covers the image area and
 * fades out once `onLoad` fires.
 */
export function ShimmerImg({
  className,
  style,
  onLoad,
  onError,
  ...rest
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...(!loaded ? { minHeight: 1 } : undefined),
      }}
    >
      {/* Shimmer overlay */}
      {!loaded && (
        <span
          className="img-shimmer"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            borderRadius: "inherit",
          }}
        />
      )}
      <img
        className={className}
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setLoaded(true); // hide shimmer even on error
          onError?.(e);
        }}
        {...rest}
      />
    </span>
  );
}
