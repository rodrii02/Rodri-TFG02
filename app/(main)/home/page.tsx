"use client";
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  return (
    <div
      className="card flex flex-column text-center"
      style={{ height: "calc(100vh - 9rem)" }}
    >
      <h1>NEUROFEEDBACK</h1>
      <Link href="/">
        <Image
          src="/layout/images/logo3.png"
          alt="logo"
          width={300}
          height={300}
          style={{ width: "50%", height: "auto" }}
        />
      </Link>
    </div>
  );
};
export default Home;
