/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/vault/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import VaultItemModel from '@/models/VaultItem';
import { getTokenData } from '@/helpers/getTokenData';

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const userId = await getTokenData(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { title, username, encryptedData } = await request.json();

    if (!title || !username || !encryptedData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newVaultItem = new VaultItemModel({
      userId,
      title,
      username,
      encryptedData,
    });

    const savedItem = await newVaultItem.save();

    return NextResponse.json({
      message: 'Item saved successfully',
      success: true,
      savedItem,
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const userId = await getTokenData(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const vaultItems = await VaultItemModel.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({
      message: 'Items fetched successfully',
      success: true,
      data: vaultItems,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}