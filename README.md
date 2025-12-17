# Barcode Label Designer

A modern, web-based barcode label designer and printer built with Next.js 16, React 19, and Fabric.js. Design custom barcode labels with drag-and-drop functionality and print them directly from your browser.

## Features

- 🎨 **Visual Canvas Editor** - Drag, resize, and rotate elements with ease
- 🏷️ **Multiple Barcode Formats** - Support for Code128, Code39, EAN-13, UPC-A, and QR codes
- ✍️ **Text Elements** - Add custom text with various fonts, sizes, and colors
- 🖼️ **Image Upload** - Include logos and images in your labels
- 🖨️ **Print Ready** - High-DPI output optimized for thermal and standard printers
- 💾 **Auto-Save** - Your designs are automatically saved to browser storage
- ⌨️ **Keyboard Controls** - Arrow keys for precision positioning
- 🔌 **API Integration** - Import images from external apps (e.g., Electron)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Designer Interface

1. **Add Elements** - Use the toolbar to add text, barcodes, or images to your canvas
2. **Edit Elements** - Click an element to select it and edit its properties in the right panel
3. **Move Elements** - Drag elements around the canvas or use arrow keys for precision
4. **Resize Elements** - Drag corner handles to resize
5. **Delete Elements** - Select an element and press Delete/Backspace

### Keyboard Shortcuts

- **Arrow Keys** - Move selected element by 1px
- **Shift + Arrow Keys** - Move selected element by 10px
- **Delete/Backspace** - Delete selected element

### Printing Labels

1. Click the "Print Labels" button
2. Set label dimensions (width and height in mm)
3. Choose number of copies
4. Preview your labels
5. Click "Print" to open the browser print dialog

## API Integration

### Import Image Endpoint

External applications (like Electron apps) can import images directly into the designer.

**Endpoint:** `POST /api/import-image`

**Request Body:**

```json
{
  "image": "data:image/png;base64,...",
  "url": "https://example.com/image.png",
  "position": { "x": 50, "y": 50 },
  "size": { "width": 150, "height": 150 },
  "token": "optional-auth-token"
}
```

**Response:**

```json
{
  "success": true,
  "element": {
    "id": "image-1234567890",
    "type": "image",
    "content": "data:image/png;base64,...",
    "x": 50,
    "y": 50,
    "width": 150,
    "height": 150,
    "rotation": 0
  }
}
```

### Electron Integration Example

```javascript
// In your Electron app
const response = await fetch("http://localhost:3000/api/import-image", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    image: imageDataUrl,
    position: { x: 100, y: 100 },
    size: { width: 200, height: 200 }
  })
});

const data = await response.json();
if (data.success) {
  console.log("Image imported:", data.element);
}
```

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Canvas Editor:** Fabric.js 6
- **Barcode Generation:** JsBarcode, qrcode
- **State Management:** Zustand
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript

## Project Structure

```
app/
├── api/
│   └── import-image/      # API endpoint for external image import
├── components/
│   ├── canvas/            # Canvas and properties panel components
│   ├── print/             # Print preview component
│   └── toolbar/           # Toolbar component
├── lib/
│   ├── barcode/           # Barcode generation utilities
│   ├── store/             # Zustand state management
│   └── utils/             # Utility functions
├── layout.tsx
├── page.tsx               # Main designer page
└── globals.css
```

## Common Label Sizes

- **Small Thermal Label:** 30mm x 15mm
- **Standard Address Label:** 89mm x 36mm
- **Large Shipping Label:** 100mm x 150mm
- **A4 Sheet:** 210mm x 297mm

## Browser Support

- Chrome/Edge (recommended for best print quality)
- Firefox
- Safari
