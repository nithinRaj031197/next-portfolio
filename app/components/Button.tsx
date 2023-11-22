import Link from "next/link";
import React from "react";

function Button({ text, link, icon }: { text: string; link: string; icon: any }) {
  return (
    <Link className="btn" href={link} target="_blank">
      {text}
      {icon}
    </Link>
  );
}

export default Button;
