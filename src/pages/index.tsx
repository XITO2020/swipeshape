import React from "react";
import HomePage from "./HomePage";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const { isAuthenticated } = useAppStore();

  return (
    <HomePage useVideoHero={true} />
  );
}
