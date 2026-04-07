# Service

Este directorio se ha reducido al minimo util. La idea ahora es muy simple:

- `ConnectionContext.tsx` mantiene el estado real
- `UnifiedConnectionService.tsx` expone una API comun para la app
- `devicecontext.tsx` resuelve el selector de dispositivos
- `websocketcontext.tsx` resuelve el dialogo de configuracion WebSocket

## Archivos que quedan

- `ConnectionContext.tsx`
- `UnifiedConnectionService.tsx`
- `devicecontext.tsx`
- `websocketcontext.tsx`
- `README.md`

## Que se elimino

Se eliminaron estas capas porque solo duplicaban logica o eran adaptadores innecesarios:

- `newService`
- `newService2`
- `ConnectionProviders.tsx`
- `WebSocketService.tsx`
- `NotionService.tsx`
- `sharedConnection.ts`
- `types.ts`

## Por que ahora es mas pequeno

Antes habia varias capas para llegar al mismo sitio:

- provider
- hooks especificos
- hook unificado
- archivos de tipos separados
- archivo intermedio para construir el estado comun

Ahora solo hay una fuente de verdad y una fachada publica. Eso reduce:

- archivos
- imports
- puntos de fallo
- confusion sobre que servicio usa realmente la app

## 1. `ConnectionContext.tsx`

Es el nucleo real del sistema.

### Que hace

- crea y mantiene la conexion WebSocket
- inicializa el cliente de `@neurosity/notion`
- escucha autenticacion del usuario
- escucha cambio de dispositivo
- escucha el estado del dispositivo
- guarda el ultimo `deviceId` en `localStorage`
- expone `useConnection()`

### Que contiene ahora

Tambien contiene los tipos compartidos:

```ts
export type ConnectionMode = "crown" | "websocket" | null;

export interface SharedConnectionData {
  mode: ConnectionMode;
  selectedDeviceContext: string | null;
  stateContext: string | null;
  charging: boolean;
  battery: number | null;
  isConnected: boolean | null;
  lastMessage: string | null;
  error: string | null;
  notion: unknown | null;
  user: unknown | null;
  selectedDevice: unknown | null;
  status: unknown | null;
  loadingUser: boolean;
  lastSelectedDeviceId: string | null;
}
```

### Por que se dejo aqui

Porque esos tipos describen el estado real que vive en este contexto. Tenerlos aqui evita otro archivo extra solo para definiciones.

## 2. `UnifiedConnectionService.tsx`

Es la fachada publica de la carpeta.

### Que hace

Construye una API comun para WebSocket y Crown sobre `useConnection()`.

Expone:

- `info`
- `connectWebSocket(url)`
- `testWebSocketConnection(url)`
- `disconnectWebSocket()`
- `sendWebSocketMessage(message)`
- `loginCrown(email, password)`
- `logoutCrown()`
- `getCrownDevices()`
- `selectCrownDevice(deviceId)`

Ademas devuelve tambien el estado compartido en primer nivel:

- `mode`
- `stateContext`
- `selectedDeviceContext`
- `charging`
- `battery`
- `isConnected`
- `lastMessage`
- `error`
- `user`
- `selectedDevice`
- `status`

### Por que existe

Porque la app necesita una sola API estable para trabajar con ambos modos de conexion sin hablar directamente con el SDK ni con el contexto interno.

### Por que ya no hacen falta `WebSocketService.tsx` y `NotionService.tsx`

Porque sus consumidores se cambiaron a `useUnifiedConnection()`. Tener hooks separados ya no aportaba valor real.

## 3. `devicecontext.tsx`

Mantiene el dialogo de seleccion de dispositivo.

### Que hace

- abre el modal
- carga los dispositivos disponibles
- guarda la seleccion del usuario

### Que cambio

Antes dependia de una capa `useNotion()`. Ahora usa `useUnifiedConnection()` directamente:

- `notionClient`
- `getCrownDevices()`
- `selectCrownDevice(deviceId)`

### Por que se deja separado

Porque es estado de UI, no estado de conexion. Meterlo dentro del contexto principal haria el nucleo mas grande y mas acoplado a PrimeReact.

## 4. `websocketcontext.tsx`

Mantiene el dialogo de configuracion WebSocket del topbar.

### Que hace

- abre el modal de configuracion
- precarga la ultima URL usada desde `localStorage`
- valida que la URL empiece por `ws://` o `wss://`
- permite probar la URL con `testWebSocketConnection(url)` sin guardar nada
- conecta la sesion real con `connectWebSocket(url)`, que es cuando se guarda el modo WebSocket
- muestra el mismo feedback de exito/error que el login con `WebSocketConnectionFeedback`

### Diferencia entre probar y conectar

`testWebSocketConnection(url)` usa un socket temporal y devuelve un resultado simple: `{ url, canConnect, message }`. No cambia el modo, no guarda la URL y no toca `localStorage`.

`connectWebSocket(url)` abre la sesion real y devuelve `true` o `false`, sin lanzar excepciones de WebSocket a la UI. Si conecta bien, `error` queda como `"none"` y entonces se guarda `connectionMode = "websocket"` y `webSocketUrl = url` en `localStorage`.

### Por que se deja separado

Por el mismo motivo que `devicecontext.tsx`: es estado de UI. El contexto principal mantiene la conexion real, y este archivo solo controla el dialogo que permite editar la URL desde el topbar.

## Cambios fuera de `service`

### `app/layout.tsx`

Antes usaba `ConnectionProviders`.

Ahora usa `ConnectionProvider` directamente:

```tsx
<ConnectionProvider>
  <DeviceDialogProvider>
    <WebSocketDialogProvider>{children}</WebSocketDialogProvider>
  </DeviceDialogProvider>
</ConnectionProvider>
```

### Pantallas WebSocket

Estas pantallas dejaron de usar `useWebSocket()` y ahora usan `useUnifiedConnection()`:

- `app/(main)/home/ui/charts/page.tsx`
- `app/(main)/home/ui/neurofeedback/video/page.tsx`
- `app/(main)/home/ui/neurofeedback/imagen/page.tsx`
- `app/(main)/home/ui/neurofeedback/juegoBola/page.tsx`

### Login y topbar

Ya estaban conectados a la fachada comun:

- `app/(main)/page.tsx`
- `layout/AppTopbar.tsx`

En `AppTopbar` ademas se corrigio este error:

```txt
<AppTopbar> is an async Client Component
```

La causa fue que estaba escrito asi:

```tsx
const AppTopbar = forwardRef<any>(async (_, ref) => {
```

Y se cambio a:

```tsx
const AppTopbar = forwardRef<any>((_, ref) => {
```

## Como usar ahora la carpeta

La regla recomendable es:

- si necesitas conexion, usa `useUnifiedConnection()`
- si necesitas solo UI del selector de dispositivo, usa `useDeviceDialog()`
- si necesitas solo UI del dialogo WebSocket, usa `useWebSocketDialog()`
- si necesitas el provider global, usa `ConnectionProvider`

### Ejemplo

```tsx
import { useUnifiedConnection } from "@/service/UnifiedConnectionService";

export function Example() {
  const {
    info,
    connectWebSocket,
    testWebSocketConnection,
    loginCrown,
    logoutCrown,
    sendWebSocketMessage,
  } = useUnifiedConnection();

  return (
    <div>
      <p>Modo: {info.mode ?? "none"}</p>
      <p>Estado: {info.stateContext ?? "offline"}</p>

      <button
        onClick={async () => {
          const result = await testWebSocketConnection("ws://localhost:8001/ws");
          console.log(result.canConnect, result.message);
        }}
      >
        Probar WS
      </button>

      <button onClick={() => connectWebSocket("ws://localhost:8001/ws")}>
        Conectar WS
      </button>

      <button onClick={() => loginCrown("mail@example.com", "secret")}>
        Login Crown
      </button>

      <button onClick={() => sendWebSocketMessage("ping")}>
        Enviar mensaje
      </button>

      <button onClick={logoutCrown}>Logout</button>
    </div>
  );
}
```

## Resumen

Si, se podia dejar mas pequeno.

La carpeta ha pasado de varias capas duplicadas a solo:

- un contexto real
- una fachada publica
- dos piezas de UI auxiliares para Crown y WebSocket

Eso hace el sistema mas facil de mantener y mas claro de entender.
