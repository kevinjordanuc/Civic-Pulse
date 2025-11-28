"use client";

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import AdaptiveCardRenderer from '@/components/chat/AdaptiveCardRenderer';
import { fetchChatCompletion, type ChatMessage } from '@/lib/api';
import { useProfileStore } from '@/store/profile';
import { usePreferencesStore } from '@/store/preferences';

type RecognitionResultEvent = Event & {
  results?: SpeechRecognitionResultList;
};

type RecognitionErrorEvent = Event & {
  error?: string;
};

type ChatPanelProps = {
  variant?: 'standalone' | 'embedded';
};

export default function ChatPanel({ variant = 'standalone' }: ChatPanelProps) {
  const { profile } = useProfileStore();
  const { accessibility, language, mode } = usePreferencesStore(state => ({
    accessibility: state.accessibility,
    language: state.language,
    mode: state.mode,
  }));
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hola, ¿en qué puedo ayudarte con trámites municipales?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognitionImpl =
    typeof window !== 'undefined'
      ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
      : null;

  const handleSend = async () => {
    if (!input.trim()) return;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
    setMessages(nextMessages);
    setInput('');

    setIsSending(true);
    try {
      const plainMessages = nextMessages.map(({ card, ...rest }) => rest);
      const result = await fetchChatCompletion(plainMessages, profile.id);
      setMessages(prev => [...prev, { role: 'assistant', content: result.answer }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'No pudimos contactar al servidor. Inténtalo pronto.' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleVoiceCapture = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }
    if (!SpeechRecognitionImpl) {
      setVoiceError('Tu navegador no soporta dictado por voz.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionImpl();
      recognition.lang = language;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: RecognitionResultEvent) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInput(transcript);
        }
        setIsRecording(false);
      };
      recognition.onerror = (event: RecognitionErrorEvent) => {
        if (event.error === 'not-allowed') {
          setVoiceError('Autoriza el micrófono para dictar tu mensaje.');
        } else {
          setVoiceError('No pudimos capturar audio, inténtalo de nuevo.');
        }
        setIsRecording(false);
      };
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setVoiceError(null);
      setIsRecording(true);
    } catch (error) {
      setVoiceError('No pudimos iniciar la captura de audio.');
      setIsRecording(false);
    }
  };

  const handleSpeakResponse = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceError('Tu navegador no soporta lectura automática.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const lastAssistant = [...messages].reverse().find(message => message.role === 'assistant');
    if (!lastAssistant) {
      setVoiceError('Aún no hay una respuesta para reproducir.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(lastAssistant.content);
    utterance.lang = language;
    utterance.rate = accessibility.simplifiedLanguage ? 0.9 : 1;
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setVoiceError(null);
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const desiredVoices = [
      'Microsoft Sabina Online (Natural) - Spanish (Mexico)',
      'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
      'Google Cloud Espanol (es-ES)',
      'Google español (es-ES)',
      'Google español de Estados Unidos',
    ];

    const updatePreferredVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const matchByName = voices.find(voice => desiredVoices.includes(voice.name));
      const langPrefix = language?.split('-')[0]?.toLowerCase();
      const matchByLang = langPrefix
        ? voices.find(voice => voice.lang?.toLowerCase().startsWith(langPrefix))
        : null;
      setPreferredVoice(matchByName || matchByLang || voices[0]);
    };

    updatePreferredVoice();
    window.speechSynthesis.addEventListener?.('voiceschanged', updatePreferredVoice);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', updatePreferredVoice);
    };
  }, [language]);

  const isEmbedded = variant === 'embedded';
  const showSectionHeader = !isEmbedded;

  const sampleAdaptiveCard = {
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    type: 'AdaptiveCard',
    version: '1.6',
    body: [
      {
        type: 'TextBlock',
        text: 'Trámites sugeridos',
        weight: 'Bolder',
        size: 'Medium',
      },
      {
        type: 'TextBlock',
        text: 'Seleccionamos estos trámites basados en tu colonia y temas más consultados.',
        wrap: true,
        spacing: 'Small',
      },
      {
        type: 'ColumnSet',
        columns: [
          {
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: 'Limpieza de luminarias',
                weight: 'Bolder',
              },
              {
                type: 'TextBlock',
                text: 'Tiempo estimado: 3 a 5 días hábiles.',
                isSubtle: true,
                wrap: true,
              },
              {
                type: 'TextBlock',
                text: 'Última actualización: 27 nov · Estatus en proceso',
                spacing: 'Small',
                wrap: true,
                size: 'Small',
              },
            ],
          },
          {
            type: 'Column',
            width: 'auto',
            items: [
              {
                type: 'FactSet',
                facts: [
                  { title: 'Folio', value: 'MX-1145' },
                  { title: 'Prioridad', value: 'Alta' },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'RichTextBlock',
        inlines: [
          { type: 'TextRun', text: '¿Quieres reportar algo nuevo?', weight: 'Bolder' },
          { type: 'TextRun', text: ' Abre el formulario de reportes ciudadanos.' },
        ],
      },
    ],
    actions: [
      {
        type: 'Action.OpenUrl',
        title: 'Reportar luminaria',
        url: 'https://www.cdmx.gob.mx/',
      },
      {
        type: 'Action.OpenUrl',
        title: 'Consultar mis trámites',
        url: 'https://www.gob.mx/tramites',
      },
    ],
  } as const;

  const pushAdaptiveCard = () => {
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: 'Aquí tienes una tarjeta interactiva con trámites sugeridos.',
        card: JSON.parse(JSON.stringify(sampleAdaptiveCard)),
      },
    ]);
  };

  const sectionClasses = clsx(
    'flex min-h-0 flex-col space-y-4',
    variant === 'standalone'
      ? 'glass-panel px-6 py-6'
      : 'h-full max-h-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-xl'
  );

  const messagesWrapperClasses = clsx(
    'space-y-3 overflow-y-auto pr-1',
    isEmbedded
      ? 'h-[260px] sm:h-[300px] lg:h-[340px]'
      : 'max-h-72'
  );

  return (
    <section id="chat" className={sectionClasses}>
      {showSectionHeader && (
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Chat Cívico</p>
            <h2 className="text-2xl font-semibold">Asistente Municipal</h2>
            <p className="text-sm text-[var(--text-muted)]">Idioma: {language} · Usa voz o texto</p>
          </div>
        </header>
      )}

      <div className={messagesWrapperClasses}>
        {messages.map((message, index) => {
          if (message.card) {
            return (
              <article
                key={`${message.role}-${index}-card`}
                className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] shadow-sm"
              >
                {message.content && <p className="mb-3 font-semibold">{message.content}</p>}
                <AdaptiveCardRenderer payload={message.card} />
              </article>
            );
          }

          return (
            <article
              key={`${message.role}-${index}`}
              className={clsx(
                'w-fit rounded-2xl px-4 py-2 text-sm shadow-sm',
                message.role === 'assistant'
                  ? 'bg-[var(--accent-soft)] text-[var(--text)]'
                  : 'ml-auto bg-[var(--accent)] text-white',
              )}
            >
              {message.content}
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {['¿Dónde pago mi predial?', 'Eventos en mi colonia', 'Alertas de movilidad'].map(example => (
          <button key={example} className="rounded-full border border-[var(--border)] px-3 py-1" onClick={() => setInput(example)}>
            {example}
          </button>
        ))}
        <button
          className="rounded-full border border-dashed border-[var(--accent)] px-3 py-1 text-[var(--accent-strong)]"
          onClick={pushAdaptiveCard}
        >
          Ver tarjeta interactiva
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:flex-nowrap">
        <div className="flex flex-1 min-w-0 items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-2">
          <div className="flex items-center gap-2 text-xl">
            <button className="h-8 w-8" title="Grabar pregunta" aria-label="Grabar pregunta" onClick={handleVoiceCapture}>
              {isRecording ? '⏹️' : '🎙️'}
            </button>
            {accessibility.ttsEnabled && (
              <button
                className="h-8 w-8"
                title={isSpeaking ? 'Detener lectura' : 'Escuchar respuesta'}
                aria-label={isSpeaking ? 'Detener lectura' : 'Escuchar respuesta'}
                onClick={handleSpeakResponse}
              >
                {isSpeaking ? '⏹️' : '🔊'}
              </button>
            )}
          </div>
          <input
            className="flex-1 min-w-0 bg-transparent text-sm outline-none"
            placeholder="Haz una consulta cívica"
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            disabled={isSending}
          />
        </div>
        <button
          className="pill-button w-full flex-shrink-0 px-6 py-3 text-sm md:w-auto"
          onClick={handleSend}
          disabled={isSending}
        >
          {isSending ? 'Consultando…' : 'Enviar'}
        </button>
      </div>

      {voiceError ? (
        <p className="text-xs text-[var(--warning)]">{voiceError}</p>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">Pulsa 🎙️ para dictar o 🔊 para escuchar la última respuesta.</p>
      )}

      {mode === 'advanced' && (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-muted)]">
          <p className="font-semibold text-[var(--text)]">Referencias</p>
          <p>Cuando conectes Azure AI Search, verás aquí las fuentes oficiales de cada respuesta.</p>
        </div>
      )}
    </section>
  );
}
