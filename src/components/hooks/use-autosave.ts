import { useEffect, useRef } from "react";
import debounce from "lodash.debounce";
import { Task } from "@/types/type";

interface AutosaveOptions {
  data: Task;
  onSave: () => Promise<void>;
  interval?: number;
}

export function useAutosave({
  data,
  onSave,
  interval = 2000,
}: AutosaveOptions) {
  const savedData = useRef(data);

  useEffect(() => {
    const hasChanged =
      JSON.stringify(data) !== JSON.stringify(savedData.current);

    if (!hasChanged) {
      return;
    }

    const debouncedSave = debounce(async () => {
      try {
        await onSave();
        savedData.current = data;
      } catch (error) {
        console.error("Autosave failed:", error);
      }
    }, interval);

    debouncedSave();

    return () => {
      debouncedSave.cancel();
    };
  }, [data, onSave, interval]);
}
