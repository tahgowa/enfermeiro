"use client"

import { useEffect, useState } from "react";
import { socket } from "@/socket";

import { ButtonActions } from "@/components/ButtonActions";

import ButtonsDataActions from "@/utils/data.json";

export default function Home() {
  const [isAlarmTriggered, setIsAlarmTriggered] = useState(false);

  // Função para criar o bip sonoro
  const playBeep = () => {
    // @typescript-eslint/no-explicit-any
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)(); // @typescript-eslint/no-explicit-any
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine"; // Tipo de onda (pode ser 'sine', 'square', 'triangle', etc.)
    oscillator.frequency.setValueAtTime(500, audioContext.currentTime); // Frequência do bip
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2); // Duração de 0.2 segundos
  };

  // useEffect para tocar o bip continuamente enquanto o alarme estiver ativo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAlarmTriggered) {
      playBeep(); // Toca o primeiro bip imediatamente
      interval = setInterval(playBeep, 1000); // Bipes a cada 1 segundo
    }

    return () => clearInterval(interval); // Limpa o intervalo quando o componente desmonta ou o alarme é desativado
  }, [isAlarmTriggered]);

  return (
    <>
      {isAlarmTriggered &&
        <div
          className="fixed top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-ping"
        />
      }
      <div className="flex flex-col items-center justify-start w-full p-10 sm:p-20 font-[family-name:var(--font-geist-sans)] gap-16">

        <button
          onClick={() => {
            setIsAlarmTriggered(true)
            socket.emit("alarm", {
              message: "emergência",
              magnitude: 11,
              alarmState: true
            })
          }}
          className="p-8 bg-red-500 font-black text-white rounded-full w-60 h-60 text-3xl flex items-center justify-center after:bg-red-500 after:w-72 after:h-72 after:blur-xl"
        >
          EMERGÊNCIA
        </button>

        <hr className="bg-gray-300 bg-opacity-30 w-full rounded-full" />

        <div
          className="w-full h-auto gap-5 px-2 flex flex-wrap"
        >
          {
            ButtonsDataActions
              .sort((a, b) => b.magnitude - a.magnitude)
              .map(({ name, magnitude }) =>
                <ButtonActions
                  key={name + magnitude}
                  onClick={() => {
                    setIsAlarmTriggered(true)
                    socket.emit("alarm", {
                      message: name,
                      magnitude,
                      alarmState: true
                    })
                  }}
                >
                  {name}
                </ButtonActions>
              )}
        </div>
      </div>

      {isAlarmTriggered &&
        <ButtonActions
          onClick={() => {
            setIsAlarmTriggered(false)
            socket.emit("alarm", {
              alarmState: false
            })
          }}
          className="bg-transparent hover:bg-transparent hover:underline fixed bottom-5 backdrop-blur-md"
          style={{
            left: 'calc(50% / 1.5)'
          }}
        >
          Desligar alarme
        </ButtonActions>
      }
    </>
  );
}
