'use client';
import { useNotion } from "@/demo/service/NotionService";
import { useDeviceDialog } from "@/layout/context/devicecontext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Home = () => {
    const {} = useDeviceDialog();
    const { user, loadingUser } = useNotion();
    const router = useRouter();


    useEffect(() => {
      console.log("User:", user, "LoadingUser:", loadingUser);
      if (!loadingUser && !user &&router) {
          router.push('../login'); // Redirige a la página de inicio si está autenticado
        }
      }, [router, user]);
    return (
      <div className="card flex flex-column text-center" style={{ height: 'calc(100vh - 9rem)' }}>
        <h1>NEUROFEEDBACK</h1>
        <Link href="/">
                <img src={`/layout/images/logo3.png`} width="50%" height={'auto'} alt="logo" />
        </Link>
      </div>
    );
}
export default Home

