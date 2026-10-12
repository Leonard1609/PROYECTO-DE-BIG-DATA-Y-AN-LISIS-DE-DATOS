import { USUARIO_ACTUAL_ID } from '../services/erpStore';
import { useErp } from './useErp';

/** Usuario de la sesión simulada, su rol y qué módulos puede abrir. */
export function usePermisos() {
  const { state } = useErp();
  const usuario = state.usuarios.find((u) => u.id === USUARIO_ACTUAL_ID);
  const rol = state.roles.find((r) => r.id === usuario?.rolId);
  const puede = (ruta: string): boolean => ruta === 'dashboard' || (rol?.permisos.includes(ruta) ?? false);
  return { usuario, rol, puede };
}
