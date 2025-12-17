"use client";

import { useState, useEffect } from "react";
import { Printer, Trash2 } from "lucide-react";
import Toolbar from "./components/toolbar/Toolbar";
import Canvas from "./components/canvas/Canvas";
import PropertiesPanel from "./components/canvas/PropertiesPanel";
import PrintPreview from "./components/print/PrintPreview";
import { useCanvasStore } from "./lib/store/useCanvasStore";
import { checkPendingImports } from "./lib/utils/importHandler";

export default function Home() {
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const { elements, clearCanvas, addElement } = useCanvasStore();

  // Check for pending image imports from external apps
  useEffect(() => {
    const checkForImports = () => {
      const pendingImport = checkPendingImports();
      if (pendingImport) {
        console.log("Processing pending import:", pendingImport);
        addElement(pendingImport.element);
      }
    };

    // Check immediately on mount
    checkForImports();

    // Set up interval to check every second for new imports
    const interval = setInterval(checkForImports, 1000);

    return () => clearInterval(interval);
  }, [addElement]);

  const handleClearCanvas = () => {
    if (
      confirm(
        "Are you sure you want to clear the canvas? This action cannot be undone."
      )
    ) {
      clearCanvas();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Barcode Label Designer
            </h1>
            <p className="text-sm text-gray-500">
              Design and print custom barcode labels
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClearCanvas}
              disabled={elements.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4" />
              Clear Canvas
            </button>
            <button
              onClick={() => setShowPrintPreview(true)}
              disabled={elements.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Printer className="h-4 w-4" />
              Print Labels
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <Canvas />
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                💡 Tips:
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Drag elements to move them around the canvas</li>
                <li>• Use corner handles to resize elements</li>
                <li>
                  • Press arrow keys for precise positioning (hold Shift for
                  larger steps)
                </li>
                <li>• Press Delete or Backspace to remove selected element</li>
                <li>
                  • Select an element to edit its properties in the right panel
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <PropertiesPanel />
      </div>

      {/* Print Preview Modal */}
      <PrintPreview
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
      />
    </div>
  );
}
