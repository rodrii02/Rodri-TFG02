'use client'
import { useNotion } from "@/demo/service/NotionService";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useMessage } from "./messagecontext";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const DeviceDialogContext= createContext<any>(null)

export const DeviceDialogProvider = ({ children }: { children: React.ReactNode }) => {
    const { notion, lastSelectedDeviceId } = useNotion();
    const [visible, setVisible] = useState(false);
    const [devices, setDevices] = useState<any[]>([]);
    const [draftDeviceId, setDraftDeviceId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { showMessage } = useMessage();

    const showDeviceDialog = useCallback(() => {
        console.log("ENTRA EN DEVICE SELEC")
        if (!notion) {
            console.error("Notion no está definido");
            return;
        }

        setVisible(true);
        notion
            .getDevices()
            .then((devices: any) => {
                setDevices(devices);
                if (devices.length) {
                    setDraftDeviceId(lastSelectedDeviceId || devices[0].deviceId);
                }
            })
            .catch(() => {
                showMessage({
                    severity: 'error',
                    summary: 'Error al obtener los dispositivos',
                    life: 2000,
                });
            });
    }, [notion, lastSelectedDeviceId, showMessage]);

    const onSubmit = (event: any) => {
        event.preventDefault();
        setSubmitting(true);

        notion
            .selectDevice((devices: any) =>
                devices.find((device: any) => device.deviceId === draftDeviceId)
            )
            .then(() => {
                showMessage({
                    severity: 'success',
                    summary: 'Dispositivo seleccionado correctamente',
                    life: 2000,
                });
                setVisible(false);
            })
            .catch(() => {
                showMessage({
                    severity: 'error',
                    summary: 'Error al seleccionar el dispositivo',
                    life: 2000,
                });
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <DeviceDialogContext.Provider value={{ visible, showDeviceDialog }}>
            {children}
            <Dialog
                header="Seleccionar dispositivo"
                visible={visible}
                style={{ width: '25vw' }}
                onHide={() => setVisible(false)}
            >
                <div className="flex flex-column gap-3 align-items-center justify-content-center">
                    <Dropdown
                        value={draftDeviceId}
                        onChange={(e: any) => setDraftDeviceId(e.value)}
                        options={devices}
                        optionLabel="deviceNickname"
                        optionValue="deviceId"
                        placeholder="Seleccione un dispositivo"
                        className="w-full"
                    />
                    <Button
                        label="Guardar"
                        className="w-6"
                        onClick={onSubmit}
                        disabled={submitting || !draftDeviceId}
                    />
                </div>
            </Dialog>
        </DeviceDialogContext.Provider>
    );
};


export const useDeviceDialog = () => useContext(DeviceDialogContext); 
