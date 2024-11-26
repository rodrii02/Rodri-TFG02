'use client';
import { notion, useNotion } from "@/demo/service/NotionService";
import { useMessage } from "@/layout/context/messagecontext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { useEffect, useState } from "react";

interface Device {
    deviceId: string;
    deviceNickname: string;
  }

const Home = () => {
    const [visible, setVisible] = useState(true);
    const { user, lastSelectedDeviceId } = useNotion();
    const [devices, setDevices] = useState<any[]>([]); // Ensure `devices` is typed as an array of Device
    const [draftDeviceId, setDraftDeviceId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { showMessage } = useMessage();

  useEffect(() => {
    if (!user || submitting ) {
      return;
    }

    notion.getDevices().then((devices: any) => {
        setDevices(devices);
        if (devices.length) {
          setDraftDeviceId(
            draftDeviceId as string ? (lastSelectedDeviceId as string): (devices[0].deviceId as string)
          );
          console.log(draftDeviceId)
        }
      })
      .catch((error) => {
        showMessage({
            severity: 'error',
            summary: 'Error al obtener los dispositivos',
            life: 2000
        });
      })
  }, [user, lastSelectedDeviceId, submitting]);

  function onSubmit(event: any) {
    event.preventDefault();
    setSubmitting(true);
  
    console.log("Draft device ID:", draftDeviceId); // Verifica si `draftDeviceId` tiene el valor correcto
  
    notion
      .selectDevice((devices: any) =>
        devices.find((device: any) => device.deviceId === draftDeviceId)
      )
      .then(() => {
        console.log("Dispositivo seleccionado correctamente");
        setVisible(false); // Cierra el diálogo después de seleccionar el dispositivo
        showMessage({
            severity: 'success',
            summary: 'Dispositivo seleccionado correctamente',
            life: 2000
        });
      })
      .catch((error) => {
        showMessage({
          severity: "error",
          summary: "Error al seleccionar el dispositivo",
          life: 2000,
        });
      })
      .finally(() => {
        setSubmitting(false); // Asegúrate de que `submitting` vuelva a ser falso
      });
  }  

    return (
        <Dialog header="Select a device" visible={visible} style={{ width: '25vw' }} onHide={() => {if (!visible) return; setVisible(false); }}>
            <div className="flex flex-column gap-3 align-items-center justify-content-center ">
                <Dropdown  value={draftDeviceId} onChange={(e: any) => setDraftDeviceId(e.value)} options={devices} optionLabel="deviceNickname" optionValue="deviceId"
                placeholder="Select a device" className="w-full" />
                <Button label="Guardar" className="w-6" onClick={onSubmit}/>
            </div>
        </Dialog>
    );
}
export default Home

