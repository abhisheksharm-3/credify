import { VerifyLivenessResponseType } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url).searchParams.get('url');

    if (!url) {
        console.log('Missing URL parameter');
        return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const BACKEND_URL = process.env.VERIFICATION_SERVICE_BASE_URL;
        if (!BACKEND_URL) {
            console.error('VERIFICATION_SERVICE_BASE_URL is not set');
            throw new Error('Server configuration error');
        }

        console.log(`Attempting to verify URL: ${url}`);
        console.log(`Sending request to: ${BACKEND_URL}/verify_liveness`);

        const response = await fetch(`${BACKEND_URL}/verify_liveness`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const data: VerifyLivenessResponseType = await response.json();

        if (!response.ok) {
            console.error('Verification service responded with error:', {
                status: response.status,
                data
            });
            return new Response(JSON.stringify({ error: data.error ?? 'Unknown error' }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ result: data.result }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error verifying image liveness:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}