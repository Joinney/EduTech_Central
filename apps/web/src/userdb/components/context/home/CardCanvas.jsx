import React, { useRef, useEffect } from "react"

export default function CardCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let animationFrameId
    let width, height

    function resizeCanvas() {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth || 300
      height = canvas.height = canvas.offsetHeight || 210
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 }
    const card = canvas.closest(".card-container")

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.targetX = e.clientX - rect.left
      mouse.targetY = e.clientY - rect.top
    }
    if (card) card.addEventListener("mousemove", handleMouseMove)

    const spheres = [
      { originX: width * 0.12, originY: height * 0.25, z: 1.2, r: width * 0.045, isBlue: true, angle: 0, speed: 0.018, orbitRadius: 6, pulse: 0 },
      { originX: width * 0.65, originY: height * 0.20, z: 1.3, r: width * 0.048, isBlue: false, angle: Math.PI / 2, speed: 0.015, orbitRadius: 7, pulse: 1 },
      { originX: width * 0.85, originY: height * 0.75, z: 1.3, r: width * 0.05, isBlue: false, angle: (Math.PI * 3) / 2, speed: 0.016, orbitRadius: 8, pulse: 3 }
    ]

    const nodes = []
    const nodeColors = ["#1e3a8a", "#38bdf8", "#ea580c", "#ffaa00", "#c0c0c0"]
    for (let i = 0; i < 35; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseR: Math.random() * 2 + 1,
        color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
        glow: Math.random() * Math.PI * 2
      })
    }

    function render() {
      mouse.x += (mouse.targetX - mouse.x) * 0.08
      mouse.y += (mouse.targetY - mouse.y) * 0.08
      ctx.clearRect(0, 0, width, height)

      spheres.forEach((s) => {
        s.angle += s.speed
        s.pulse += 0.02
        const px = s.originX + Math.cos(s.angle) * s.orbitRadius + (mouse.x - width / 2) * 0.015 * s.z
        const py = s.originY + Math.sin(s.angle) * s.orbitRadius + (mouse.y - height / 2) * 0.015 * s.z
        const currentR = s.r + Math.sin(s.pulse) * 2

        ctx.beginPath()
        ctx.arc(px, py, Math.max(1, currentR), 0, Math.PI * 2)
        const grad = ctx.createRadialGradient(px - currentR * 0.3, py - currentR * 0.3, currentR * 0.05, px, py, currentR)
        grad.addColorStop(0, "#ffffff")
        grad.addColorStop(1, s.isBlue ? "#1e3a8a" : "#ea580c")
        ctx.fillStyle = grad
        ctx.fill()
      })

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.x += n.vx
        n.y += n.vy
        n.glow += 0.03
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1

        const nx = n.x + (mouse.x - width / 2) * 0.01 * n.z
        const ny = n.y + (mouse.y - height / 2) * 0.01 * n.z

        ctx.beginPath()
        ctx.arc(nx, ny, n.baseR, 0, Math.PI * 2)
        ctx.fillStyle = n.color
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resizeCanvas)
      if (card) card.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="card-canvas" />
}