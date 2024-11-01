'use client';

import { useEffect, useState, useRef } from 'react';
import { socket } from '@/socket';

type AlarmaDataTypes = {
  message?: string;
  magnitude?: number;
  alarmState: boolean;
};

export default function Enfermeiro() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');
  const [alarmData, setAlarmData] = useState<AlarmaDataTypes | null>(null);
  const audioComponent = useRef<HTMLAudioElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false); // Novo estado

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on('upgrade', (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport('N/A');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('alarm-recive', (data: AlarmaDataTypes) => {
      setAlarmData(data);
      if (audioComponent.current && audioEnabled) { // Checa se o áudio está habilitado
        if (data && data.magnitude && data.magnitude >= 10) {
          audioComponent.current.src = '/sounds/emergency_alarm.mp3';
        } else {
          audioComponent.current.src = '/sounds/new_action.mp3';
        }

        if (data.alarmState) {
          audioComponent.current.play().catch((error) => {
            console.error('Erro ao tocar áudio:', error);
          });
          audioComponent.current.muted = false;
        } else {
          audioComponent.current.pause();
        }
      }
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('alarm-recive');
    };
  }, [audioEnabled]); // Adiciona o `audioEnabled` como dependência

  // Função para habilitar o áudio
  const enableAudio = () => {
    setAudioEnabled(true);
  };

  return (
    <>
      <div
        className="flex flex-col items-center justify-start w-full p-10 sm:p-20 font-[family-name:var(--font-geist-sans)] gap-16"
      >
        {/* Botão para permitir o áudio */}
        {!audioEnabled && (
          <button onClick={enableAudio} className="p-2 bg-blue-500 text-white rounded">
            Permitir Áudio
          </button>
        )}

        <h1
          className="text-3xl font-bold"
        >
          Emergências
        </h1>

        <div
          className="flex items-center justify-center flex-col text-lg font-semibold h-fit"
        >
          {
            alarmData?.alarmState ?
              <>
                <p>Emergência:  <span
                  className={alarmData.magnitude && alarmData?.magnitude >= 10 ? 'text-red-500 animate-pulse font-black text-2xl' : ''}
                >{alarmData?.message}</span></p>
                <p>Magnitude:  <span>{alarmData?.magnitude}</span></p>
              </> :
              <p>Sem emergências no momento. {":)"}</p>
          }
        </div>
      </div>

      <audio
        ref={audioComponent}
        src=""
        autoPlay
        loop
        controls
        muted
        style={{
          opacity: 0.00000000001,
          position: 'fixed',
          top: '-100px',
        }}
      />
      {
        alarmData?.alarmState &&
        <div
          className="fixed w-[100%] h-[100%] animate-pulse top-0"
          style={{
            boxShadow: "rgb(239, 68, 68) 0px 0px 20px 20px inset"
          }}
        />
      }
    </>
  );
}
