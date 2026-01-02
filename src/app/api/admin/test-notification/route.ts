import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient(); // Use server client for auth check

        // 1. Authenticate User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // 2. Check Admin Role
        const { data: customer, error: roleError } = await supabase
            .from("customers")
            .select("role")
            .eq("id", user.id)
            .single();

        if (roleError || customer?.role !== "admin") {
            return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
        }

        // 3. Get FCM Tokens for this user
        const { data: tokensData, error: tokenError } = await supabase
            .from("fcm_tokens")
            .select("token")
            .eq("user_id", user.id);

        if (tokenError || !tokensData || tokensData.length === 0) {
            return NextResponse.json({ message: "No device tokens found for your account." }, { status: 404 });
        }

        const tokens = tokensData.map((t) => t.token);
        const uniqueTokens = Array.from(new Set(tokens));

        // 4. Send Test Notification
        const app = await initAdmin();
        const messaging = getMessaging(app);

        const message = {
            notification: {
                title: "Test Notification 🔔",
                body: "This is a test message to validate your settings.",
            },
            tokens: uniqueTokens,
            webpush: {
                fcmOptions: {
                    link: "/profile",
                },
            },
        };

        const response = await messaging.sendEachForMulticast(message);

        // Calculate failures
        let failedCount = 0;
        if (response.failureCount > 0) {
            response.responses.forEach((resp) => {
                if (!resp.success) failedCount++;
            });
        }

        return NextResponse.json({
            success: true,
            sent_count: response.successCount,
            failed_count: failedCount,
            total_tokens: uniqueTokens.length,
        });

    } catch (error: any) {
        console.error("Test notification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
