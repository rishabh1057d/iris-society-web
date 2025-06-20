"use client"

import { useEffect, useState } from "react"
import ParallaxBackground from "./parallax-background"

// TypeScript may not have BatteryManager in lib.dom.d.ts for all targets
type BatteryManager = {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
  onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
};

export default function LazyBackgroundLoader() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // First, check if we should load the background at all
    // Don't load on low-end devices or if battery is low
    const shouldLoadBackground = () => {
      // Check for battery API support and low battery
      if ("getBattery" in navigator) {
        // @ts-ignore - getBattery is not in the TypeScript navigator type
        navigator
          .getBattery()
          .then((battery: BatteryManager) => {
            if (battery.level < 0.2 && !battery.charging) {
              // Low battery and not charging, don't load heavy background
              return false
            }
          })
          .catch(() => {
            // If we can't check battery, assume it's OK
            return true
          })
      }

      // Check for low-end devices
      if (navigator.hardwareConcurrency <= 2) {
        return false
      }

      return true
    }

    // Set loaded state after initial render
    const timer = setTimeout(() => {
      setIsLoaded(shouldLoadBackground())
    }, 300) // Delay loading to prioritize main content

    // Set visible state after loaded
    const visibilityTimer = setTimeout(() => {
      if (isLoaded) {
        setIsVisible(true)
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      clearTimeout(visibilityTimer)
    }
  }, [isLoaded])

  return isLoaded ? (
    <div className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <ParallaxBackground />
    </div>
  ) : null
}
