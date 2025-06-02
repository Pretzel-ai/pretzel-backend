# VisioneerList Backend

A Node.js Express backend for user authentication and file management with MongoDB.

## Setup

1. Install dependencies:

    ```bash
    npm install
    ```

2. Create a `.env` file with:

    ```
    PORT=8000
    DB_USERNAME=your_username
    DB_PASSWORD=your_password
    DB_KEY=your_key
    ```

3. Run the server:
    ```bash
    npm start
    ```

## Development

-   **Linting**: `npm run lint`
-   **Formatting**: `npm run format`
-   **Development mode**: `npm run dev`
-   **Testing**: `npm test`

## Deployment

Build and run with Docker:

```bash
docker build -t visioneerlist-backend .
docker run -p 8000:8000 --env-file .env visioneerlist-backend
```
