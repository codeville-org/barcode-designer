"use client";

import { useCanvasStore, BarcodeFormat } from "@/app/lib/store/useCanvasStore";
import { validateBarcodeValue } from "@/app/lib/barcode/generators";
import { Trash2 } from "lucide-react";

const BARCODE_FORMATS: { value: BarcodeFormat; label: string }[] = [
  { value: "CODE128", label: "Code 128" },
  { value: "CODE39", label: "Code 39" },
  { value: "EAN13", label: "EAN-13" },
  { value: "UPCA", label: "UPC-A" },
  { value: "QR", label: "QR Code" }
];

export default function PropertiesPanel() {
  const { elements, selectedElementId, updateElement, deleteElement } =
    useCanvasStore();

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <div className="border-l border-gray-200 bg-white p-4 w-80">
        <p className="text-sm text-gray-500 text-center">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  const handleContentChange = (value: string) => {
    if (selectedElement.type === "barcode") {
      const validation = validateBarcodeValue(
        selectedElement.barcodeFormat || "CODE128",
        value
      );
      if (validation.valid) {
        updateElement(selectedElement.id, { content: value });
      }
    } else {
      updateElement(selectedElement.id, { content: value });
    }
  };

  const handleDelete = () => {
    deleteElement(selectedElement.id);
  };

  return (
    <div className="border-l border-gray-200 bg-white p-4 w-80 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
        <button
          onClick={handleDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
          title="Delete element"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Element Type Badge */}
        <div>
          <span className="inline-block px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
            {selectedElement.type.toUpperCase()}
          </span>
        </div>

        {/* Content */}
        {selectedElement.type !== "image" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {selectedElement.type === "barcode" ? "Barcode Value" : "Text"}
            </label>
            <input
              type="text"
              value={selectedElement.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Barcode Format */}
        {selectedElement.type === "barcode" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barcode Format
            </label>
            <select
              value={selectedElement.barcodeFormat || "CODE128"}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  barcodeFormat: e.target.value as BarcodeFormat
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {BARCODE_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Text Properties */}
        {selectedElement.type === "text" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Size
              </label>
              <input
                type="number"
                value={selectedElement.fontSize || 20}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    fontSize: parseInt(e.target.value)
                  })
                }
                min="8"
                max="200"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Family
              </label>
              <select
                value={selectedElement.fontFamily || "Arial"}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    fontFamily: e.target.value
                  })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedElement.color || "#000000"}
                  onChange={(e) =>
                    updateElement(selectedElement.id, { color: e.target.value })
                  }
                  className="h-10 w-20 rounded-md border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedElement.color || "#000000"}
                  onChange={(e) =>
                    updateElement(selectedElement.id, { color: e.target.value })
                  }
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}

        {/* Position */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X Position
            </label>
            <input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  x: parseInt(e.target.value)
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y Position
            </label>
            <input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  y: parseInt(e.target.value)
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width
            </label>
            <input
              type="number"
              value={Math.round(selectedElement.width)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  width: parseInt(e.target.value)
                })
              }
              min="10"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height
            </label>
            <input
              type="number"
              value={Math.round(selectedElement.height)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  height: parseInt(e.target.value)
                })
              }
              min="10"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rotation ({Math.round(selectedElement.rotation)}°)
          </label>
          <input
            type="range"
            value={selectedElement.rotation}
            onChange={(e) =>
              updateElement(selectedElement.id, {
                rotation: parseInt(e.target.value)
              })
            }
            min="0"
            max="360"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
