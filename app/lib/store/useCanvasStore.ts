import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BarcodeFormat =
  | "CODE128"
  | "CODE39"
  | "EAN13"
  | "UPCA"
  | "QR"
  | "DATAMATRIX";

export interface CanvasElement {
  id: string;
  type: "text" | "barcode" | "image";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  barcodeFormat?: BarcodeFormat;
}

export interface LabelDimensions {
  width: number; // in mm
  height: number; // in mm
}

interface CanvasState {
  elements: CanvasElement[];
  selectedElementId: string | null;
  labelDimensions: LabelDimensions;
  canvasWidth: number; // in pixels for display
  canvasHeight: number; // in pixels for display

  // Actions
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  setSelectedElement: (id: string | null) => void;
  setLabelDimensions: (dimensions: LabelDimensions) => void;
  setCanvasDimensions: (width: number, height: number) => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set) => ({
      elements: [],
      selectedElementId: null,
      labelDimensions: { width: 30, height: 15 }, // default thermal label size
      canvasWidth: 600,
      canvasHeight: 300,

      addElement: (element) =>
        set((state) => ({
          elements: [...state.elements, element]
        })),

      updateElement: (id, updates) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          )
        })),

      deleteElement: (id) =>
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selectedElementId:
            state.selectedElementId === id ? null : state.selectedElementId
        })),

      setSelectedElement: (id) => set({ selectedElementId: id }),

      setLabelDimensions: (dimensions) => set({ labelDimensions: dimensions }),

      setCanvasDimensions: (width, height) =>
        set({ canvasWidth: width, canvasHeight: height }),

      clearCanvas: () => set({ elements: [], selectedElementId: null })
    }),
    {
      name: "barcode-canvas-storage"
    }
  )
);
