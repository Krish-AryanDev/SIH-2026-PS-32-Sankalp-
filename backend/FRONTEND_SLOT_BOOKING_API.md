# Slot Booking API

This document describes the client slot and booking APIs for the frontend team.

## Base URL

Local backend:

```text
http://localhost:5000
```

All routes below are prefixed with `/api/slot_book`.

## Authentication

Every endpoint requires a valid farmer JWT:

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

If the token is missing, invalid, expired, or does not belong to an existing farmer, the API returns `401` or `404`.

## 1. Find Procurement Centres

```http
GET /api/slot_book/slot
```

### Request body

Although this is a `GET` route, the current backend reads these values from the JSON request body.

```json
{
  "date": "2026-09-15",
  "crop_type": "wheat",
  "pincode": "110001"
}
```

| Field       | Type             | Required | Description                 |
| ----------- | ---------------- | -------- | --------------------------- |
| `date`      | string           | Yes      | Requested procurement date. |
| `crop_type` | string           | Yes      | Crop to be procured.        |
| `pincode`   | string or number | Yes      | Farmer's pincode.           |

The backend returns active centres at the pincode that accept the requested crop.

### Success response: `200`

```json
{
  "message": "Procurement centers fetched successfully",
  "success": true,
  "data": [
    {
      "centrecode": "PC-110001-01",
      "address": "Main Market Road, New Delhi"
    }
  ]
}
```

### Error response: `400`

```json
{
  "message": "farmer_id, date or range or required",
  "success": false
}
```

The error message is currently kept for backend compatibility, although `farmer_id` is not required by this endpoint.

## 2. Check Session Availability

```http
GET /api/slot_book/can_book
```

This route also expects the request values in a JSON body.

### Request body

```json
{
  "centercode": "PC-110001-01",
  "date": "2026-09-15",
  "session": "morning",
  "crop_type": "wheat",
  "qtyrange": "2.5-3.0"
}
```

| Field        | Type   | Required | Allowed values / description                                           |
| ------------ | ------ | -------- | ---------------------------------------------------------------------- |
| `centercode` | string | Yes      | Centre code returned by the slot lookup.                               |
| `date`       | string | Yes      | Requested procurement date.                                            |
| `session`    | string | Yes      | `morning` or `afternoon`.                                              |
| `crop_type`  | string | No\*     | Crop type used to find the slot record.                                |
| `qtyrange`   | string | Yes      | Quantity range in tons, formatted as `min-max`, for example `2.5-3.0`. |

\* The controller destructures `crop_type`, but its required-field validation currently does not reject a missing value. The frontend should always send it.

### Success response: `200`

```json
{
  "success": true,
  "message": "You can book in morning.",
  "data": {
    "canBook": true,
    "session": "morning",
    "farmerMaxQty": 3,
    "note": "10% buffer is reserved in each slot for weighing errors."
  }
}
```

`canBook` is `true` when at least one slot in the selected session can fit the maximum quantity after the 10% buffer is reserved.

### Common errors

`400` for missing fields or invalid quantity format:

```json
{
  "message": "Invalid qtyrange format. Use 'min-max' (e.g., '2.5-3.0')",
  "success": false
}
```

`404` when no slot configuration exists for the selected centre, date, and crop.

## 3. Book a Slot

```http
POST /api/slot_book/book
```

### Request body

```json
{
  "farmer_id": "665abc1234567890abcdef12",
  "centercode": "PC-110001-01",
  "date": "2026-09-15",
  "session": "morning",
  "croptype": "wheat",
  "qtyrange": "2.5-3.0"
}
```

| Field        | Type   | Required | Description                                                                                                                                 |
| ------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `farmer_id`  | string | No       | Farmer ID. The authenticated farmer is already identified by the JWT; if omitted, the booking is stored as a guest booking where supported. |
| `centercode` | string | Yes      | Centre code returned by the slot lookup.                                                                                                    |
| `date`       | string | Yes      | Requested procurement date.                                                                                                                 |
| `session`    | string | Yes      | `morning` or `afternoon`.                                                                                                                   |
| `croptype`   | string | Yes      | Crop type. Note the spelling difference from the other two endpoints.                                                                       |
| `qtyrange`   | string | Yes      | Quantity range in tons, formatted as `min-max`, for example `2.5-3.0`.                                                                      |

The booking service:

1. Calculates the average quantity for ranking.
2. Filters session slots using the maximum quantity and a 10% capacity buffer.
3. Ranks eligible slots by load balancing and crowding.
4. Attempts an atomic reservation, trying the next ranked slot if another booking wins the race.

### Success response: `200`

```json
{
  "success": true,
  "message": "Booking confirmed for 08:00-10:00!",
  "data": {
    "farmerId": "665abc1234567890abcdef12",
    "centerCode": "PC-110001-01",
    "date": "2026-09-15",
    "crop": "wheat",
    "assignedSlot": "08:00-10:00",
    "token": "BOOKING-TOKEN-FROM-BACKEND",
    "farmerClass": "medium",
    "estimatedQty": 2.75,
    "reservedQty": 3,
    "quantityRangeEnum": "<50",
    "scoreBreakdown": {
      "08:00-10:00": 18.42,
      "10:00-12:00": 24.1
    },
    "bestScore": 18.42,
    "updatedSlotCapacity": {
      "available": 7,
      "booked": 43
    },
    "note": "10% buffer is reserved in each slot for weighing errors."
  }
}
```

### Common errors

Missing or invalid input returns `400`:

```json
{
  "message": "Invalid qtyrange. Use 'min-max' (e.g., '2.5-3.0')",
  "success": false
}
```

No eligible capacity returns `409`:

```json
{
  "success": false,
  "canBook": false,
  "message": "Morning is full for your quantity (3 tons). Please choose the other session or reduce your estimate."
}
```

If all eligible slots become unavailable during booking, the API also returns `409`:

```json
{
  "success": false,
  "canBook": false,
  "message": "All eligible slots filled up just now — please try again."
}
```

## Frontend Integration Flow

1. Authenticate the farmer and store the returned JWT securely for the current app session.
2. Call `GET /api/slot_book/slot` with the date, crop, and pincode.
3. Display the returned centres and let the farmer select one.
4. Call `GET /api/slot_book/can_book` with the selected centre, date, session, crop, and quantity range.
5. Enable booking only when `data.canBook === true`.
6. Call `POST /api/slot_book/book` using `croptype` in the request body.
7. On `200`, show the assigned slot and booking token from `data`.
8. On `409`, refresh availability and ask the farmer to select another session or retry.

## Frontend Notes

- Send quantity values in tons, not quintals.
- Always send the maximum quantity from `qtyrange` conservatively; it is used for capacity checks and reservation.
- Use the exact session values `morning` and `afternoon`.
- Use the exact crop field names currently expected by each endpoint: `crop_type` for `/slot` and `/can_book`, `croptype` for `/book`.
- Treat `409` as a business-level availability response, not a network failure.
- The backend currently defines the first two routes as `GET` routes that consume JSON bodies. Configure the HTTP client to preserve the body on `GET`; if the client does not support that reliably, the backend routes should be changed to `POST` or query parameters before integration.
