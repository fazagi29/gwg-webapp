import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const proxy = NextAuth(authConfig).auth
export { proxy }

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
