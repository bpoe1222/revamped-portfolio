import { ImageResponse } from "next/og";

export const alt = "Bailey Poe — Quality Program Manager and developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f4f0e8",
        color: "#151817",
        padding: "68px 78px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "3px solid #173f33",
          paddingBottom: "24px",
          color: "#173f33",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        <span>BaileyPoe.dev</span>
        <span>Portfolio / Work &amp; Experience</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            color: "#a3492e",
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: "0.12em",
            marginBottom: "18px",
            textTransform: "uppercase",
          }}
        >
          Quality-led work. Practical craft.
        </span>
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 104,
            fontWeight: 700,
            letterSpacing: "-0.045em",
            lineHeight: 1,
          }}
        >
          Bailey Poe
        </span>
        <span
          style={{
            color: "#173f33",
            fontSize: 38,
            marginTop: "22px",
          }}
        >
          Quality Program Manager &amp; Developer
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #9f9a8f",
          paddingTop: "22px",
          color: "#454944",
          fontSize: 22,
        }}
      >
        <span>Quality systems</span>
        <span>Program operations</span>
        <span>Release readiness</span>
        <span>Front-end development</span>
      </div>
    </div>,
    size,
  );
}
