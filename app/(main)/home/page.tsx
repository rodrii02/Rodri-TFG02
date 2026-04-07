"use client";
import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import { LayoutContext } from "@/layout/context/layoutcontext";

const Home = () => {
  const { layoutConfig } = useContext(LayoutContext);

  return (
    <div
      className="card flex flex-column text-center justify-content-center align-items-center"
      style={{ height: "calc(100vh - 9rem)" }}
    >
      <h1>NEUROFEEDBACK</h1>

      <Image
        src={
          layoutConfig.colorScheme === "dark"
            ? "/layout/images/imagenEEG-dark.webp"
            : "/layout/images/imagenEEG-light.png"
        }
        alt="logo"
        width={300}
        height={300}
        style={{ width: "50%", height: "auto" }}
      />
    </div>
  );
};
export default Home;
