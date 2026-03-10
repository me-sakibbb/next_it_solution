import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { notificationId } = await request.json();

        if (!notificationId) {
            return NextResponse.json(
                { error: "Notification ID is required" },
                { status: 400 }
            );
        }

        const supabase = await createAdminClient();

        const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", notificationId);

        if (error) {
            console.error("Error marking notification as read:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
