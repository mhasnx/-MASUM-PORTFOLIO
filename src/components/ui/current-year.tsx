"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function getCurrentYear() {
  return new Date().getFullYear();
}

export function CurrentYear() {
  const year = useSyncExternalStore(subscribe, getCurrentYear, () => null);

  return <>{year}</>;
}
