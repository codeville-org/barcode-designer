import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { BarcodeFormat } from "../store/useCanvasStore";

export interface BarcodeOptions {
  format: BarcodeFormat;
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

/**
 * Generate barcode as data URL using JsBarcode
 */
export const generateBarcode = async (
  options: BarcodeOptions
): Promise<string> => {
  const {
    format,
    value,
    width = 2,
    height = 100,
    displayValue = true
  } = options;

  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");

      if (format === "QR") {
        // Use qrcode library for QR codes
        QRCode.toCanvas(canvas, value, {
          width: 200,
          margin: 1,
          errorCorrectionLevel: "M"
        })
          .then(() => {
            resolve(canvas.toDataURL());
          })
          .catch(reject);
      } else {
        // Use JsBarcode for linear barcodes
        let barcodeFormat = "";

        switch (format) {
          case "CODE128":
            barcodeFormat = "CODE128";
            break;
          case "CODE39":
            barcodeFormat = "CODE39";
            break;
          case "EAN13":
            barcodeFormat = "EAN13";
            break;
          case "UPCA":
            barcodeFormat = "UPC";
            break;
          default:
            barcodeFormat = "CODE128";
        }

        JsBarcode(canvas, value, {
          format: barcodeFormat,
          width,
          height,
          displayValue,
          margin: 10,
          fontSize: 14
        });

        resolve(canvas.toDataURL());
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Validate barcode value for specific format
 */
export const validateBarcodeValue = (
  format: BarcodeFormat,
  value: string
): { valid: boolean; error?: string } => {
  if (!value) {
    return { valid: false, error: "Barcode value is required" };
  }

  switch (format) {
    case "EAN13":
      if (!/^\d{12,13}$/.test(value)) {
        return { valid: false, error: "EAN13 must be 12-13 digits" };
      }
      break;
    case "UPCA":
      if (!/^\d{11,12}$/.test(value)) {
        return { valid: false, error: "UPC-A must be 11-12 digits" };
      }
      break;
    case "CODE39":
      if (!/^[A-Z0-9\-\.\s\$\/\+\%]+$/.test(value)) {
        return {
          valid: false,
          error: "CODE39 supports uppercase letters, numbers and special chars"
        };
      }
      break;
    case "CODE128":
      // CODE128 supports all ASCII characters
      break;
    case "QR":
      // QR codes support any text
      break;
    case "DATAMATRIX":
      // DataMatrix supports any text
      break;
  }

  return { valid: true };
};

/**
 * Get default value for barcode format
 */
export const getDefaultBarcodeValue = (format: BarcodeFormat): string => {
  switch (format) {
    case "EAN13":
      return "123456789012";
    case "UPCA":
      return "12345678901";
    case "CODE39":
      return "BARCODE123";
    case "CODE128":
      return "BARCODE12345";
    case "QR":
      return "https://example.com";
    case "DATAMATRIX":
      return "DATA123";
    default:
      return "BARCODE";
  }
};
