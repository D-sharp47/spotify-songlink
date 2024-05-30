import React, { ReactNode } from "react";
import BG_Faded from "../assets/BG_Faded.png";

interface PageContentProps {
  title: string;
  children: ReactNode;
}

const PageContent: React.FC<PageContentProps> = ({ title, children }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: `url(${BG_Faded})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 style={{ fontSize: "6em", color: "#47a661" }}>{title}</h1>
      <div style={{ fontSize: "2.5em", color: "#47a661" }}>{children}</div>
    </div>
  );
};

export default PageContent;
