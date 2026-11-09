import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";

export const alt = `${SITE.name}: a private app for couples`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview image for links shared on WhatsApp, Instagram, LinkedIn and X. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #FAF7F2 0%, #F6E3E6 55%, #FBF1EC 100%)",
          fontFamily: "serif",
          color: "#3A2A2E",
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: 6, color: "#8C4B57", textTransform: "uppercase" }}>A private app for couples</div>
        <div style={{ marginTop: 28, fontSize: 130, fontWeight: 700, lineHeight: 1 }}>TaleTwo</div>
        <div style={{ marginTop: 28, fontSize: 44, color: "#5A4448" }}>Your little world, made for two.</div>
        <div style={{ marginTop: 40, fontSize: 28, color: "#8C4B57" }}>Memories · Love letters · Plans · Couple games</div>
      </div>
    ),
    { ...size }
  );
}
