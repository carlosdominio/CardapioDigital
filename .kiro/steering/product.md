# Product Overview

This is a **Digital Menu System** (Cardápio Digital) for restaurants, built as a complete web application in Portuguese (pt-BR).

## Core Features

- **Customer Interface** (`index.html`): Digital menu where customers can browse items, add to cart, and place orders
- **Order Management** (`pedidos.html`): Staff interface for viewing and managing incoming orders with real-time notifications
- **Admin Panel** (`admin.html`): Management interface for menu categories and items

## Key Functionality

- Real-time order processing with Firebase Realtime Database
- Shopping cart with payment method selection (Pix, Card, Cash)
- Order confirmation system with unique table codes
- Stock management and automatic inventory updates
- Audio notifications for new orders
- PDF generation for order receipts
- Mobile-responsive design

## User Flow

1. Customers browse menu and add items to cart
2. Orders are submitted with customer name and table number
3. Staff receives real-time notifications of new orders
4. Staff can confirm, modify, or reject orders
5. Completed orders can be marked as finished

The system is designed for restaurant environments where customers can order from their table using their mobile devices.