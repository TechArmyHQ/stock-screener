
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Stock } from '../../types';

export const dynamic = 'force-dynamic'; // No caching, always read fresh file

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'stocks.json');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        const start = Date.now();
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const stocks: Stock[] = JSON.parse(fileContent);

        // Add metadata about scan time?
        // For now just return the array

        return NextResponse.json({
            lastUpdated: fs.statSync(filePath).mtime.toISOString(),
            count: stocks.length,
            data: stocks
        });

    } catch (error) {
        console.error('Error reading stock data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
