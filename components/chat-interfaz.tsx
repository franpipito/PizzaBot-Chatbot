"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

type Mensaje = {
  id: number
  texto: string
  esUsuario: boolean
  timestamp: Date
}

export default function ChatInterfaz() {
  // Estado para manejar los mensajes
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 1,
      texto: "¡Hola! Bienvenido a Pizzería La Nona. ¿En qué puedo ayudarte?",
      esUsuario: false,
      timestamp: new Date(),
    },
  ])

  // Estado para el input actual
  const [inputActual, setInputActual] = useState("")

  // Estado para indicar cuando el bot está "escribiendo"
  const [estaEscribiendo, setEstaEscribiendo] = useState(false)

  // Ref para hacer scroll automático
  const mensajesEndRef = useRef<HTMLDivElement>(null)

  // Scroll automático al último mensaje
  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes, estaEscribiendo])

  // Función para manejar el envío de mensajes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (inputActual.trim() === "") return

    // Agregar mensaje del usuario
    const nuevoMensajeUsuario: Mensaje = {
      id: Date.now(),
      texto: inputActual,
      esUsuario: true,
      timestamp: new Date(),
    }

    setMensajes((prev) => [...prev, nuevoMensajeUsuario])
    setInputActual("")

    // Simular que el bot está escribiendo
    setEstaEscribiendo(true)

    // Simular respuesta del bot después de 1.5 segundos
    setTimeout(() => {
      const respuestaBot: Mensaje = {
        id: Date.now() + 1,
        texto: "¡Claro! Anotada una pizza grande de muzzarella. ¿Algo más?",
        esUsuario: false,
        timestamp: new Date(),
      }

      setMensajes((prev) => [...prev, respuestaBot])
      setEstaEscribiendo(false)
    }, 1500)
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-card border border-border rounded-2xl shadow-lg overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/pizza-logo.png" alt="La Nona" />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">LN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-foreground text-base">NonaBot</h1>
            <p className="text-xs text-muted-foreground">Asistente virtual</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-600">Online</span>
        </div>
      </header>

      {/* Área de Conversación */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-secondary/30">
        {mensajes.map((mensaje) => (
          <div key={mensaje.id} className={`flex gap-3 ${mensaje.esUsuario ? "flex-row-reverse" : "flex-row"}`}>
            {!mensaje.esUsuario && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="/pizza-logo.png" alt="Bot" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">LN</AvatarFallback>
              </Avatar>
            )}

            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                mensaje.esUsuario
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card text-card-foreground rounded-tl-sm shadow-sm"
              }`}
            >
              <p className="text-sm leading-relaxed text-balance">{mensaje.texto}</p>
              <span
                className={`text-[10px] mt-1 block ${
                  mensaje.esUsuario ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {mensaje.timestamp.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Indicador de carga cuando el bot está escribiendo */}
        {estaEscribiendo && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src="/pizza-logo.png" alt="Bot" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">LN</AvatarFallback>
            </Avatar>

            <div className="bg-card text-card-foreground rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={mensajesEndRef} />
      </div>

      {/* Área de Entrada de Texto */}
      <footer className="bg-card border-t border-border px-4 py-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Escribe tu pedido aquí..."
            value={inputActual}
            onChange={(e) => setInputActual(e.target.value)}
            className="flex-1 bg-secondary/50 border-border focus-visible:ring-primary"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
            disabled={estaEscribiendo}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        </form>
      </footer>
    </div>
  )
}
