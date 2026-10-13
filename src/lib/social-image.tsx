import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const socialImageSize = { width: 1200, height: 630 };
export const socialImageAlt = `${profile.name}, ${profile.headline}: React, Next.js, TypeScript and frontend architecture`;

const NODES = [0, 1, 2, 3, 4];

/**
 * 1200x630 share card. Deliberately plain: name, role and stack set large enough to read at thumbnail size on a
 * dark ground, with one understated hint of the site's identity (a faint teal glow and a small node-and-line motif,
 * echoing the project diagrams). No WebGL, no fish, no fetched fonts: it renders from the default font at build time.
 */
export function renderSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background:
            "radial-gradient(ellipse 70% 80% at 85% 0%, rgba(94,234,212,0.16), rgba(94,234,212,0) 65%), radial-gradient(ellipse 60% 70% at 0% 100%, rgba(38,72,112,0.38), rgba(38,72,112,0) 65%), #07090c",
          color: "#c9d1d9",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#5eead4", textTransform: "uppercase" }}>
          {profile.yearsExperience} years · {profile.location}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 132, fontWeight: 700, lineHeight: 1.02, color: "#ffffff", letterSpacing: -3 }}>{profile.name}</div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 50, fontWeight: 500, color: "#c9d1d9" }}>{profile.headline}</div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 30, color: "#8b96a3" }}>React · Next.js · TypeScript · Frontend Architecture</div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {NODES.map((node) => (
            <div key={node} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", width: 22, height: 22, border: "2px solid rgba(94,234,212,0.7)", background: node === 3 ? "rgba(94,234,212,0.35)" : "transparent" }} />
              {node < NODES.length - 1 && <div style={{ display: "flex", width: 56, height: 2, background: "rgba(94,234,212,0.32)" }} />}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...socialImageSize },
  );
}

/** Small monogram used for the favicon and touch icon. */
export function renderMonogram(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c1117",
          border: `${Math.max(2, Math.round(size / 24))}px solid rgba(94,234,212,0.75)`,
          borderRadius: Math.round(size * 0.22),
          color: "#5eead4",
          fontSize: Math.round(size * 0.46),
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        NR
      </div>
    ),
    { width: size, height: size },
  );
}
