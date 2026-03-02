# Notifications API

## Base URL
```
http://localhost:9090/find-it/api/notifications
```

All requests require header: `Authorization: Bearer <token>`.

---

## Example API response (GET list)

**GET** `/notifications`

```json
[
  {
    "id": "notif-001",
    "title": "Deployment completed",
    "message": "Service 'find-it-api' was deployed successfully to production.",
    "type": "success",
    "isRead": false,
    "createdAt": "2025-02-27T10:30:00.000Z"
  },
  {
    "id": "notif-002",
    "title": "High memory usage",
    "message": "Instance us-east-1-a is above 85% memory. Consider scaling.",
    "type": "warning",
    "isRead": true,
    "createdAt": "2025-02-27T09:15:00.000Z"
  },
  {
    "id": "notif-003",
    "title": "New user signup",
    "message": "A new admin user has requested access.",
    "type": "info",
    "isRead": false,
    "createdAt": "2025-02-27T08:00:00.000Z"
  }
]
```

Backend may use `is_read` and `created_at` (snake_case); the service maps both.

---

## Mark one as read

**PATCH** `/notifications/:id/read`

Body: `{}` (empty) or omit.

---

## Mark all as read

**POST** `/notifications/read-all`

Body: `{}` (empty) or omit.

---

## Integration steps

1. **Backend**: Implement the three endpoints above and return the list shape (array of objects with `id`, `title`, `message`, `type`, `isRead`/`is_read`, `createdAt`/`created_at`).

2. **URL**: If your API base differs, set `NOTIFICATIONS_URL` in `notification.service.ts`.

3. **Polling**: The service polls every 10 seconds when the app is loaded. No WebSocket required.

4. **Auth**: Uses `AuthService.token()`; ensure the user is logged in so the Bearer token is sent.
