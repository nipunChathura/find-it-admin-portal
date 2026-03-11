# Dashboard API Specification

This document describes the backend APIs needed to replace dummy data on the **Dashboard Home** page. Use it to design and implement the APIs; responses should match the shapes below so the frontend can connect with minimal changes.

---

## 1. Dashboard overview (counts)

**Purpose:** Populate the KPI cards (Users, Merchants, Items, Customers, Outlets, Categories, Pending approvals, Active discounts).

### Option A: Single summary endpoint (recommended)

**Request**

- **Method:** `GET`
- **Path:** `/find-it/api/dashboard/summary` (or `/api/admin/dashboard/overview`)
- **Headers:** `Authorization: Bearer <token>`

**Response (example)**

```json
{
  "responseCode": "00",
  "status": "success",
  "data": {
    "totalUsers": 1247,
    "totalMerchants": 89,
    "totalItems": 3420,
    "totalCustomers": 5620,
    "totalOutlets": 156,
    "totalCategories": 24,
    "pendingApprovals": 12,
    "activeDiscounts": 48
  }
}
```

**Field notes**

- All counts are numbers (integers).
- `pendingApprovals`: e.g. users/merchants with status PENDING awaiting admin approval.
- `activeDiscounts`: discounts that are currently valid (within date range and active).

**Frontend mapping**

- The dashboard component expects an object like `DashboardStats`:
  - `totalUsers`, `totalMerchants`, `totalItems`, `totalCustomers`, `totalOutlets`, `totalCategories`, `pendingApprovals`, `activeDiscounts`.
- If the API returns a wrapper (e.g. `data`), the frontend will read from `response.data` and assign to `stats`.

---

### Option B: Separate count endpoints

If you prefer one endpoint per entity:

| Card              | Suggested endpoint                         | Response shape (example)     |
|-------------------|--------------------------------------------|------------------------------|
| Users             | `GET /api/admin/users/count`               | `{ "count": 1247 }`          |
| Merchants         | `GET /api/merchants/count`                 | `{ "count": 89 }`            |
| Items             | `GET /api/items/count`                     | `{ "count": 3420 }`          |
| Customers         | `GET /api/customers/count`                 | `{ "count": 5620 }`          |
| Outlets           | `GET /api/outlets/count`                   | `{ "count": 156 }`          |
| Categories        | `GET /api/categories/count`                | `{ "count": 24 }`           |
| Pending approvals | `GET /api/admin/pending-approvals/count`   | `{ "count": 12 }`           |
| Active discounts  | `GET /api/discounts/active/count`          | `{ "count": 48 }`            |

The frontend can call each endpoint and map `count` into the corresponding `DashboardStats` field.

---

## 2. Activity / chart data

**Purpose:** “Activity overview” bar chart (e.g. last 6 months).

**Request**

- **Method:** `GET`
- **Path:** `/find-it/api/dashboard/activity` (or `/api/admin/dashboard/activity`)
- **Headers:** `Authorization: Bearer <token>`
- **Query (optional):** `months=6` to request last N months.

**Response (example)**

```json
{
  "responseCode": "00",
  "status": "success",
  "data": [
    { "label": "Jan", "value": 420 },
    { "label": "Feb", "value": 380 },
    { "label": "Mar", "value": 510 },
    { "label": "Apr", "value": 490 },
    { "label": "May", "value": 620 },
    { "label": "Jun", "value": 580 }
  ]
}
```

**Field notes**

- `label`: Short month (or period) label.
- `value`: Numeric value for the bar (e.g. new users, orders, or transactions in that period).

Frontend expects an array of `{ label: string, value: number }`. Optional `color` per item is supported but not required.

---

## 3. Recent activity (feed)

**Purpose:** “Recent activity” list (new users, approvals, payments, discounts, items, etc.).

**Request**

- **Method:** `GET`
- **Path:** `/find-it/api/dashboard/recent-activity` (or `/api/admin/dashboard/recent-activity`)
- **Headers:** `Authorization: Bearer <token>`
- **Query (optional):** `limit=10` (default 5–10).

**Response (example)**

```json
{
  "responseCode": "00",
  "status": "success",
  "data": [
    {
      "id": "1",
      "title": "New user registered",
      "subtitle": "john.doe@example.com",
      "time": "2m ago",
      "icon": "person_add",
      "type": "user"
    },
    {
      "id": "2",
      "title": "Merchant approved",
      "subtitle": "Green Mart",
      "time": "15m ago",
      "icon": "store",
      "type": "merchant"
    }
  ]
}
```

**Field notes**

- `id`: Unique string (e.g. UUID or numeric string).
- `title`: Short title for the activity.
- `subtitle`: Extra detail (email, name, amount, etc.).
- `time`: Human-readable relative time (e.g. `"2m ago"`, `"1h ago"`) or ISO 8601 if the frontend will format.
- `icon`: Material icon name (e.g. `person_add`, `store`, `payment`, `local_offer`, `inventory_2`).
- `type`: One of `user` | `merchant` | `outlet` | `payment` | `discount` | `item` (for optional styling or routing).

Frontend expects an array of objects with at least: `id`, `title`, `subtitle`, `time`, `icon`, `type`.

---

## 4. Implementation order

1. **Summary API** – Replaces all KPI card dummy data in one go.
2. **Activity (chart) API** – Replaces bar chart dummy data.
3. **Recent activity API** – Replaces recent activity list dummy data.

---

## 5. Frontend integration (after APIs exist)

- Add a **Dashboard API service** (e.g. `dashboard.api.ts`) that calls the above endpoints.
- In `DashboardHomeComponent`:
  - Inject the service and call the APIs on init (e.g. in `ngOnInit` or via `resolve`).
  - Replace the initial `stats`, `chartData`, and `recentActivity` with the API responses, mapping response wrappers (e.g. `data`) to the existing interfaces.
- Keep the same template and layout; only the data source changes from dummy to API.

---

## 6. Summary table

| API purpose       | Suggested path                          | Main response shape |
|-------------------|-----------------------------------------|----------------------|
| KPI counts        | `GET /api/dashboard/summary`            | `{ data: { totalUsers, totalMerchants, ... } }` |
| Chart data        | `GET /api/dashboard/activity?months=6`   | `{ data: [ { label, value } ] }`         |
| Recent activity   | `GET /api/dashboard/recent-activity`    | `{ data: [ { id, title, subtitle, time, icon, type } ] }` |

All endpoints should require authentication (e.g. Bearer token) and return appropriate HTTP status and error messages for 4xx/5xx.
