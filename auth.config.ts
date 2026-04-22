import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdmin = auth?.user?.role === "admin"
      const path = nextUrl.pathname

      // Public routes
      if (path === "/" || path.startsWith("/api") || path.startsWith("/login")) {
        // If logged in, don't let them on login page
        if (isLoggedIn && path.startsWith("/login")) {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
        return true
      }

      if (!isLoggedIn) {
        return false // Redirects to sign-in page
      }

      // Role check for admin routes
      if (path.startsWith("/admin") && !isAdmin) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as string
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig
