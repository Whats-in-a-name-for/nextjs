import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Configure the API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Input validation schema
const addressCompareSchema = z.object({
  address1: z.string().min(1, "First address is required"),
  address2: z.string().min(1, "Second address is required"),
});

// Normalize address string
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

// Calculate Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= str1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str2.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str1.length][str2.length];
}

// Calculate similarity percentage
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 100; // Both strings empty
  
  const distance = levenshteinDistance(str1, str2);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  return Math.round(similarity * 100) / 100; // Round to 2 decimal places
}
export async function POST(request: NextRequest) {
  if (!request.body) {
    return NextResponse.json(
      { error: "No request body provided" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate input
    const result = addressCompareSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: result.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { address1, address2 } = result.data;

    // Normalize addresses
    const normalizedAddr1 = normalizeAddress(address1);
    const normalizedAddr2 = normalizeAddress(address2);

    // Calculate similarity
    const matchPercentage = calculateSimilarity(normalizedAddr1, normalizedAddr2);

    // Determine if addresses match (threshold set to 90%)
    const match = matchPercentage >= 90;

    return NextResponse.json({
      match,
      matchPercentage,
      details: `Addresses are ${
        match ? "considered matching" : "different"
      } with ${matchPercentage}% similarity`,
    });
  } catch (error) {
    console.error("Error processing address comparison:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: "Failed to process address comparison",
      },
      { status: 500 }
    );
  }
}