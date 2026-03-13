"use client";

import { type ReactElement } from "react";
import dynamic from "next/dynamic";

const ChatWidget = dynamic(
  () => import("@/components/common/chat-widget").then((m) => ({ default: m.ChatWidget })),
  { ssr: false }
);

const QuizFloatingWidget = dynamic(
  () => import("@/components/lead-magnets/QuizFloatingWidget").then((m) => ({ default: m.QuizFloatingWidget })),
  { ssr: false }
);

/**
 * Lazy-loaded widget container. Wraps ChatWidget and QuizFloatingWidget
 * behind dynamic imports with ssr:false to reduce initial JS bundle.
 */
export function LazyWidgets(): ReactElement {
  return (
    <>
      <ChatWidget />
      <QuizFloatingWidget delay={8000} source="global" />
    </>
  );
}
