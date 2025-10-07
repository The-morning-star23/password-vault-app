/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/vault/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VaultItemModel from '@/models/VaultItem';
import { getTokenData } from '@/helpers/getTokenData';

// Your existing DELETE function (correct)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const userId = await getTokenData(request);
    const itemId = params.id;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const result = await VaultItemModel.findOneAndDelete({
      _id: itemId,
      userId: userId,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Item not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Item deleted successfully", success: true },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const userId = await getTokenData(request);
    const itemId = params.id;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { title, username, encryptedData } = await request.json();

    if (!title || !username || !encryptedData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedItem = await VaultItemModel.findOneAndUpdate(
      { _id: itemId, userId: userId },
      { title, username, encryptedData },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { error: "Item not found or you don't have permission to edit it" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Item updated successfully", success: true, item: updatedItem },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}