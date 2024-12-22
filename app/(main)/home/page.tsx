'use client';
import { useNotion } from "@/demo/service/NotionService";
import { useDeviceDialog } from "@/layout/context/devicecontext";
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
        <h1>HOME</h1>
    );
}
export default Home

