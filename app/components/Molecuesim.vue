<template>
    <div class="simulation-container" ref="containerRef">
        <canvas ref="canvasRef" />
        <div class="info-overlay">🟡 CG-3M3SH | 🟦 binder</div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";

// ---------- 可配置参数（可按需改为 props）----------
const NUM_CIRCLES = 8;
const NUM_SQUARES = 35;
const CIRCLE_RADIUS = 8;
const SQUARE_SIZE = 20;
const SQUARE_HALF = SQUARE_SIZE / 2;
const CAPTURE_DISTANCE = CIRCLE_RADIUS + SQUARE_HALF;
const CIRCLE_SPEED = 1.8;
const SQUARE_SPEED = 0.8;
const BORDER_BOUNCE = true;

// ---------- 工具函数 ----------
const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomSpeed = (base: number) => (Math.random() - 0.5) * 2 * base;

// ---------- 粒子类（内部定义）----------
class Circle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    capturedBy: Square | null;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = randomSpeed(CIRCLE_SPEED);
        this.vy = randomSpeed(CIRCLE_SPEED);
        this.radius = CIRCLE_RADIUS;
        this.capturedBy = null;
    }

    move(canvasWidth: number, canvasHeight: number) {
        if (this.capturedBy) return;
        this.x += this.vx;
        this.y += this.vy;

        if (BORDER_BOUNCE) {
            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.vx *= -1;
            } else if (this.x + this.radius > canvasWidth) {
                this.x = canvasWidth - this.radius;
                this.vx *= -1;
            }
            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.vy *= -1;
            } else if (this.y + this.radius > canvasHeight) {
                this.y = canvasHeight - this.radius;
                this.vy *= -1;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.capturedBy ? "#ffdd57" : "#f9ca24";
        ctx.shadowColor = this.capturedBy ? "#ffdd57" : "#f9ca24";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.closePath();
    }
}

class Square {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    half: number;
    capturedCircles: Circle[];

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = randomSpeed(SQUARE_SPEED);
        this.vy = randomSpeed(SQUARE_SPEED);
        this.size = SQUARE_SIZE;
        this.half = SQUARE_HALF;
        this.capturedCircles = [];
    }

    move(canvasWidth: number, canvasHeight: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (BORDER_BOUNCE) {
            if (this.x - this.half < 0) {
                this.x = this.half;
                this.vx *= -1;
            } else if (this.x + this.half > canvasWidth) {
                this.x = canvasWidth - this.half;
                this.vx *= -1;
            }
            if (this.y - this.half < 0) {
                this.y = this.half;
                this.vy *= -1;
            } else if (this.y + this.half > canvasHeight) {
                this.y = canvasHeight - this.half;
                this.vy *= -1;
            }
        }
    }

    checkCollision(circle: Circle): boolean {
        if (circle.capturedBy) return false;
        const dx = this.x - circle.x;
        const dy = this.y - circle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < CAPTURE_DISTANCE;
    }

    capture(circle: Circle) {
        circle.capturedBy = this;
        this.capturedCircles.push(circle);
    }

    updateCaptured() {
        this.capturedCircles.forEach((circle, index) => {
            const angle = (index / this.capturedCircles.length) * Math.PI * 2;
            const offsetDist = CIRCLE_RADIUS + this.half + 2;
            circle.x = this.x + Math.cos(angle) * offsetDist;
            circle.y = this.y + Math.sin(angle) * offsetDist;
            circle.vx = this.vx;
            circle.vy = this.vy;
        });
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = "#4a69bd";
        ctx.shadowColor = "#4a69bd";
        ctx.shadowBlur = 12;
        ctx.fillRect(-this.half, -this.half, this.size, this.size);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.half, -this.half, this.size, this.size);
        ctx.restore();
    }
}

// ---------- 组件状态 ----------
const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();

let circles: Circle[] = [];
let squares: Square[] = [];
let animationId: number | null = null;
let canvasWidth = 0;
let canvasHeight = 0;

// ---------- 动画循环 ----------
function startAnimation(ctx: CanvasRenderingContext2D) {
    function update() {
        // 移动
        circles.forEach((c) => c.move(canvasWidth, canvasHeight));
        squares.forEach((s) => s.move(canvasWidth, canvasHeight));

        // 碰撞捕获
        for (const square of squares) {
            for (const circle of circles) {
                if (square.checkCollision(circle)) {
                    square.capture(circle);
                }
            }
            square.updateCaptured();
        }

        // 绘制
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // 网格背景
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        const gridSize = 60;
        for (let i = 0; i < canvasWidth; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvasHeight);
            ctx.stroke();
        }
        for (let j = 0; j < canvasHeight; j += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(canvasWidth, j);
            ctx.stroke();
        }

        squares.forEach((s) => s.draw(ctx));
        circles.forEach((c) => c.draw(ctx));

        animationId = requestAnimationFrame(update);
    }
    update();
}

// ---------- 初始化粒子 ----------
function initParticles() {
    circles = [];
    squares = [];

    for (let i = 0; i < NUM_CIRCLES; i++) {
        let x: number, y: number, overlapping: boolean;
        do {
            overlapping = false;
            x = random(CIRCLE_RADIUS, canvasWidth - CIRCLE_RADIUS);
            y = random(CIRCLE_RADIUS, canvasHeight - CIRCLE_RADIUS);
            for (const c of circles) {
                const dx = x - c.x;
                const dy = y - c.y;
                if (Math.sqrt(dx * dx + dy * dy) < CIRCLE_RADIUS * 2) {
                    overlapping = true;
                    break;
                }
            }
        } while (overlapping);
        circles.push(new Circle(x, y));
    }

    for (let i = 0; i < NUM_SQUARES; i++) {
        let x: number, y: number, overlapping: boolean;
        do {
            overlapping = false;
            x = random(SQUARE_HALF, canvasWidth - SQUARE_HALF);
            y = random(SQUARE_HALF, canvasHeight - SQUARE_HALF);
            for (const s of squares) {
                const dx = x - s.x;
                const dy = y - s.y;
                if (Math.abs(dx) < SQUARE_SIZE && Math.abs(dy) < SQUARE_SIZE) {
                    overlapping = true;
                    break;
                }
            }
        } while (overlapping);
        squares.push(new Square(x, y));
    }
}

// ---------- 生命周期 ----------
onMounted(async () => {
    await nextTick();
    const canvas = canvasRef.value!;
    const container = containerRef.value!;
    canvasWidth = container.clientWidth;
    canvasHeight = container.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d")!;

    initParticles();

    // 响应窗口大小变化
    const resizeObserver = new ResizeObserver(() => {
        canvasWidth = container.clientWidth;
        canvasHeight = container.clientHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        // 窗口变化时重新初始化粒子位置可能更好，但这里简单处理
    });
    resizeObserver.observe(container);

    startAnimation(ctx);

    onUnmounted(() => {
        if (animationId) cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
    });
});
</script>

<style scoped>
.simulation-container {
    position: relative;
    width: 100%;
    height: 100vh;
    min-height: 400px;
    background: #16213e;
    overflow: hidden;
}

canvas {
    display: block;
    width: 100%;
    height: 100%;
}

.info-overlay {
    position: absolute;
    bottom: 12px;
    left: 16px;
    color: #ccc;
    font-size: 14px;
    background: rgba(0, 0, 0, 0.5);
    padding: 4px 12px;
    border-radius: 20px;
    backdrop-filter: blur(4px);
    pointer-events: none;
}
</style>
