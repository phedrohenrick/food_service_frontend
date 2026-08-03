import { useCallback, useEffect, useState } from 'react';
import printer from '../services/thermalPrinter';
import { buildReceipt } from '../services/escpos';

const AUTO_KEY = 'priatoo.printer.autoOnAccept';

/**
 * Hook de impressão térmica para a tela de Pedidos.
 * Expõe estado da conexão, ações (conectar/imprimir) e o toggle "imprimir ao aceitar".
 */
export function useThermalPrinter() {
  const [state, setState] = useState(printer.getState());
  const [autoPrint, setAutoPrint] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTO_KEY);
      return stored === null ? true : stored === '1'; // ligado por padrão
    } catch (_) {
      return true;
    }
  });

  useEffect(() => printer.subscribe(setState), []);

  // Reabre silenciosamente uma porta já autorizada (sem seletor) ao montar a tela.
  useEffect(() => {
    printer.tryAutoConnect().catch(() => {});
  }, []);

  const setAuto = useCallback((value) => {
    setAutoPrint(value);
    try {
      localStorage.setItem(AUTO_KEY, value ? '1' : '0');
    } catch (_) {
      /* noop */
    }
  }, []);

  const connectSerial = useCallback(() => printer.connectSerial(), []);
  const connectBluetooth = useCallback(() => printer.connectBluetooth(), []);
  const tryAutoConnect = useCallback(() => printer.tryAutoConnect(), []);
  const disconnect = useCallback(() => printer.disconnect(), []);

  // Recebe o modelo do cupom (ver buildReceipt) e enfileira a impressão.
  const printReceipt = useCallback((receiptModel) => {
    const bytes = buildReceipt(receiptModel);
    return printer.print(bytes);
  }, []);

  return {
    supported: state.supported,
    supportedSerial: state.supportedSerial,
    supportedBluetooth: state.supportedBluetooth,
    transport: state.transport,
    status: state.status, // 'disconnected' | 'connecting' | 'connected' | 'printing' | 'error'
    deviceName: state.deviceName,
    error: state.error,
    queueLength: state.queueLength,
    isConnected: state.status === 'connected' || state.status === 'printing',
    autoPrint,
    setAutoPrint: setAuto,
    connectSerial,
    connectBluetooth,
    tryAutoConnect,
    disconnect,
    printReceipt,
  };
}

export default useThermalPrinter;
