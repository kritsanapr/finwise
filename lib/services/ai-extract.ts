export interface ReceiptExtraction {
    merchant: string | null;
    date: string | null;
    amount: string | null;
    items: string | null;
}

export interface BankSlipExtraction {
    bankName: string | null;
    transferRef: string | null;
    senderAccount: string | null;
    receiverAccount: string | null;
    receiverName: string | null;
    transferAmount: string | null;
    transferDate: string | null;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.0-flash-lite";

async function callVisionModel(
    imageUrl: string,
    prompt: string
): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not set");
    }

    const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        },
        body: JSON.stringify({
            model: DEFAULT_MODEL,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: imageUrl } },
                    ],
                },
            ],
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter API error: ${err}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content ?? "{}";
}

/**
 * Extract data from a store receipt image.
 */
export async function extractReceipt(
    imageUrl: string
): Promise<ReceiptExtraction> {
    const prompt = `Extract information from this receipt image. Return a JSON object with these exact keys:
- merchant: store/restaurant name (string or null)
- date: purchase date in ISO format YYYY-MM-DD (string or null)
- amount: total amount as a number string without currency symbol (string or null)
- items: comma-separated list of item names (string or null)

Respond with only a valid JSON object.`;

    try {
        const raw = await callVisionModel(imageUrl, prompt);
        const parsed = JSON.parse(raw);
        return {
            merchant: parsed.merchant ?? null,
            date: parsed.date ?? null,
            amount: parsed.amount ?? null,
            items: parsed.items ?? null,
        };
    } catch {
        return { merchant: null, date: null, amount: null, items: null };
    }
}

/**
 * Extract data from a Thai bank slip image.
 */
export async function extractBankSlip(
    imageUrl: string
): Promise<BankSlipExtraction> {
    const prompt = `Extract information from this Thai bank transfer slip image. Return a JSON object with these exact keys:
- bankName: bank name e.g. "SCB", "KBank", "BBL", "KTB" (string or null)
- transferRef: reference/transaction number shown on slip (string or null)
- senderAccount: sender account number, may be masked e.g. "***-1234" (string or null)
- receiverAccount: receiver account number, may be masked (string or null)
- receiverName: receiver name as shown on slip (string or null)
- transferAmount: transfer amount as a number string without currency symbol (string or null)
- transferDate: transfer date/time in ISO format YYYY-MM-DDTHH:mm:ss (string or null)

Respond with only a valid JSON object.`;

    try {
        const raw = await callVisionModel(imageUrl, prompt);
        const parsed = JSON.parse(raw);
        return {
            bankName: parsed.bankName ?? null,
            transferRef: parsed.transferRef ?? null,
            senderAccount: parsed.senderAccount ?? null,
            receiverAccount: parsed.receiverAccount ?? null,
            receiverName: parsed.receiverName ?? null,
            transferAmount: parsed.transferAmount ?? null,
            transferDate: parsed.transferDate ?? null,
        };
    } catch {
        return {
            bankName: null,
            transferRef: null,
            senderAccount: null,
            receiverAccount: null,
            receiverName: null,
            transferAmount: null,
            transferDate: null,
        };
    }
}
