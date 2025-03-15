import Image from "next/image";
import React from "react";

const Logo = ({ className }) => {
  return <Image src="/download.png" alt="Logo" width="30" height={30} className={`${className}`} />;
};

export default Logo;
