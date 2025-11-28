"use client";

import { AdaptiveCard, HostConfig } from 'adaptivecards';
import { useEffect, useRef } from 'react';

import 'adaptivecards/dist/adaptivecards.css';

type AdaptiveCardRendererProps = {
  payload: unknown;
};

const hostConfig = new HostConfig({
  fontFamily:
    'var(--font-inter, "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
});

export default function AdaptiveCardRenderer({ payload }: AdaptiveCardRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!payload || !containerRef.current) {
      return;
    }

    const card = new AdaptiveCard();
    card.hostConfig = hostConfig;

    try {
      card.parse(payload as any);
      const renderedCard = card.render();
      const parent = containerRef.current;
      parent.replaceChildren(renderedCard);
    } catch (error) {
      const parent = containerRef.current;
      parent.textContent = 'No se pudo renderizar la tarjeta.';
    }
  }, [payload]);

  return <div ref={containerRef} className="adaptive-card" />;
}
