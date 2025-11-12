'use client';

import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';

const gridSize = 15; // Tamaño del laberinto (15x15)
const cellSize = 30; // Tamaño de cada celda en píxeles
const speed = 1; // Velocidad de la bola (en celdas)
const timeLimit = 60; // Tiempo en segundos

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

const JuegoLaberintoPage = () => {
    const [maze, setMaze] = useState<number[][]>([]);
    const [ball, setBall] = useState({ x: 1, y: 1 });
    const [goal] = useState({ x: gridSize - 2, y: gridSize - 2 });
    const [timeLeft, setTimeLeft] = useState(timeLimit);
    const [active, setActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    // 🔹 Generar un laberinto válido
    useEffect(() => {
        let newMaze;
        do {
            newMaze = generateMaze();
        } while (!isPathAvailable(newMaze)); // Asegurar que la meta es alcanzable

        setMaze(newMaze);
    }, []);

    //  Controlar el tiempo
    useEffect(() => {
        if (active && timeLeft > 0 && !gameOver && !gameWon) {
            const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setGameOver(true);
        }
    }, [active, timeLeft, gameOver, gameWon]);

    //  Mover la bola con las teclas de dirección
    const moveBall = (dx: number, dy: number) => {
        setBall((prevBall) => {
            const newX = prevBall.x + dx;
            const newY = prevBall.y + dy;
            console.log("🔵 Moviendo a:", newX, newY, maze[newY]?.[newX]);
    
            if (maze[newY]?.[newX] === 0) {
                if (newX === goal.x && newY === goal.y) {
                    setGameWon(true);
                    setActive(false);
                }
                return { x: newX, y: newY }; // Devuelve el nuevo estado
            }
            return prevBall; // Si no puede moverse, mantiene la posición
        });
    };
    

    const moveBallFromMessage = (direction: string) => {
        
        if(active && !gameOver && !gameWon){
            if (direction === "arriba") moveBall(0, -1);
            if (direction === "abajo") moveBall(0, 1);
            if (direction === "izquierda") moveBall(-1, 0);
            if (direction === "derecha") moveBall(1, 0);
        }
    };

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws");
    
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.marker) {
                console.log("📡 WebSocket recibió:", message.marker);

                moveBallFromMessage(message.marker);
            }
        };
    
        ws.onclose = (event) => {
            console.log("🔴 WebSocket desconectado", event);
            console.log("🔴 Código de cierre:", event.code);
            console.log("🔴 Razón:", event.reason);
        };        
    
        return () => ws.close();
    }, [ball, active]); // ✅ Agrega ball para asegurarse de que se actualiza correctamente    

    //  Detectar teclas de movimiento
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (active && !gameOver && !gameWon) {
                console.log("🔵 Tecla presionada:", ball);
                if (e.key === 'ArrowUp') moveBall(0, -1);
                if (e.key === 'ArrowDown') moveBall(0, 1);
                if (e.key === 'ArrowLeft') moveBall(-1, 0);
                if (e.key === 'ArrowRight') moveBall(1, 0);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [ball, active, gameOver, gameWon]);

    //  Reiniciar el juego
    const resetGame = () => {
        let newMaze;
        do {
            newMaze = generateMaze();
        } while (!isPathAvailable(newMaze));

        setMaze(newMaze);
        setBall({ x: 1, y: 1 });
        setTimeLeft(timeLimit);
        setGameOver(false);
        setGameWon(false);
        setActive(false);
    };


    const againGame = () => {
        setBall({ x: 1, y: 1 });
        setTimeLeft(timeLimit);
        setGameOver(false);
        setGameWon(false);
        setActive(false);
    };

    return (
        <div className="card overflow-y" style={{ height: 'calc(100vh - 9rem)' }}>

            <div className="flex justify-content-center align-items-center mt-4" style={{ width: '100%' }}>
                <div style={{
                    position: 'relative',
                    width: 'min(90vw, 500px)', //  Máximo 500px, pero se ajusta hasta el 90% del ancho de la pantalla
                    height: 'min(90vw, 500px)',
                    border: '5px solid black',
                    background: '#eee',
                    display: 'flex',
                    flexWrap: 'wrap'
                }}>
                    {maze.map((row, y) => row.map((cell, x) => (
                        <div key={`${x}-${y}`} style={{
                            position: 'absolute',
                            left: `${(x / gridSize) * 100}%`, //  Proporcional al tamaño del grid
                            top: `${(y / gridSize) * 100}%`,
                            width: `${100 / gridSize}%`,
                            height: `${100 / gridSize}%`,
                            backgroundColor: cell === 1 ? 'black' : 'transparent'
                        }} />
                    )))}

                    {/* Bola */}
                    <div style={{
                        width: `${(100 / gridSize) - 2}%`,
                        height: `${(100 / gridSize) - 2}%`,
                        backgroundColor: 'red',
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
                        backgroundColor: 'green',
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

            <Dialog header="¡Tiempo agotado!" visible={gameOver} style={{ width: '25vw' }} onHide={resetGame}>
                <div className='flex flex-column align-items-center'>
                    <p>¡No lograste llegar a la meta a tiempo!</p>
                    <Button label="Reintentar" icon="pi pi-refresh" onClick={againGame} />
                </div>
            </Dialog>

            <Dialog header="¡Ganaste!" visible={gameWon} style={{ width: '25vw' }} onHide={resetGame}>
                <div className='flex flex-column align-items-center'>
                    <p>¡Lograste escapar del laberinto en {timeLimit - timeLeft} segundos!</p>
                    <Button label="Jugar de nuevo" icon="pi pi-play" onClick={resetGame} />
                </div>
            </Dialog>
        </div>
    );
};

export default JuegoLaberintoPage;
