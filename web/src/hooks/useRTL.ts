import { useAppSelector } from './useAppSelector';

export function useRTL() {
  const direction = useAppSelector((state) => state.language.direction);
  const isRTL = direction === 'rtl';
  return { isRTL, direction };
}
