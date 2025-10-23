import { useState, useCallback } from 'react';

export function useMachineFilter() {
  const [selectedMachineCode, setSelectedMachineCode] = useState<string | null>(null);
  const [selectedMachineName, setSelectedMachineName] = useState<string | null>(null);

  const selectMachine = useCallback((code: string, name: string) => {
    setSelectedMachineCode(code);
    setSelectedMachineName(name);
  }, []);

  const clearMachine = useCallback(() => {
    setSelectedMachineCode(null);
    setSelectedMachineName(null);
  }, []);

  const hasMachineFilter = selectedMachineCode !== null;

  return {
    selectedMachineCode,
    selectedMachineName,
    selectMachine,
    clearMachine,
    hasMachineFilter
  };
}
