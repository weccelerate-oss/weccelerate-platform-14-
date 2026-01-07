// שים לב לתוספת של /next כאן - זה קריטי עבור ה-Handler ב-App Router
import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };