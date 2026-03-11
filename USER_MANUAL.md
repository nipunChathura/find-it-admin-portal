# Find It Admin Portal – User Manual

**Version:** 1.0  
**Last Updated:** March 2025

---

## 1. Introduction

The **Find It Admin Portal** is the central management system for the Find It platform. It allows administrators to manage users, customers, merchants, outlets, items, categories, discounts, payments, and notifications. You must be logged in to access any section.

---

## 2. Getting Started

### 2.1 Logging In

Open the portal and enter your **Username** and **Password** on the login page. You can optionally check **Remember Me** to stay logged in. Click **Login** to access the dashboard. If you forget your password, use the **Forgot Password?** link.

### 2.2 Layout Overview

After login, you see the main dashboard layout:

- **Sidebar (left):** The main menu. Click any item to navigate. **Item** and **Outlet** expand to show sub-menus. The current page is highlighted in blue.
- **Top toolbar:** Shows the app title, your greeting (Hi, username), notification bell, help icon, profile icon, and logout button. The menu icon (top-left) collapses or expands the sidebar.
- **Content area:** The main workspace where each page loads.
- **Footer:** Copyright and branding.

---

## 3. Dashboard Home

The Dashboard is the default start page after login. It gives an overview of the platform.

**Welcome section:** A greeting with your username and a short summary of what is happening across Find It today.

**KPI stat cards:** Seven cards show counts for Users, Merchants, Sub Merchants, Items, Customers, Outlets, and Categories. Each card links to the related section when clicked. Below these, two additional cards show Pending approvals and Active discounts.

**Monthly income:** A horizontal bar chart displays income in LKR by month for the last six months. Data comes from the dashboard API.

**Recent notifications:** The latest five notifications appear here. Click **View all notifications** to open the full Notifications page.

**Merchant summary:** Shows total merchants and total outlets from the merchant-summary API.

**Outlet distribution:** A pie chart shows outlet distribution by category or merchant.

**Quick actions:** Buttons to quickly go to User, Merchants, Payments, and Discounts.

---

## 4. User Management

The **User** section (sidebar) opens the Manage User page. Here you manage admin users who can log in to the portal.

### 4.1 Viewing Users

The page lists all admin users. Use the **Status** dropdown (All, ACTIVE, INACTIVE, PENDING, APPROVED, REJECTED, FORGOT_PASSWORD_PENDING) and **Search** box to filter. Click **Search** to apply filters; **Clear** resets and reloads the list. The table shows ID, Name/Username, Email, Status, Created Date, and Actions. Click column headers to sort; use the paginator at the bottom for page size and navigation.

### 4.2 Adding a User

Click **Add User**. Enter Name, Username, Email, Password, Role, and Status (if your role allows). Click **Save**. The new user appears in the table and can log in with the username and password you set.

### 4.3 Editing a User

Find the user and click the **Edit** (pencil) icon in the Actions column. Update Username, Email, Role, or Status in the dialog. Only users with the right role can change status. Click **Update** to save.

### 4.4 Deleting a User

Click the **Delete** (trash) icon and confirm. The user’s status is set to deleted; they can no longer log in.

### 4.5 Approving or Rejecting Users

As **System Admin**, for users with status **PENDING** you see Approve (check) and Reject. Click **Approve** to activate the user, or **Reject** and optionally enter a reason. SysAdmin users cannot be edited or deleted by other admins.

---

## 5. Merchant Management

The **Merchant** section manages merchants (businesses) and sub-merchants that use the Find It platform. Merchants can have sub-merchants and outlets; they sell items.

### 5.1 Viewing Merchants

The table lists merchants and sub-merchants with columns such as Merchant ID, Name, Email, Phone, Type (FREE, SILVER, GOLD, PLATINUM, DIAMOND), Main or Sub, Status, and Parent Merchant (for sub-merchants). Use **Status**, **Merchant Type**, and **Search** filters. Click **Search** to apply; **Clear** resets.

### 5.2 Adding a Merchant

Click **Add Merchant**. Fill in the form (name, email, phone, address, profile image, type, etc.). Click **Save**. The new merchant appears in the list.

### 5.3 Editing a Merchant

Click the **Edit** (pencil) icon on the row. Update details in the dialog and click **Update**.

### 5.4 Deleting a Merchant

Click the **Delete** (trash) icon and confirm. The merchant is removed. This may affect linked outlets and items depending on backend rules.

### 5.5 Approving or Rejecting Merchants

For main merchants with status **PENDING**, System Admin sees **Approve** and **Reject**. Approve to activate, or Reject and enter a reason. Sub-merchants are rejected separately with their own reason.

---

## 6. Outlet Management

The **Outlet** menu has three sub-pages: **Outlet** (list), **Outlet Schedule**, and **Payment**.

### 6.1 Outlet List

View all outlets. Columns include Outlet ID, Name, Address, Phone, Type (PHYSICAL_STORE, ONLINE, KIOSK), Merchant Name, Sub Merchant Name, and Status. Use **Status**, **Outlet Type**, and **Search** filters. Click **Add Outlet** to create a new outlet. Use **Edit** to update details, **View** to see full details, or **Delete** to remove an outlet.

### 6.2 Outlet Schedule

Configure opening hours and schedules for each outlet. Select an outlet from the dropdown. Schedules are grouped by type: **Normal** (weekly recurring), **Emergency**, and **Temporary**. You can filter by date or day of week. Add, edit, or delete schedule entries. Each entry has open time, close time, and an option to mark the outlet as closed (e.g. for holidays).

### 6.3 Outlet Payment

Manage payments linked to outlets. The table shows Payment ID, Outlet Name, Amount, Payment Type, Paid Month, Payment Date, and Status (PENDING, PAID, FAILED). Use **Outlet** and **Status** filters. Add new payments, edit existing ones, delete payments, or approve pending payments. For payments with a receipt image, use **View Receipt** to see the uploaded receipt.

---

## 7. Item Management

The **Item** menu has two sub-pages: **Item** (catalogue) and **Item Discount**.

### 7.1 Item Catalogue

View all items (products or services). Columns include ID, Name, Category, Outlet, Price, Status, Availability, and Discount Availability. Use **Status**, **Availability**, **Category**, **Outlet**, and **Search** filters. Category and Outlet use searchable dropdowns. Click **Add Item** to create a new item. Click a row to view item details. Use **Edit** or **Delete** from the Actions column.

### 7.2 Item Discount

Manage discounts applied to specific items. The table shows Discount ID, Name, Outlet, Type, Value, Status, Start Date, and End Date. Filter by **Status** and **Item** (searchable). Click **Add** to create a discount (name, type, value, item, outlet, dates). Click a row to open the discount detail dialog. Use **Edit** or **Delete** from the Actions column.

---

## 8. Category Management

The **Category** section manages categories used to group items (e.g. Food, Electronics).

### 8.1 Viewing Categories

The table lists categories with ID, Name, Type (ITEM or SERVICE), Status, and Created Date. Use **Status**, **Category Type**, and **Search** filters.

### 8.2 Adding a Category

Click **Add Category**. Enter name, description, type, and status. Optionally upload a category image. Click **Save**.

### 8.3 Editing a Category

Click the **Edit** (pencil) icon. Update name, description, type, image, or status. Click **Update**.

### 8.4 Deleting a Category

Click the **Delete** (trash) icon and confirm. Ensure no items depend on the category, or reassign them first, to avoid errors.

---

## 9. Customer Management

The **Customer** section manages end users of the Find It platform.

### 9.1 Viewing Customers

The table shows ID, Name, Email, Phone, Membership Type (SILVER, GOLD, PLATINUM), and Status. Use **Status**, **Membership**, and **Search** filters.

### 9.2 Adding a Customer

Click **Add Customer**. Enter name, email, phone, and status. Click **Save**.

### 9.3 Editing a Customer

Click the **Edit** (pencil) icon. Update first name, last name, email, phone, NIC, date of birth, gender, country, membership, or status. Click **Update**.

### 9.4 Deleting a Customer

Click the **Delete** (trash) icon and confirm. The customer is removed from the list.

---

## 10. Notifications

Notifications keep you updated on events such as new signups and system alerts.

### 10.1 Bell Icon (Toolbar)

Click the **bell** in the top toolbar to open a dropdown. A red badge shows the count of unread notifications (hidden when zero). Each item shows title, message, time, and type. Unread items are highlighted. Use the checkmark on a row to mark as read, or **Mark all as read** at the top. Click **View All** to open the full Notifications page.

### 10.2 Notifications Page

Open from the bell dropdown (**View All**), from the sidebar (**Notifications**), or from Dashboard home (**View all notifications**). The page shows all notifications. You can mark individual items as read or mark all as read.

---

## 11. Profile and Account

### 11.1 Profile Popup

Click the **Account** (profile) icon in the toolbar. A popup shows your username, role, user ID, status, and profile image. From here you can:

- **Change profile image:** Upload a new profile photo.
- **Change password:** Enter current password and new password to update.

### 11.2 Logout

Click the **Logout** icon in the toolbar when you finish to keep your account secure.

---

## 12. Help

The **Help** section (sidebar or toolbar) opens a user guide with expandable panels for each section. Use it for quick reference on Dashboard, User, Customer, Item, Merchant, Category, Outlet, Payment, and Notifications.

---

## 13. Tips and Best Practices

**Sidebar:** Use the menu icon (top-left) to collapse or expand the sidebar for more content space.

**Finding data:** On list pages, use **Search** and filters (Status, dropdowns), then click **Search** or press Enter. Use **Clear** to reset filters.

**Sorting and paging:** Click column headers to sort. Use the paginator at the bottom to set page size (5, 10, 25, 50) and move between pages.

**Dashboard data:** KPI counts, monthly income, merchant summary, and outlet distribution come from the dashboard APIs. If a section shows zero or unexpected data, check that the backend endpoints are available and you are logged in.

**Account security:** Change your password periodically and log out when using shared computers.

---

## 14. Support

For technical support or questions about the Find It Admin Portal, contact your system administrator or the Find It support team.

---

*© 2025 Find It. All rights reserved.*
