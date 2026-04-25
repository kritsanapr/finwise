# Suggested folder layout for Elysia + Next.js (App Router)
```
my‑project/
│
├─ src/                     # all source code
│   ├─ server/              # Elysia “backend” (can be imported anywhere)
│   │   ├─ modules/         # feature‑based modules
│   │   │   ├─ auth/
│   │   │   │   ├─ index.ts      # controller – creates an Elysia instance
│   │   │   │   ├─ service.ts    # pure business logic
│   │   │   │   └─ model.ts      # t.Object schemas + TS types
│   │   │   └─ user/
│   │   │       ├─ index.ts
│   │   │       ├─ service.ts
│   │   │       └─ model.ts
│   │   └─ eden.ts          # isomorphic Eden client (see below)
│   │
│   ├─ app/                 # Next.js app‑router files
│   │   ├─ api/[[...slugs]]/route.ts   # single “bridge” route
│   │   └─ page.tsx          # any UI page that can call `api`
│   │
│   └─ lib/                 # shared utilities (logger, db, etc.)
│
├─ public/                  # static assets served by Next.js
│
├─ tsconfig.json
└─ package.json
```
Why this works
Part	Reason
feature‑based modules (auth, user, …)	Keeps controller, service, model together. Easy to navigate and test.
index.ts creates an Elysia instance	Each module owns its own prefix (e.g. /auth). The instance is exported as app.
eden.ts	Builds an isomorphic client: on the server it calls the Elysia instance directly, on the browser it uses HTTP. Guarantees end‑to‑end type safety.
Single Next.js bridge route (app/api/[[...slugs]]/route.ts)	One file that re‑exports app.fetch for every HTTP verb. No need to duplicate routes per file.
public/	Let Next.js serve static files; Elysia only handles API logic.
🛠️ Example code
```ts
1️⃣ src/server/modules/auth/index.ts – controller
// src/server/modules/auth/index.ts
import { Elysia, t } from 'elysia'
import { AuthService } from './service'
import { AuthModel } from './model'
export const authApp = new Elysia({ prefix: '/auth' })
  .post(
    '/sign-in',
    async ({ body }) => AuthService.signIn(body),
    {
      body: AuthModel.SignInBody,
      response: {
        200: AuthModel.SignInRes,
        400: AuthModel.SignInErr,
      },
    },
  )

2️⃣ src/server/modules/auth/service.ts – business logic
// src/server/modules/auth/service.ts
import { status } from 'elysia'
export class AuthService {
  static async signIn(data: { username: string; password: string }) {
    // pretend DB check …
    if (data.password !== 'secret')
      throw status(400, 'Invalid credentials')
    return { username: data.username, token: '🦊' }
  }
}

3️⃣ src/server/modules/auth/model.ts – schemas & types
// src/server/modules/auth/model.ts
import { t } from 'elysia'
export const AuthModel = {
  SignInBody: t.Object({
    username: t.String(),
    password: t.String(),
  }),
  SignInRes: t.Object({
    username: t.String(),
    token: t.String(),
  }),
  SignInErr: t.Literal('Invalid credentials'),
}

4️⃣ src/server/eden.ts – isomorphic client
// src/server/eden.ts
import { treaty } from '@elysiajs/eden'
import type { authApp } from './modules/auth/index'
export const api =
  typeof process !== 'undefined'
    ? // server: direct call, no network hop
      treaty(authApp).api
    : // client: real HTTP request
      treaty<typeof authApp>('http://localhost:3000/api').api

5️⃣ src/app/api/[[...slugs]]/route.ts – Next.js bridge
// src/app/api/[[...slugs]]/route.ts
import { authApp } from '@/server/modules/auth/index'   // ← import your Elysia apps
import { userApp } from '@/server/modules/user/index'   // (optional more modules)
export const GET = authApp.fetch   // expose GET
export const POST = authApp.fetch  // expose POST
// add other verbs as needed (PUT, DELETE, …)

Tip: If you have several modules, you can compose them:

import { Elysia } from 'elysia'
import { authApp } from '@/server/modules/auth/index'
import { userApp } from '@/server/modules/user/index'
export const app = new Elysia()
  .use(authApp)
  .use(userApp)
export const GET = app.fetch
export const POST = app.fetch

6️⃣ Using the API in a Next.js page (client or server component)
// src/app/page.tsx
import { api } from '@/server/eden'
export default async function Page() {
  const { username } = await api.post('/auth/sign-in', {
    body: { username: 'fox', password: 'secret' },
  })
  return <h1>Hello, {username} 🦊</h1>
}
```
On the server side the call is direct (app.fetch), on the client it goes over HTTP – all while keeping full TypeScript inference.

📦 Quick checklist
Prefix matching – set new Elysia({ prefix: '/auth' }) to the folder segment where the route lives.
Export app.fetch for each HTTP verb in the Next.js route file.
Use Eden (@elysiajs/eden) for type‑safe client calls.
Keep modules feature‑based (controller + service + model).
Run with Bun or Node – both work; just npm i elysia @elysiajs/eden (plus any plugins you need).
Happy coding! 🎉 If you need more details on a specific plugin (e.g., static files, JWT, etc.), just let me know!

Integration with Meta Framework
Prefix
Folder Structure
Elysia with Bun Fullstack Dev Server
Integration with Next.js
Gotcha
*AI can make mistakes, verify with included references




