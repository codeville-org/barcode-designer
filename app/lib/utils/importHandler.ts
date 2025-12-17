import { useCanvasStore } from "../store/useCanvasStore";

export interface PendingImport {
  element: {
    id: string;
    type: "image" | "text" | "barcode";
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  timestamp: number;
}

const PENDING_IMPORTS_KEY = "barcode_designer_pending_imports";

/**
 * Store an import request for the designer to pick up
 */
export function storePendingImport(element: PendingImport["element"]): void {
  const pendingImport: PendingImport = {
    element,
    timestamp: Date.now()
  };

  localStorage.setItem(PENDING_IMPORTS_KEY, JSON.stringify(pendingImport));
}

/**
 * Check for and process pending imports
 */
export function checkPendingImports(): PendingImport | null {
  const stored = localStorage.getItem(PENDING_IMPORTS_KEY);
  if (!stored) return null;

  try {
    const pendingImport: PendingImport = JSON.parse(stored);

    // Only process imports from the last 30 seconds
    if (Date.now() - pendingImport.timestamp < 30000) {
      // Clear the pending import
      localStorage.removeItem(PENDING_IMPORTS_KEY);
      return pendingImport;
    } else {
      // Clear expired imports
      localStorage.removeItem(PENDING_IMPORTS_KEY);
      return null;
    }
  } catch {
    localStorage.removeItem(PENDING_IMPORTS_KEY);
    return null;
  }
}

/**
 * Import element directly to canvas store
 */
export function importElementToCanvas(element: PendingImport["element"]): void {
  const { addElement } = useCanvasStore.getState();
  addElement(element);
}
