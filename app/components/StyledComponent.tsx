"use client";

import React from "react";
import { Raleway, Fira_Code } from "next/font/google";
const raleway = Raleway({ subsets: ["latin"] });
const firaCode = Fira_Code({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const StyledLayout = () => {
  return (
    <div>
      <style jsx global>{`
        :root {
          --raleway: ${raleway.style.fontFamily};
          --fira-code: ${firaCode.style.fontFamily};
        }
      `}</style>
    </div>
  );
};

export default StyledLayout;
