import { Pedometer } from "expo-sensors";
import { useEffect, useState } from "react";

export function useTodaySteps() {
  const [steps, setSteps] = useState(0);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | null = null;

    (async () => {
      const isAvailable = await Pedometer.isAvailableAsync().catch(() => false);
      setAvailable(isAvailable);
      if (!isAvailable) return;

      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== "granted") return;

      const bugunBasi = new Date();
      bugunBasi.setHours(0, 0, 0, 0);
      const sonuc = await Pedometer.getStepCountAsync(bugunBasi, new Date()).catch(() => null);
      if (sonuc) setSteps(sonuc.steps);

      subscription = Pedometer.watchStepCount((event) => {
        setSteps((onceki) => onceki + event.steps);
      });
    })();

    return () => subscription?.remove();
  }, []);

  return { steps, available };
}
