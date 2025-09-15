"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const handleMagicLink = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error(error.message);
            } else if (data) {
                router.push("/"); // redirect to dashboard after successful login
            }
        };

        handleMagicLink();
    }, [router, supabase]);

    return <p className="text-center mt-20">Verifying login...</p>;
}
