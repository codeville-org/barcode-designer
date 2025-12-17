// Updated Electron code - save this in your Electron app

import _ as fs from "fs";
import _ as path from "path";
import { exec } from "child_process";
import { shell } from "electron";

const designerUrl = "http://localhost:3000"; // or your production URL

async function sendImageToDesigner(imagePath: string) {
// Read image file and convert to base64
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = imageBuffer.toString("base64");
const mimeType =
path.extname(imagePath) === ".png" ? "image/png" : "image/jpeg";
const dataUrl = `data:${mimeType};base64,${base64Image}`;

// Send to API
const response = await fetch(`${designerUrl}/api/import-image`, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
image: dataUrl,
x: 100,
y: 100,
width: 250,
height: 200
})
});

const result = await response.json();
console.log("Image imported:", result);

if (result.success && result.element) {
// Store the element in localStorage for the designer to pick up
const pendingImport = {
element: result.element,
timestamp: Date.now()
};

    // Execute JavaScript in the browser window to set localStorage
    const jsCode = `
      localStorage.setItem('barcode_designer_pending_imports', ${JSON.stringify(JSON.stringify(pendingImport))});
      console.log('Pending import stored in localStorage');
    `;

    // If you have access to the BrowserWindow, inject the code
    // designerWindow.webContents.executeJavaScript(jsCode);

    // Alternative: Use a different approach if you can't access the window
    console.log("Image data prepared. Designer will pick it up automatically.");

}

return result;
}

export async function printImageLabelNativeController(
imagePath: string
): Promise<{ success: boolean; error?: string }> {
try {
// If imagePath is just a filename, resolve it to full path
let fullImagePath = imagePath;
if (!path.isAbsolute(imagePath)) {
const labelsPath = path.join(getLabelsImageDirectory(), imagePath);
const imageDirPath = path.join(getImagesDirectory(), imagePath);

      fullImagePath = imagePath.startsWith("label_")
        ? labelsPath
        : imageDirPath;
    }

    // Open designer in Chrome with a BrowserWindow for better control
    const { BrowserWindow } = require("electron");

    const designerWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    designerWindow.loadURL(designerUrl);

    // Wait for page to load, then send image
    designerWindow.webContents.on("did-finish-load", async () => {
      try {
        const result = await sendImageToDesigner(fullImagePath);

        if (result.success && result.element) {
          // Inject the import into localStorage
          const pendingImport = {
            element: result.element,
            timestamp: Date.now()
          };

          await designerWindow.webContents.executeJavaScript(`
            localStorage.setItem('barcode_designer_pending_imports', ${JSON.stringify(JSON.stringify(pendingImport))});
            console.log('Image import stored, reloading to trigger import...');
            window.location.reload();
          `);
        }
      } catch (err) {
        console.error("Failed to send image to designer:", err);
      }
    });

    return { success: true };

} catch (error) {
console.error("Print label native error:", error);
return {
error:
(error as Error).message ||
"An unknown error occurred while printing the label.",
success: false
};
}
}

// Helper functions (implement these based on your app structure)
function getLabelsImageDirectory(): string {
// Return your labels directory path
return path.join(process.cwd(), "labels");
}

function getImagesDirectory(): string {
// Return your images directory path
return path.join(process.cwd(), "images");
}
