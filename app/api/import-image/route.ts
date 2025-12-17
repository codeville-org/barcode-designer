import { NextRequest, NextResponse } from "next/server";

interface ImportImageRequest {
  image?: string; // base64 data URL or URL
  url?: string; // Alternative: direct URL
  position?: {
    x?: number;
    y?: number;
  };
  size?: {
    width?: number;
    height?: number;
  };
  token?: string; // Optional authentication token
}

interface ImportImageResponse {
  success: boolean;
  element?: {
    id: string;
    type: "image";
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ImportImageResponse>> {
  try {
    const body: ImportImageRequest = await request.json();

    // Optional: Token validation
    // if (body.token !== process.env.API_TOKEN) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // Get image content (either from base64 or URL)
    let imageContent = body.image || body.url;

    if (!imageContent) {
      return NextResponse.json(
        { success: false, error: "No image or URL provided" },
        { status: 400 }
      );
    }

    // If URL is provided, fetch and convert to data URL
    if (body.url && !body.url.startsWith("data:")) {
      try {
        const imageResponse = await fetch(body.url);
        if (!imageResponse.ok) {
          return NextResponse.json(
            { success: false, error: "Failed to fetch image from URL" },
            { status: 400 }
          );
        }

        const blob = await imageResponse.blob();
        const buffer = await blob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = blob.type || "image/png";
        imageContent = `data:${mimeType};base64,${base64}`;
      } catch {
        return NextResponse.json(
          { success: false, error: "Error fetching image from URL" },
          { status: 500 }
        );
      }
    }

    // Validate data URL format
    if (!imageContent.startsWith("data:image/")) {
      return NextResponse.json(
        { success: false, error: "Invalid image format. Must be a data URL" },
        { status: 400 }
      );
    }

    // Create element data for Fabric.js
    const element = {
      id: `image-${Date.now()}`,
      type: "image" as const,
      content: imageContent,
      x: body.position?.x || 50,
      y: body.position?.y || 50,
      width: body.size?.width || 150,
      height: body.size?.height || 150,
      rotation: 0
    };

    return NextResponse.json({
      success: true,
      element
    });
  } catch (error) {
    console.error("Error processing image import:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Support CORS for Electron and external apps
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
