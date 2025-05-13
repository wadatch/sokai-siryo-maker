declare module 'react' {
  export * from '@types/react';
  export const useState: typeof import('@types/react').useState;
  export const useEffect: typeof import('@types/react').useEffect;
  export type ChangeEvent<T = Element> = import('@types/react').ChangeEvent<T>;
  export type DragEvent<T = Element> = import('@types/react').DragEvent<T>;
} 