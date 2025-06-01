# Realtime Database Server

WebSocket server that allows for fast real-time updates to multiple connections via an in-memory or database-storage layer.

Inspired fully by Firebase Realtime Database.

**Supports:**
- Connection limits ✅
- Interfacing between choice of in-memory and other storage systems via a common data storage layer. ✅
- Subscriptions to data paths ✅
- Writing to data paths ✅
- Disconnection actions ✅
- Basic security rules with path and context evaluation ✅
- Customizable logic for API Key and Auth token validation ✅

You can read a full blog post about the  it [here](https://blog.devesh.tech/post/building-firebase-realtime-database).

Stream of updates to a connection/multiple connections subscribed to a path:
![](./assets/Working%20Subscription%20to%20path.JPG)

Writing data via a realtime socket connection:
![](./assets/Writing%20Data%20to%20a%20Path.JPG)

### Setting up the server

> **Note:** You need > Node.js 22 to enable TypeScript compilation and type-stripping out-of-the-box.

Simply clone the repository, 

Use an `.env` to specify the following environment variables:

```env
HEART_BEAT_TIME_DIFF=
SECURITY_RULES=
STORAGE_LAYER=
WS_PORT=
MAX_CONNECTIONS=
```

Then to run the server in dev mode: `npm run dev`

To start in production mode: `npm run start`

### Testing the server

There are 2 ways to test the server:

- Automation tests in the `tests` directory: `npm run test` (Uses [Vitest](https://vitest.dev/), pass any additional arguments using `--` after the command)
- Manual/E2E tests via a Postman collection: Unfortunately Postman doesn't allow for exporting of a collection.

### Contributions

This is a fun learning side-project for me and not something I intend to make any money from. If you want to do the same and contribute further, you're more than welcome to fork this repository and raise any Pull Requests to add changes.