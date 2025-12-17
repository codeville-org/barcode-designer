"use client";

import { useState, useEffect, useCallback } from "react";
import { useCanvasStore } from "@/app/lib/store/useCanvasStore";
import { generateBarcode } from "@/app/lib/barcode/generators";
import { X } from "lucide-react";

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrintPreview({ isOpen, onClose }: PrintPreviewProps) {
  const { elements, labelDimensions, setLabelDimensions } = useCanvasStore();
  const [width, setWidth] = useState(labelDimensions.width);
  const [height, setHeight] = useState(labelDimensions.height);
  const [copies, setCopies] = useState(1);
  const [labelImages, setLabelImages] = useState<string[]>([]);

  const generateLabelImages = useCallback(async () => {
    const images: string[] = [];

    for (let i = 0; i < copies; i++) {
      const canvas = document.createElement("canvas");
      const dpi = 300; // High DPI for print quality
      const mmToInch = 0.0393701;
      const widthPx = width * mmToInch * dpi;
      const heightPx = height * mmToInch * dpi;

      canvas.width = widthPx;
      canvas.height = heightPx;

      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, widthPx, heightPx);

      // Scale factor from canvas pixels to print pixels
      const scaleX = widthPx / 600; // assuming canvas is 600px wide
      const scaleY = heightPx / 300; // assuming canvas is 300px high

      for (const element of elements) {
        ctx.save();

        const x = element.x * scaleX;
        const y = element.y * scaleY;
        const w = element.width * scaleX;
        const h = element.height * scaleY;

        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.translate(-(x + w / 2), -(y + h / 2));

        if (element.type === "text") {
          ctx.font = `${(element.fontSize || 20) * scaleY}px ${
            element.fontFamily || "Arial"
          }`;
          ctx.fillStyle = element.color || "#000000";
          ctx.fillText(
            element.content,
            x,
            y + (element.fontSize || 20) * scaleY
          );
        } else if (element.type === "barcode") {
          try {
            const barcodeDataUrl = await generateBarcode({
              format: element.barcodeFormat || "CODE128",
              value: element.content,
              width: 2,
              height: 100,
              displayValue: true
            });

            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = barcodeDataUrl;
            });

            ctx.drawImage(img, x, y, w, h);
          } catch (error) {
            console.error("Error rendering barcode:", error);
          }
        } else if (element.type === "image") {
          try {
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = element.content;
            });

            ctx.drawImage(img, x, y, w, h);
          } catch (error) {
            console.error("Error rendering image:", error);
          }
        }

        ctx.restore();
      }

      images.push(canvas.toDataURL("image/png"));
    }

    setLabelImages(images);
  }, [elements, width, height, copies]);

  useEffect(() => {
    if (isOpen) {
      // Trigger generation asynchronously to avoid direct setState in effect
      const timer = setTimeout(() => {
        generateLabelImages();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, generateLabelImages]);

  const handlePrint = () => {
    setLabelDimensions({ width, height });

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print labels");
      return;
    }

    // Generate HTML for print window
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Labels - ${copies} labels</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              margin: 0;
              padding: 0;
            }
            
            @media print {
              @page {
                size: ${width}mm ${height}mm;
                margin: 0;
              }
              
              body {
                margin: 0;
                padding: 0;
              }
              
              .screen-header {
                display: none !important;
              }
              
              .label-container {
                width: ${width}mm;
                height: ${height}mm;
                page-break-after: always;
                page-break-inside: avoid;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .label-container:last-child {
                page-break-after: auto;
              }
              
              .label-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
              }
            }
            
            @media screen {
              body {
                background: #f5f5f5;
                padding: 20px;
              }
              
              .screen-header {
                background: white;
                padding: 16px;
                margin-bottom: 20px;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              
              .screen-header h1 {
                font-size: 20px;
                font-weight: 600;
                color: #1f2937;
              }
              
              .screen-header button {
                display: none;
              }
              
              .label-container {
                background: white;
                margin-bottom: 16px;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .label-image {
                max-width: 100%;
                height: auto;
                border: 1px solid #e5e7eb;
              }
            }
          </style>
        </head>
        <body>
          <div class="screen-header">
            <h1>Total labels: ${copies}</h1>
            <button onclick="window.print()">Print Now</button>
          </div>
          ${labelImages
            .map(
              (image, index) => `
            <div class="label-container">
              <img src="${image}" alt="Label ${
                index + 1
              }" class="label-image" />
            </div>
          `
            )
            .join("")}
          <script>
            // Auto-trigger print dialog when page loads
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
            
            // Close window after printing or canceling
            window.onafterprint = function() {
              // Optional: uncomment to auto-close after printing
              // setTimeout(function() { window.close(); }, 1000);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Close the preview modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Print Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Settings */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (mm)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 30)}
                min="10"
                max="300"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (mm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 15)}
                min="10"
                max="300"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Copies
              </label>
              <input
                type="number"
                value={copies}
                onChange={(e) =>
                  setCopies(Math.max(1, parseInt(e.target.value) || 1))
                }
                min="1"
                max="1000"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mb-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {labelImages.map((image, index) => (
                <div
                  key={index}
                  className="border border-gray-300 bg-white rounded p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Label ${index + 1}`}
                    className="w-full h-auto"
                  />
                  <p className="text-xs text-center text-gray-500 mt-1">
                    Label {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
