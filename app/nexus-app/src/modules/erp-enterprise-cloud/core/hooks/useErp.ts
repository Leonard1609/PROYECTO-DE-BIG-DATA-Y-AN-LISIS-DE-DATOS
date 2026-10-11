import { useSyncExternalStore } from 'react';
import { erpStore } from '../services/erpStore';

/** Devuelve el estado del ERP y las acciones. Se actualiza solo cuando algo cambia. */
export function useErp() {
  const state = useSyncExternalStore(erpStore.subscribe, erpStore.getState, erpStore.getState);
  return { state, acciones: erpStore.acciones };
}
