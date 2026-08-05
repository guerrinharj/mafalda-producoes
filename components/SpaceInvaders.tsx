'use client'

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'

type Props = {
    locale: string
}

type Player = {
    x: number
    y: number
    width: number
    height: number
    speed: number
}

type Alien = {
    x: number
    y: number
    width: number
    height: number
    alive: boolean
    type: number
}

type Bullet = {
    x: number
    y: number
    width: number
    height: number
    speed: number
}

type EnemyBullet = {
    x: number
    y: number
    width: number
    height: number
    speed: number
}

const GAME_WIDTH = 900
const GAME_HEIGHT = 600

const PLAYER_WIDTH = 54
const PLAYER_HEIGHT = 28

const ALIEN_WIDTH = 38
const ALIEN_HEIGHT = 26

const ALIEN_COLUMNS = 10
const ALIEN_ROWS = 5

const CREAM = '#F4EEDB'
const BLACK = '#000000'

function createAliens(): Alien[] {
    const aliens: Alien[] = []

    const horizontalSpacing = 62
    const verticalSpacing = 48

    const formationWidth =
        (ALIEN_COLUMNS - 1) *
            horizontalSpacing +
        ALIEN_WIDTH

    const startX =
        (GAME_WIDTH - formationWidth) / 2

    for (
        let row = 0;
        row < ALIEN_ROWS;
        row++
    ) {
        for (
            let column = 0;
            column < ALIEN_COLUMNS;
            column++
        ) {
            aliens.push({
                x:
                    startX +
                    column *
                        horizontalSpacing,
                y:
                    80 +
                    row *
                        verticalSpacing,
                width: ALIEN_WIDTH,
                height: ALIEN_HEIGHT,
                alive: true,
                type: row,
            })
        }
    }

    return aliens
}

function intersects(
    first: {
        x: number
        y: number
        width: number
        height: number
    },
    second: {
        x: number
        y: number
        width: number
        height: number
    }
) {
    return (
        first.x <
            second.x + second.width &&
        first.x + first.width >
            second.x &&
        first.y <
            second.y + second.height &&
        first.y + first.height >
            second.y
    )
}

export default function SpaceInvaders({
    locale,
}: Props) {
    const canvasRef =
        useRef<HTMLCanvasElement>(null)

    const animationFrameRef =
        useRef<number | null>(null)

    const keysRef = useRef({
        left: false,
        right: false,
    })

    const playerRef = useRef<Player>({
        x:
            GAME_WIDTH / 2 -
            PLAYER_WIDTH / 2,
        y: GAME_HEIGHT - 70,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: 430,
    })

    const aliensRef =
        useRef<Alien[]>(createAliens())

    const bulletsRef =
        useRef<Bullet[]>([])

    const enemyBulletsRef =
        useRef<EnemyBullet[]>([])

    const alienDirectionRef = useRef(1)
    const alienSpeedRef = useRef(45)
    const lastTimeRef = useRef(0)
    const lastShotRef = useRef(0)
    const lastEnemyShotRef = useRef(0)

    const scoreRef = useRef(0)
    const livesRef = useRef(3)
    const levelRef = useRef(1)

    const gameStatusRef = useRef<
        'playing' | 'game-over' | 'won'
    >('playing')

    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [level, setLevel] = useState(1)

    const [gameStatus, setGameStatus] =
        useState<
            'playing' | 'game-over' | 'won'
        >('playing')

    const drawPlayer = useCallback(
        (
            context: CanvasRenderingContext2D,
            player: Player
        ) => {
            context.fillStyle = CREAM

            context.fillRect(
                player.x + 21,
                player.y,
                12,
                8
            )

            context.fillRect(
                player.x + 14,
                player.y + 8,
                26,
                8
            )

            context.fillRect(
                player.x,
                player.y + 16,
                player.width,
                12
            )

            context.fillStyle = BLACK

            context.fillRect(
                player.x + 7,
                player.y + 20,
                6,
                8
            )

            context.fillRect(
                player.x + 41,
                player.y + 20,
                6,
                8
            )
        },
        []
    )

    const drawAlien = useCallback(
        (
            context: CanvasRenderingContext2D,
            alien: Alien
        ) => {
            context.fillStyle = CREAM

            const x = alien.x
            const y = alien.y

            if (alien.type <= 1) {
                context.fillRect(
                    x + 10,
                    y,
                    18,
                    5
                )

                context.fillRect(
                    x + 5,
                    y + 5,
                    28,
                    5
                )

                context.fillRect(
                    x,
                    y + 10,
                    38,
                    10
                )

                context.fillRect(
                    x + 5,
                    y + 20,
                    8,
                    6
                )

                context.fillRect(
                    x + 25,
                    y + 20,
                    8,
                    6
                )

                context.fillStyle = BLACK

                context.fillRect(
                    x + 9,
                    y + 12,
                    5,
                    5
                )

                context.fillRect(
                    x + 24,
                    y + 12,
                    5,
                    5
                )
            } else {
                context.fillRect(
                    x + 7,
                    y,
                    7,
                    6
                )

                context.fillRect(
                    x + 24,
                    y,
                    7,
                    6
                )

                context.fillRect(
                    x + 4,
                    y + 6,
                    30,
                    6
                )

                context.fillRect(
                    x,
                    y + 12,
                    38,
                    9
                )

                context.fillRect(
                    x + 5,
                    y + 21,
                    8,
                    5
                )

                context.fillRect(
                    x + 25,
                    y + 21,
                    8,
                    5
                )

                context.fillStyle = BLACK

                context.fillRect(
                    x + 9,
                    y + 13,
                    5,
                    5
                )

                context.fillRect(
                    x + 24,
                    y + 13,
                    5,
                    5
                )
            }
        },
        []
    )

    const shoot = useCallback(() => {
        if (
            gameStatusRef.current !==
            'playing'
        ) {
            return
        }

        const now = performance.now()

        if (
            now -
                lastShotRef.current <
            280
        ) {
            return
        }

        const player = playerRef.current

        bulletsRef.current.push({
            x:
                player.x +
                player.width / 2 -
                2,
            y: player.y - 12,
            width: 4,
            height: 14,
            speed: 620,
        })

        lastShotRef.current = now
    }, [])

    const resetGame = useCallback(() => {
        playerRef.current = {
            x:
                GAME_WIDTH / 2 -
                PLAYER_WIDTH / 2,
            y: GAME_HEIGHT - 70,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            speed: 430,
        }

        aliensRef.current = createAliens()
        bulletsRef.current = []
        enemyBulletsRef.current = []

        alienDirectionRef.current = 1
        alienSpeedRef.current = 45

        scoreRef.current = 0
        livesRef.current = 3
        levelRef.current = 1

        gameStatusRef.current = 'playing'

        setScore(0)
        setLives(3)
        setLevel(1)
        setGameStatus('playing')

        lastTimeRef.current =
            performance.now()
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current

        if (!canvas) {
            return
        }


        const canvasContext =
            canvas.getContext('2d')

        if (!canvasContext) {
            return
        }

        const context: CanvasRenderingContext2D =
            canvasContext

        context.imageSmoothingEnabled = false


        function enemyShoot(
            currentTime: number
        ) {
            if (
                currentTime -
                    lastEnemyShotRef.current <
                Math.max(
                    420,
                    1100 -
                        levelRef.current *
                            90
                )
            ) {
                return
            }

            const aliveAliens =
                aliensRef.current.filter(
                    (alien) => alien.alive
                )

            if (aliveAliens.length === 0) {
                return
            }

            const randomAlien =
                aliveAliens[
                    Math.floor(
                        Math.random() *
                            aliveAliens.length
                    )
                ]

            enemyBulletsRef.current.push({
                x:
                    randomAlien.x +
                    randomAlien.width /
                        2 -
                    2,
                y:
                    randomAlien.y +
                    randomAlien.height,
                width: 4,
                height: 14,
                speed:
                    210 +
                    levelRef.current * 18,
            })

            lastEnemyShotRef.current =
                currentTime
        }

        function update(
            deltaTime: number,
            currentTime: number
        ) {
            if (
                gameStatusRef.current !==
                'playing'
            ) {
                return
            }

            const player =
                playerRef.current

            if (keysRef.current.left) {
                player.x -=
                    player.speed * deltaTime
            }

            if (keysRef.current.right) {
                player.x +=
                    player.speed * deltaTime
            }

            player.x = Math.max(
                12,
                Math.min(
                    GAME_WIDTH -
                        player.width -
                        12,
                    player.x
                )
            )

            bulletsRef.current =
                bulletsRef.current
                    .map((bullet) => ({
                        ...bullet,
                        y:
                            bullet.y -
                            bullet.speed *
                                deltaTime,
                    }))
                    .filter(
                        (bullet) =>
                            bullet.y +
                                bullet.height >
                            0
                    )

            enemyBulletsRef.current =
                enemyBulletsRef.current
                    .map((bullet) => ({
                        ...bullet,
                        y:
                            bullet.y +
                            bullet.speed *
                                deltaTime,
                    }))
                    .filter(
                        (bullet) =>
                            bullet.y <
                            GAME_HEIGHT
                    )

            const aliveAliens =
                aliensRef.current.filter(
                    (alien) => alien.alive
                )

            let shouldDrop = false

            for (const alien of aliveAliens) {
                const nextX =
                    alien.x +
                    alienDirectionRef.current *
                        alienSpeedRef.current *
                        deltaTime

                if (
                    nextX <= 10 ||
                    nextX +
                        alien.width >=
                        GAME_WIDTH - 10
                ) {
                    shouldDrop = true
                    break
                }
            }

            if (shouldDrop) {
                alienDirectionRef.current *= -1

                for (const alien of aliveAliens) {
                    alien.y += 18
                }
            } else {
                for (const alien of aliveAliens) {
                    alien.x +=
                        alienDirectionRef.current *
                        alienSpeedRef.current *
                        deltaTime
                }
            }

            for (const bullet of bulletsRef.current) {
                for (const alien of aliensRef.current) {
                    if (
                        !alien.alive ||
                        !intersects(
                            bullet,
                            alien
                        )
                    ) {
                        continue
                    }

                    alien.alive = false
                    bullet.y = -100

                    const points =
                        alien.type <= 1
                            ? 30
                            : alien.type <= 3
                              ? 20
                              : 10

                    scoreRef.current += points
                    setScore(scoreRef.current)

                    break
                }
            }

            bulletsRef.current =
                bulletsRef.current.filter(
                    (bullet) =>
                        bullet.y > -50
                )

            for (const bullet of enemyBulletsRef.current) {
                if (
                    !intersects(
                        bullet,
                        player
                    )
                ) {
                    continue
                }

                bullet.y =
                    GAME_HEIGHT + 100

                livesRef.current -= 1
                setLives(livesRef.current)

                player.x =
                    GAME_WIDTH / 2 -
                    player.width / 2

                if (
                    livesRef.current <= 0
                ) {
                    gameStatusRef.current =
                        'game-over'

                    setGameStatus(
                        'game-over'
                    )
                }
            }

            enemyBulletsRef.current =
                enemyBulletsRef.current.filter(
                    (bullet) =>
                        bullet.y <
                        GAME_HEIGHT + 50
                )

            const remainingAliens =
                aliensRef.current.filter(
                    (alien) => alien.alive
                )

            const aliensReachedPlayer =
                remainingAliens.some(
                    (alien) =>
                        alien.y +
                            alien.height >=
                        player.y
                )

            if (aliensReachedPlayer) {
                gameStatusRef.current =
                    'game-over'

                setGameStatus('game-over')
            }

            if (
                remainingAliens.length === 0
            ) {
                levelRef.current += 1
                setLevel(levelRef.current)

                aliensRef.current =
                    createAliens()

                bulletsRef.current = []
                enemyBulletsRef.current = []

                alienSpeedRef.current += 18
                alienDirectionRef.current = 1

                player.x =
                    GAME_WIDTH / 2 -
                    player.width / 2
            }

            enemyShoot(currentTime)
        }

        function draw() {
            context.fillStyle = BLACK

            context.fillRect(
                0,
                0,
                GAME_WIDTH,
                GAME_HEIGHT
            )

            context.strokeStyle = CREAM
            context.lineWidth = 2

            context.strokeRect(
                1,
                1,
                GAME_WIDTH - 2,
                GAME_HEIGHT - 2
            )

            context.globalAlpha = 0.08
            context.fillStyle = CREAM

            for (
                let y = 0;
                y < GAME_HEIGHT;
                y += 6
            ) {
                context.fillRect(
                    0,
                    y,
                    GAME_WIDTH,
                    1
                )
            }

            context.globalAlpha = 1

            drawPlayer(
                context,
                playerRef.current
            )

            for (const alien of aliensRef.current) {
                if (alien.alive) {
                    drawAlien(
                        context,
                        alien
                    )
                }
            }

            context.fillStyle = CREAM

            for (const bullet of bulletsRef.current) {
                context.fillRect(
                    bullet.x,
                    bullet.y,
                    bullet.width,
                    bullet.height
                )
            }

            for (const bullet of enemyBulletsRef.current) {
                context.fillRect(
                    bullet.x,
                    bullet.y,
                    bullet.width,
                    bullet.height
                )
            }

            context.fillStyle = CREAM
            context.font =
                '18px monospace'

            context.textAlign = 'left'
            context.fillText(
                `SCORE ${String(scoreRef.current).padStart(5, '0')}`,
                24,
                34
            )

            context.textAlign = 'center'
            context.fillText(
                `LEVEL ${levelRef.current}`,
                GAME_WIDTH / 2,
                34
            )

            context.textAlign = 'right'
            context.fillText(
                `LIVES ${livesRef.current}`,
                GAME_WIDTH - 24,
                34
            )

            if (
                gameStatusRef.current !==
                'playing'
            ) {
                context.fillStyle =
                    'rgba(0, 0, 0, 0.78)'

                context.fillRect(
                    0,
                    0,
                    GAME_WIDTH,
                    GAME_HEIGHT
                )

                context.fillStyle = CREAM
                context.textAlign = 'center'

                context.font =
                    'bold 48px monospace'

                context.fillText(
                    gameStatusRef.current ===
                        'game-over'
                        ? locale === 'pt'
                            ? 'FIM DE JOGO'
                            : 'GAME OVER'
                        : locale === 'pt'
                          ? 'VOCÊ VENCEU'
                          : 'YOU WIN',
                    GAME_WIDTH / 2,
                    GAME_HEIGHT / 2 - 20
                )

                context.font =
                    '18px monospace'

                context.fillText(
                    locale === 'pt'
                        ? 'PRESSIONE ENTER PARA RECOMEÇAR'
                        : 'PRESS ENTER TO RESTART',
                    GAME_WIDTH / 2,
                    GAME_HEIGHT / 2 + 30
                )
            }
        }

        function gameLoop(
            currentTime: number
        ) {
            const deltaTime = Math.min(
                (currentTime -
                    lastTimeRef.current) /
                    1000,
                0.033
            )

            lastTimeRef.current =
                currentTime

            update(
                deltaTime,
                currentTime
            )

            draw()

            animationFrameRef.current =
                requestAnimationFrame(
                    gameLoop
                )
        }

        lastTimeRef.current =
            performance.now()

        animationFrameRef.current =
            requestAnimationFrame(
                gameLoop
            )

        return () => {
            if (
                animationFrameRef.current !==
                null
            ) {
                cancelAnimationFrame(
                    animationFrameRef.current
                )
            }
        }
    }, [
        drawAlien,
        drawPlayer,
        locale,
    ])

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent
        ) {
            if (
                event.key ===
                    'ArrowLeft' ||
                event.key.toLowerCase() ===
                    'a'
            ) {
                event.preventDefault()
                keysRef.current.left = true
            }

            if (
                event.key ===
                    'ArrowRight' ||
                event.key.toLowerCase() ===
                    'd'
            ) {
                event.preventDefault()
                keysRef.current.right = true
            }

            if (
                event.code === 'Space'
            ) {
                event.preventDefault()
                shoot()
            }

            if (
                event.key === 'Enter' &&
                gameStatusRef.current !==
                    'playing'
            ) {
                resetGame()
            }
        }

        function handleKeyUp(
            event: KeyboardEvent
        ) {
            if (
                event.key ===
                    'ArrowLeft' ||
                event.key.toLowerCase() ===
                    'a'
            ) {
                keysRef.current.left = false
            }

            if (
                event.key ===
                    'ArrowRight' ||
                event.key.toLowerCase() ===
                    'd'
            ) {
                keysRef.current.right = false
            }
        }

        window.addEventListener(
            'keydown',
            handleKeyDown
        )

        window.addEventListener(
            'keyup',
            handleKeyUp
        )

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            )

            window.removeEventListener(
                'keyup',
                handleKeyUp
            )
        }
    }, [resetGame, shoot])

    function startMoving(
        direction: 'left' | 'right'
    ) {
        keysRef.current[direction] = true
    }

    function stopMoving(
        direction: 'left' | 'right'
    ) {
        keysRef.current[direction] = false
    }

    return (
        <section
            className="
                flex
                w-full
                max-w-6xl
                flex-col
                items-center
            "
        >
            <div
                className="
                    mb-5
                    flex
                    w-full
                    items-end
                    justify-between
                    gap-4
                "
            >
                <div>
                    <p
                        className="
                            font-mono
                            text-[10px]
                            uppercase
                            tracking-[0.35em]
                            opacity-60
                        "
                    >
                        Mafalda Produções
                    </p>

                    <h1
                        className="
                            mt-1
                            font-franklin
                            text-3xl
                            uppercase
                            tracking-tight
                            md:text-5xl
                        "
                    >
                        Space Invaders
                    </h1>
                </div>

                <div
                    className="
                        hidden
                        text-right
                        font-mono
                        text-xs
                        uppercase
                        tracking-[0.18em]
                        opacity-60
                        md:block
                    "
                >
                    <p>
                        {locale === 'pt'
                            ? 'Mover: A D ou setas'
                            : 'Move: A D or arrows'}
                    </p>

                    <p>
                        {locale === 'pt'
                            ? 'Atirar: espaço'
                            : 'Shoot: space'}
                    </p>
                </div>
            </div>

            <div
                className="
                    relative
                    w-full
                    overflow-hidden
                    border
                    border-[#F4EEDB]
                    bg-black
                    shadow-[0_0_50px_rgba(244,238,219,0.08)]
                "
            >
                <canvas
                    ref={canvasRef}
                    width={GAME_WIDTH}
                    height={GAME_HEIGHT}
                    className="
                        block
                        h-auto
                        w-full
                        touch-none
                        bg-black
                        [image-rendering:pixelated]
                    "
                />
            </div>

            <div
                className="
                    mt-4
                    grid
                    w-full
                    grid-cols-3
                    gap-3
                    md:hidden
                "
            >
                <button
                    type="button"
                    aria-label={
                        locale === 'pt'
                            ? 'Mover para esquerda'
                            : 'Move left'
                    }
                    onPointerDown={() =>
                        startMoving('left')
                    }
                    onPointerUp={() =>
                        stopMoving('left')
                    }
                    onPointerCancel={() =>
                        stopMoving('left')
                    }
                    onPointerLeave={() =>
                        stopMoving('left')
                    }
                    className="
                        flex
                        min-h-16
                        touch-none
                        items-center
                        justify-center
                        border
                        border-[#F4EEDB]
                        font-mono
                        text-2xl
                        active:bg-[#F4EEDB]
                        active:text-black
                    "
                >
                    ←
                </button>

                <button
                    type="button"
                    onClick={shoot}
                    className="
                        flex
                        min-h-16
                        touch-none
                        items-center
                        justify-center
                        border
                        border-[#F4EEDB]
                        font-mono
                        text-xs
                        uppercase
                        tracking-[0.15em]
                        active:bg-[#F4EEDB]
                        active:text-black
                    "
                >
                    {locale === 'pt'
                        ? 'Atirar'
                        : 'Shoot'}
                </button>

                <button
                    type="button"
                    aria-label={
                        locale === 'pt'
                            ? 'Mover para direita'
                            : 'Move right'
                    }
                    onPointerDown={() =>
                        startMoving('right')
                    }
                    onPointerUp={() =>
                        stopMoving('right')
                    }
                    onPointerCancel={() =>
                        stopMoving('right')
                    }
                    onPointerLeave={() =>
                        stopMoving('right')
                    }
                    className="
                        flex
                        min-h-16
                        touch-none
                        items-center
                        justify-center
                        border
                        border-[#F4EEDB]
                        font-mono
                        text-2xl
                        active:bg-[#F4EEDB]
                        active:text-black
                    "
                >
                    →
                </button>
            </div>

            {gameStatus !== 'playing' && (
                <button
                    type="button"
                    onClick={resetGame}
                    className="
                        mt-5
                        border
                        border-[#F4EEDB]
                        px-6
                        py-3
                        font-mono
                        text-xs
                        uppercase
                        tracking-[0.25em]
                        transition-colors
                        hover:bg-[#F4EEDB]
                        hover:text-black
                    "
                >
                    {locale === 'pt'
                        ? 'Jogar novamente'
                        : 'Play again'}
                </button>
            )}

            <div
                className="
                    mt-4
                    flex
                    gap-6
                    font-mono
                    text-[10px]
                    uppercase
                    tracking-[0.2em]
                    opacity-50
                    md:hidden
                "
            >
                <span>
                    Score: {score}
                </span>

                <span>
                    {locale === 'pt'
                        ? 'Vidas'
                        : 'Lives'}
                    : {lives}
                </span>

                <span>
                    Level: {level}
                </span>
            </div>
        </section>
    )
}