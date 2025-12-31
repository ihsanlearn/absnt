import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Supabase DB Webhook payload structure: { type: 'INSERT', table: 'orders', record: { ... }, old_record: null, schema: 'public' }
        const { record, type, table } = body;

        if (table !== 'orders' || type !== 'INSERT') {
            return NextResponse.json({ message: 'Ignored event' }, { status: 200 });
        }

        const orderId = record.id;
        const customerName = record.customer_name || 'Pelanggan';

        const app = await initAdmin();
        const messaging = getMessaging(app);

        // 2. Fetch all Admin User IDs
        const supabase = createServiceClient();
        
        const { data: adminRoles, error: roleError } = await supabase
            .from('customers')
            .select('id')
            .eq('role', 'admin');

        if (roleError || !adminRoles || adminRoles.length === 0) {
            console.error("No admins found or error fetching roles:", roleError);
            return NextResponse.json({ message: 'No admins found' }, { status: 200 });
        }

        const adminIds = adminRoles.map(r => r.id);

        // Step 2: Get FCM tokens for these admins
        const { data: tokensData, error: tokenError } = await supabase
            .from('fcm_tokens')
            .select('token')
            .in('user_id', adminIds);

        if (tokenError || !tokensData || tokensData.length === 0) {
            console.log("No FCM tokens found for admins.");
            return NextResponse.json({ message: 'No tokens found' }, { status: 200 });
        }

        const tokens = tokensData.map(t => t.token);

        // Remove duplicates
        const uniqueTokens = Array.from(new Set(tokens));

        // 3. Send Notification
        const message = {
            notification: {
                title: 'New Order Received! ☕',
                body: `Order #${orderId.slice(0, 8).toUpperCase()} from ${customerName}`,
            },
            tokens: uniqueTokens,
            webpush: {
                fcmOptions: {
                    link: `/profile` 
                }
            }
        };

        const response = await messaging.sendEachForMulticast(message);
        console.log("FCM Response:", response.successCount + ' messages were sent successfully');
        
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp: any, idx: number) => {
                if (!resp.success) {
                    failedTokens.push(uniqueTokens[idx]);
                }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
            // Optionally remove invalid tokens from DB
        }

        return NextResponse.json({ success: true, sent_count: response.successCount });

    } catch (error: any) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
