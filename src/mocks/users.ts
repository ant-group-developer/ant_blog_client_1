export interface User {
  id: number;
  created_at: Date;
  updated_at: Date;
  creator_id: number;
  modifier_id: number;
  password: string;
  email: string;
  status: boolean;
}

export const mockUsers = [
  {
    id: 1,
    created_at: new Date("2025-01-01T10:00:00Z"),
    updated_at: new Date("2025-01-05T12:00:00Z"),
    creator_id: 2,
    modifier_id: 2,
    password: "password123",
    email: "alice@example.com",
    status: true,
  },
  {
    id: 2,
    created_at: new Date("2025-02-15T09:30:00Z"),
    updated_at: new Date("2025-02-20T14:45:00Z"),
    creator_id: 1,
    modifier_id: 1,
    password: "secret456",
    email: "bob@example.com",
    status: false,
  },
  {
    id: 3,
    created_at: new Date("2025-03-10T08:15:00Z"),
    updated_at: new Date("2025-03-12T11:20:00Z"),
    creator_id: 2,
    modifier_id: 2,
    password: "mypassword",
    email: "charlie@example.com",
    status: true,
  },
];
