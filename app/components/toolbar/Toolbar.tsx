"use client";

import { Type, Barcode, Image as ImageIcon } from "lucide-react";
import { useCanvasStore, BarcodeFormat } from "@/app/lib/store/useCanvasStore";
import { getDefaultBarcodeValue } from "@/app/lib/barcode/generators";

export default function Toolbar() {
  const addElement = useCanvasStore((state) => state.addElement);

  const handleAddText = () => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: "text" as const,
      content: "Text",
      x: 50,
      y: 50,
      width: 100,
      height: 30,
      rotation: 0,
      fontSize: 20,
      fontFamily: "Arial",
      color: "#000000"
    };
    addElement(newElement);
  };

  const handleAddBarcode = (format: BarcodeFormat) => {
    const defaultValue = getDefaultBarcodeValue(format);
    const newElement = {
      id: `barcode-${Date.now()}`,
      type: "barcode" as const,
      content: defaultValue,
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      rotation: 0,
      barcodeFormat: format
    };
    addElement(newElement);
  };

  const handleAddImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const newElement = {
            id: `image-${Date.now()}`,
            type: "image" as const,
            content: dataUrl,
            x: 50,
            y: 50,
            width: 150,
            height: 150,
            rotation: 0
          };
          addElement(newElement);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="border-b border-gray-200 bg-white p-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Add Element:
          </span>
        </div>

        <button
          onClick={handleAddText}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Type className="h-4 w-4" />
          Text
        </button>

        <div className="relative group">
          <button className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Barcode className="h-4 w-4" />
            Barcode ▾
          </button>
          <div className="absolute left-0 top-full mt-1 hidden w-48 rounded-md border border-gray-200 bg-white shadow-lg group-hover:block z-10">
            <div className="py-1">
              <button
                onClick={() => handleAddBarcode("CODE128")}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Code 128
              </button>
              <button
                onClick={() => handleAddBarcode("CODE39")}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Code 39
              </button>
              <button
                onClick={() => handleAddBarcode("EAN13")}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                EAN-13
              </button>
              <button
                onClick={() => handleAddBarcode("UPCA")}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                UPC-A
              </button>
              <button
                onClick={() => handleAddBarcode("QR")}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                QR Code
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleAddImage}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ImageIcon className="h-4 w-4" />
          Image
        </button>
      </div>
    </div>
  );
}
