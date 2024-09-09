import { NextRequest, NextResponse } from 'next/server';

interface VerifyLivenessResponse {
    result?: any;
    error?: string;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    if (url) {
        try {
            const BACKEND_URL = process.env.BACKEND_DEPLOYMENT_URL!;
            const response = await fetch(`${BACKEND_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return NextResponse.json({ error: errorData.error || 'Unknown error' }, { status: response.status });
            }

            const result = await response.json();
            return NextResponse.json({ result });

        } catch (error) {
            console.error('Error verifying image liveness:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    } else {
        return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }
}
