/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, FabricImage, FabricText } from "fabric";
import { useCanvasStore } from "@/app/lib/store/useCanvasStore";
import { generateBarcode } from "@/app/lib/barcode/generators";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const isReadyRef = useRef(false);
  const objectsMapRef = useRef<Map<string, any>>(new Map());

  const {
    elements,
    canvasWidth,
    canvasHeight,
    setSelectedElement,
    updateElement
  } = useCanvasStore();

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#ffffff",
      selection: true
    });

    // Enable snapping
    const SNAP_THRESHOLD = 5;
    const GRID_SIZE = 10;

    canvas.on("object:moving", (e: any) => {
      const obj = e.target;

      // Snap to grid
      obj.set({
        left: Math.round(obj.left / GRID_SIZE) * GRID_SIZE,
        top: Math.round(obj.top / GRID_SIZE) * GRID_SIZE
      });

      // Snap to other objects
      canvas.forEachObject((other: any) => {
        if (other === obj) return;

        // Snap to left edge
        if (Math.abs(obj.left - other.left) < SNAP_THRESHOLD) {
          obj.set({ left: other.left });
        }
        // Snap to right edge
        if (
          Math.abs(
            obj.left +
              obj.width * obj.scaleX -
              (other.left + other.width * other.scaleX)
          ) < SNAP_THRESHOLD
        ) {
          obj.set({
            left:
              other.left + other.width * other.scaleX - obj.width * obj.scaleX
          });
        }
        // Snap to top edge
        if (Math.abs(obj.top - other.top) < SNAP_THRESHOLD) {
          obj.set({ top: other.top });
        }
        // Snap to bottom edge
        if (
          Math.abs(
            obj.top +
              obj.height * obj.scaleY -
              (other.top + other.height * other.scaleY)
          ) < SNAP_THRESHOLD
        ) {
          obj.set({
            top:
              other.top + other.height * other.scaleY - obj.height * obj.scaleY
          });
        }
      });
    });

    fabricCanvasRef.current = canvas;
    isReadyRef.current = true;

    // Handle object selection
    canvas.on("selection:created", (e: any) => {
      if (e.selected && e.selected[0]) {
        const obj = e.selected[0];
        setSelectedElement((obj as any).data?.id || null);
      }
    });

    canvas.on("selection:updated", (e: any) => {
      if (e.selected && e.selected[0]) {
        const obj = e.selected[0];
        setSelectedElement((obj as any).data?.id || null);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedElement(null);
    });

    // Handle object modifications
    canvas.on("object:modified", (e: any) => {
      const obj = e.target;
      if (obj && (obj as any).data?.id) {
        updateElement((obj as any).data.id, {
          x: obj.left || 0,
          y: obj.top || 0,
          width: (obj.width || 0) * (obj.scaleX || 1),
          height: (obj.height || 0) * (obj.scaleY || 1),
          rotation: obj.angle || 0
        });
      }
    });

    // Keyboard controls for precision movement
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      const step = e.shiftKey ? 10 : 1;
      let needsUpdate = false;

      switch (e.key) {
        case "ArrowLeft":
          activeObject.set("left", (activeObject.left || 0) - step);
          needsUpdate = true;
          break;
        case "ArrowRight":
          activeObject.set("left", (activeObject.left || 0) + step);
          needsUpdate = true;
          break;
        case "ArrowUp":
          activeObject.set("top", (activeObject.top || 0) - step);
          needsUpdate = true;
          break;
        case "ArrowDown":
          activeObject.set("top", (activeObject.top || 0) + step);
          needsUpdate = true;
          break;
        case "Delete":
        case "Backspace":
          if ((activeObject as any).data?.id) {
            canvas.remove(activeObject);
            useCanvasStore
              .getState()
              .deleteElement((activeObject as any).data.id);
          }
          e.preventDefault();
          break;
      }

      if (needsUpdate) {
        e.preventDefault();
        canvas.renderAll();
        if ((activeObject as any).data?.id) {
          updateElement((activeObject as any).data.id, {
            x: activeObject.left || 0,
            y: activeObject.top || 0
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasWidth, canvasHeight]);

  // Render elements from store - incremental update to maintain focus
  useEffect(() => {
    if (!fabricCanvasRef.current || !isReadyRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objectsMap = objectsMapRef.current;

    // Get current element IDs
    const currentIds = new Set(elements.map((e) => e.id));

    // Remove deleted objects
    objectsMap.forEach((obj, id) => {
      if (!currentIds.has(id)) {
        canvas.remove(obj);
        objectsMap.delete(id);
      }
    });

    // Add or update elements
    elements.forEach(async (element) => {
      const existingObj = objectsMap.get(element.id);

      if (existingObj) {
        // Update existing object
        if (element.type === "text") {
          existingObj.set({
            text: element.content,
            left: element.x,
            top: element.y,
            fontSize: element.fontSize || 20,
            fontFamily: element.fontFamily || "Arial",
            fill: element.color || "#000000",
            angle: element.rotation
          });
        } else {
          existingObj.set({
            left: element.x,
            top: element.y,
            scaleX: element.width / (existingObj.width || 1),
            scaleY: element.height / (existingObj.height || 1),
            angle: element.rotation
          });
        }
        canvas.renderAll();
      } else {
        // Create new object
        try {
          if (element.type === "text") {
            const text = new FabricText(element.content, {
              left: element.x,
              top: element.y,
              fontSize: element.fontSize || 20,
              fontFamily: element.fontFamily || "Arial",
              fill: element.color || "#000000",
              angle: element.rotation,
              data: { id: element.id } as any
            });
            canvas.add(text);
            objectsMap.set(element.id, text);
          } else if (element.type === "barcode") {
            const barcodeDataUrl = await generateBarcode({
              format: element.barcodeFormat || "CODE128",
              value: element.content,
              width: 2,
              height: 100,
              displayValue: true
            });

            FabricImage.fromURL(barcodeDataUrl).then((img: any) => {
              img.set({
                left: element.x,
                top: element.y,
                scaleX: element.width / (img.width || 1),
                scaleY: element.height / (img.height || 1),
                angle: element.rotation,
                data: { id: element.id } as any
              });
              canvas.add(img);
              objectsMap.set(element.id, img);
              canvas.renderAll();
            });
          } else if (element.type === "image") {
            FabricImage.fromURL(element.content).then((img: any) => {
              img.set({
                left: element.x,
                top: element.y,
                scaleX: element.width / (img.width || 1),
                scaleY: element.height / (img.height || 1),
                angle: element.rotation,
                data: { id: element.id } as any
              });
              canvas.add(img);
              objectsMap.set(element.id, img);
              canvas.renderAll();
            });
          }
        } catch (error) {
          console.error("Error rendering element:", error);
        }
      }
    });
  }, [elements]);

  return (
    <div className="flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50 p-4">
      <div
        className="relative"
        style={{ width: canvasWidth, height: canvasHeight }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
