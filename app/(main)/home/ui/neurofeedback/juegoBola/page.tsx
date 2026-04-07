'use client';

import { useUnifiedConnection } from '@/service/UnifiedConnectionService';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { classNames } from 'primereact/utils';
import { startTransition, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LayoutContext } from '@/layout/context/layoutcontext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const gridSize = 15; // Tamaño del laberinto (15x15)
const timeLimit = 60; // Tiempo en segundos
type DirectionName = 'arriba' | 'abajo' | 'izquierda' | 'derecha';
type ActionSource = 'Teclado' | 'WebSocket';
type MazeAction = {
    paso: number;
    accion: DirectionName;
    origen: ActionSource;
    resultado: 'movido' | 'bloqueado' | 'meta';
    tiempoRestante: number;
};

const generateMaze = () => {
    // Crear una cuadrícula llena de paredes
    // Se genera una matriz de `gridSize x gridSize` llena de `1` (paredes)
    const maze = Array(gridSize).fill(0).map(() => Array(gridSize).fill(1));

    // Direcciones posibles para moverse (en pasos de 2 para evitar paredes)
    const directions = [
        [0, -2], // Arriba
        [0, 2],  // Abajo
        [-2, 0], // Izquierda
        [2, 0]   // Derecha
    ];

    // Función para verificar si una celda está dentro de los límites del laberinto
    const isInBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < gridSize && y < gridSize;

    // Función recursiva para tallar el camino en el laberinto
    const carvePath = (x: number, y: number) => {
        maze[y][x] = 0; // Convierte la celda actual en un camino (`0` significa paso libre)

        // Mezclar las direcciones aleatoriamente para generar caminos no predecibles
        directions.sort(() => Math.random() - 0.5);

        // Intentar moverse en cada dirección
        for (const [dx, dy] of directions) {
            const nx = x + dx, ny = y + dy; // Nueva posición después del movimiento
            const wallX = x + dx / 2, wallY = y + dy / 2; // Coordenadas de la pared intermedia

            // Si la nueva celda está dentro del laberinto y es una pared (`1`), romper la pared
            if (isInBounds(nx, ny) && maze[ny][nx] === 1) {
                maze[wallY][wallX] = 0; // Rompe la pared entre las dos celdas
                carvePath(nx, ny); // Llamada recursiva para continuar tallando el camino
            }
        }
    };

    // Iniciar la generación del laberinto desde la celda `(1,1)`
    carvePath(1, 1);

    // Retornar el laberinto generado
    maze[gridSize - 2][gridSize - 2] = 0; // Garantiza que la meta sea un camino

    return maze;
};

const isPathAvailable = (maze: number[][]) => {
    //Búsqueda en Anchura (BFS - Breadth First Search) para verificar si hay un camino desde la posición inicial (1,1) 
    //hasta la meta (gridSize - 2, gridSize - 2) en el laberinto.
    const visited = Array(gridSize).fill(0).map(() => Array(gridSize).fill(false));
    const queue = [[1, 1]];
    visited[1][1] = true;

    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0]
    ];

    while (queue.length) {
        const [x, y] = queue.shift()!;
        if (x === gridSize - 2 && y === gridSize - 2) return true; // Si llegamos a la meta, hay camino

        for (const [dx, dy] of directions) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize && maze[ny][nx] === 0 && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push([nx, ny]);
            }
        }
    }
    return false;
};

const createValidMaze = () => {
    let newMaze;
    do {
        newMaze = generateMaze();
    } while (!isPathAvailable(newMaze));

    return newMaze;
};

const JuegoLaberintoPage = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const isDarkMode = layoutConfig.colorScheme === 'dark';
    const [maze, setMaze] = useState<number[][]>([]);
    const [ball, setBall] = useState({ x: 1, y: 1 });
    const [goal] = useState({ x: gridSize - 2, y: gridSize - 2 });
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [active, setActive] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [actionHistory, setActionHistory] = useState<MazeAction[]>([]);
    const gameOver = timeLeft === 0 && !gameWon;

    const { lastMessage } = useUnifiedConnection();

    const mazeColors = useMemo(() => {
        return {
            border: 'var(--surface-border)',
            wall: isDarkMode ? '#e8eff7' : '#111827',
            floor: isDarkMode ? '#030508' : '#f9fafb',
            start: '#ff1d1d',
            goal: '#008000',
        };
    }, [isDarkMode]);

    useEffect(() => {
        startTransition(() => {
            setMaze(createValidMaze());
        });
    }, []);

    //  Controlar el tiempo
    useEffect(() => {
        if (active && timeLeft > 0 && !gameWon) {
            const timer = setInterval(() => setTimeLeft((prev) => Math.max(prev - 1, 0)), 1000);
            return () => clearInterval(timer);
        }
    }, [active, timeLeft, gameWon]);

    //  Mover la bola con las teclas de dirección
    const moveBall = useCallback((dx: number, dy: number, direction: DirectionName, source: ActionSource) => {
        if (!maze.length) return;

        const newX = ball.x + dx;
        const newY = ball.y + dy;
        const canMove = maze[newY]?.[newX] === 0;
        const reachesGoal = canMove && newX === goal.x && newY === goal.y;

        setActionHistory((prev) => ([
            ...prev,
            {
                paso: prev.length + 1,
                accion: direction,
                origen: source,
                resultado: reachesGoal ? 'meta' : canMove ? 'movido' : 'bloqueado',
                tiempoRestante: timeLeft,
            }
        ]));

        if (!canMove) return;

        setBall({ x: newX, y: newY });

        if (reachesGoal) {
            setGameWon(true);
            setActive(false);
        }
    }, [ball.x, ball.y, goal.x, goal.y, maze, timeLeft]);

    const moveBallFromMessage = useCallback((direction: string) => {
        if (!active || gameOver || gameWon) return;

        startTransition(() => {
            if (direction === 'arriba') moveBall(0, -1, 'arriba', 'WebSocket');
            if (direction === 'abajo') moveBall(0, 1, 'abajo', 'WebSocket');
            if (direction === 'izquierda') moveBall(-1, 0, 'izquierda', 'WebSocket');
            if (direction === 'derecha') moveBall(1, 0, 'derecha', 'WebSocket');
        });
    }, [active, gameOver, gameWon, moveBall]);

    // useEffect(() => {
    //     const ws = new WebSocket("ws://localhost:8008/ws");
    
    //     ws.onmessage = (event) => {
    //         const message = JSON.parse(event.data);
    //         if (message.marker) {
    //             console.log("📡 WebSocket recibió:", message.marker);

    //             moveBallFromMessage(message.marker);
    //         }
    //     };
    
    //     ws.onclose = (event) => {
    //         console.log("🔴 WebSocket desconectado", event);
    //         console.log("🔴 Código de cierre:", event.code);
    //         console.log("🔴 Razón:", event.reason);
    //     };        
    
    //     return () => ws.close();
    // }, [ball, active]); // ✅ Agrega ball para asegurarse de que se actualiza correctamente   
    useEffect(() => {
        if (!active || gameOver || gameWon || !lastMessage) return;
      
        try {
          const message = JSON.parse(lastMessage);
          if (message.marker) {
            moveBallFromMessage(message.marker);
          }
        } catch {
          console.error("❌ Error parsing message:", lastMessage);
        }
      }, [lastMessage, active, gameOver, gameWon, moveBallFromMessage]);

    //  Detectar teclas de movimiento
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (active && !gameOver && !gameWon) {
                if (e.key === 'ArrowUp') moveBall(0, -1, 'arriba', 'Teclado');
                if (e.key === 'ArrowDown') moveBall(0, 1, 'abajo', 'Teclado');
                if (e.key === 'ArrowLeft') moveBall(-1, 0, 'izquierda', 'Teclado');
                if (e.key === 'ArrowRight') moveBall(1, 0, 'derecha', 'Teclado');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [active, gameOver, gameWon, moveBall]);

    //  Reiniciar el juego
    const resetGame = () => {
        setMaze(createValidMaze());
        setBall({ x: 1, y: 1 });
        setTimeLeft(timeLimit);
        setGameWon(false);
        setActive(false);
        setActionHistory([]);
    };


    const againGame = () => {
        setBall({ x: 1, y: 1 });
        setTimeLeft(timeLimit);
        setGameWon(false);
        setActive(false);
        setActionHistory([]);
    };

    const exportToExcel = () => {
        const data = actionHistory.map((action) => ({
            Paso: action.paso,
            Accion: action.accion,
            Origen: action.origen,
            Resultado: action.resultado,
            TiempoRestante: action.tiempoRestante,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laberinto');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'resultados_laberinto.xlsx');
    };

    const renderActionResults = () => (
        <div className="flex flex-column gap-3" style={{ width: '100%' }}>
            <div className="flex justify-content-end">
                <Button
                    className="bg-primary"
                    label="Exportar a Excel"
                    icon="pi pi-file-excel"
                    onClick={exportToExcel}
                    disabled={actionHistory.length === 0}
                />
            </div>
            <div className="overflow-auto" style={{ maxHeight: 'min(55vh, 360px)' }}>
                <table className="w-full" style={{ borderCollapse: 'collapse', color: 'var(--text-color)' }}>
                    <thead>
                        <tr>
                            <th className="text-left p-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>Paso</th>
                            <th className="text-left p-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>Acción</th>
                            <th className="text-left p-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>Origen</th>
                            <th className="text-left p-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>Resultado</th>
                            <th className="text-left p-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>Tiempo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actionHistory.length === 0 ? (
                            <tr>
                                <td className="p-2" colSpan={5}>No hay acciones registradas.</td>
                            </tr>
                        ) : actionHistory.map((action) => (
                            <tr key={action.paso}>
                                <td className="p-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>{action.paso}</td>
                                <td className="p-2 capitalize" style={{ borderBottom: '1px solid var(--surface-border)' }}>{action.accion}</td>
                                <td className="p-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>{action.origen}</td>
                                <td className="p-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>{action.resultado}</td>
                                <td className="p-2" style={{ borderBottom: '1px solid var(--surface-border)' }}>{action.tiempoRestante}s</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const mazeCells = useMemo(() => {
        return maze.map((row, y) => row.map((cell, x) => (
            <div key={`${x}-${y}`} style={{
                position: 'absolute',
                left: `${(x / gridSize) * 100}%`,
                top: `${(y / gridSize) * 100}%`,
                width: `${100 / gridSize}%`,
                height: `${100 / gridSize}%`,
                backgroundColor: cell === 1 ? mazeColors.wall : 'transparent'
            }} />
        )));
    }, [maze, mazeColors.wall]);

    return (
        <div className="card overflow-y" style={{ height: 'calc(100vh - 9rem)' }}>

            <div className="flex justify-content-center align-items-center mt-1" style={{ width: '100%' }}>
                <div style={{
                    position: 'relative',
                    width: 'min(90vw, 500px)', //  Máximo 500px, pero se ajusta hasta el 90% del ancho de la pantalla
                    height: 'min(90vw, 500px)',
                    border: `5px solid ${mazeColors.border}`,
                    background: mazeColors.floor,
                    display: 'flex',
                    flexWrap: 'wrap'
                }}>
                    {mazeCells}

                    {/* Bola */}
                    <div style={{
                        width: `${(100 / gridSize) - 2}%`,
                        height: `${(100 / gridSize) - 2}%`,
                        backgroundColor: mazeColors.start,
                        borderRadius: '50%',
                        position: 'absolute',
                        left: `${(ball.x / gridSize) * 100 + 1}%`,
                        top: `${(ball.y / gridSize) * 100 + 1}%`,
                        transition: 'top 0.1s, left 0.1s'
                    }} />

                    {/* Meta */}
                    <div style={{
                        width: `${100 / gridSize}%`,
                        height: `${100 / gridSize}%`,
                        backgroundColor: mazeColors.goal,
                        position: 'absolute',
                        left: `${(goal.x / gridSize) * 100}%`,
                        top: `${(goal.y / gridSize) * 100}%`
                    }} />
                </div>
            </div>


            <div className="flex flex-column align-items-center">
                <div className="mb-2 font-bold text-4xl">{timeLeft}</div>
                <div className="flex gap-2">
                    <Button className={classNames('w-8rem', { 'p-button-danger': active })}
                        onClick={() => setActive(!active)} label={active ? 'Stop' : 'Resume'} />
                    <Button icon="pi pi-refresh" onClick={resetGame} />
                </div>
            </div>

            <Dialog header="¡Tiempo agotado!" visible={gameOver} style={{ width: 'min(92vw, 900px)' }} breakpoints={{ '960px': '92vw', '641px': '96vw' }} onHide={resetGame}>
                <div className='flex flex-column align-items-center'>
                    <p>¡No lograste llegar a la meta a tiempo!</p>
                    {renderActionResults()}
                    <Button label="Reintentar" icon="pi pi-refresh" onClick={againGame} />
                </div>
            </Dialog>

            <Dialog header="¡Ganaste!" visible={gameWon} style={{ width: 'min(92vw, 900px)' }} breakpoints={{ '960px': '92vw', '641px': '96vw' }} onHide={resetGame}>
                <div className='flex flex-column align-items-center'>
                    <p>¡Lograste escapar del laberinto en {timeLimit - timeLeft} segundos!</p>
                    {renderActionResults()}
                    <Button label="Jugar de nuevo" icon="pi pi-play" onClick={resetGame} />
                </div>
            </Dialog>
        </div>
    );
};

export default JuegoLaberintoPage;
