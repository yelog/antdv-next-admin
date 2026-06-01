import { faker } from "@faker-js/faker";
import { defineMock } from "vite-plugin-mock-dev-server";

import type { User } from "@/types/auth";

import { adminUser, mockUsers } from "../data/users.data";

const allUsers = () => [
  adminUser,
  ...mockUsers.filter((user) => user.id !== adminUser.id),
];

export default defineMock([
  // Get user list (with pagination and search)
  {
    url: "/api/users",
    method: "GET",
    body: (req) => {
      const {
        current = 1,
        pageSize = 10,
        username,
        email,
        status,
        gender,
      } = req.query;

      // Filter users
      let filteredUsers = allUsers();

      if (username) {
        filteredUsers = filteredUsers.filter((user) =>
          user.username.toLowerCase().includes(username.toLowerCase()),
        );
      }

      if (email) {
        filteredUsers = filteredUsers.filter((user) =>
          user.email.toLowerCase().includes(email.toLowerCase()),
        );
      }

      if (status) {
        filteredUsers = filteredUsers.filter((user) => user.status === status);
      }

      if (gender) {
        const genderValues = Array.isArray(gender)
          ? gender.map((item) => String(item))
          : String(gender)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
        if (genderValues.length > 0) {
          filteredUsers = filteredUsers.filter((user) =>
            genderValues.includes(String(user.gender)),
          );
        }
      }

      // Pagination
      const start = (Number(current) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      const list = filteredUsers.slice(start, end);

      return {
        code: 200,
        message: "Success",
        data: {
          list,
          total: filteredUsers.length,
          current: Number(current),
          pageSize: Number(pageSize),
        },
        success: true,
      };
    },
  },

  // Get user by ID
  {
    url: "/api/users/:id",
    method: "GET",
    body: (req) => {
      const { id } = req.params;
      const user = allUsers().find((u) => u.id === id);

      if (user) {
        return {
          code: 200,
          message: "Success",
          data: user,
          success: true,
        };
      } else {
        return {
          code: 404,
          message: "User not found",
          data: null,
          success: false,
        };
      }
    },
  },

  // Create user
  {
    url: "/api/users",
    method: "POST",
    body: (req) => {
      const userData = req.body;

      const newUser: User = {
        id: faker.string.uuid(),
        username: userData.username || `user_${faker.string.alphanumeric(6)}`,
        email: userData.email || faker.internet.email(),
        realName: userData.realName || faker.person.fullName(),
        avatar: userData.avatar || faker.image.avatar(),
        phone: userData.phone || `1${faker.string.numeric(10)}`,
        gender: userData.gender || "male",
        birthDate:
          userData.birthDate ||
          faker.date
            .birthdate({ min: 18, max: 65, mode: "age" })
            .toISOString()
            .split("T")[0],
        bio: userData.bio || "",
        status: userData.status || "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roles: userData.roles || [],
        permissions: userData.permissions || [],
      };

      mockUsers.unshift(newUser);

      return {
        code: 200,
        message: "User created successfully",
        data: newUser,
        success: true,
      };
    },
  },

  // Update user
  {
    url: "/api/users/:id",
    method: "PUT",
    body: (req) => {
      const { id } = req.params;
      const userData = req.body;

      if (id === adminUser.id) {
        Object.assign(adminUser, userData, {
          updatedAt: new Date().toISOString(),
        });
        return {
          code: 200,
          message: "User updated successfully",
          data: adminUser,
          success: true,
        };
      }

      const index = mockUsers.findIndex((u) => u.id === id);

      if (index !== -1) {
        mockUsers[index] = {
          ...mockUsers[index],
          ...userData,
          updatedAt: new Date().toISOString(),
        };

        return {
          code: 200,
          message: "User updated successfully",
          data: mockUsers[index],
          success: true,
        };
      } else {
        return {
          code: 404,
          message: "User not found",
          data: null,
          success: false,
        };
      }
    },
  },

  // Delete user
  {
    url: "/api/users/:id",
    method: "DELETE",
    body: (req) => {
      const { id } = req.params;
      if (id === adminUser.id) {
        return {
          code: 400,
          message: "Cannot delete admin user",
          data: null,
          success: false,
        };
      }

      const index = mockUsers.findIndex((u) => u.id === id);

      if (index !== -1) {
        mockUsers.splice(index, 1);

        return {
          code: 200,
          message: "User deleted successfully",
          data: null,
          success: true,
        };
      } else {
        return {
          code: 404,
          message: "User not found",
          data: null,
          success: false,
        };
      }
    },
  },

  // Batch delete users
  {
    url: "/api/users/batch",
    method: "DELETE",
    body: (req) => {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return {
          code: 400,
          message: "Invalid user IDs",
          data: null,
          success: false,
        };
      }

      let deletedCount = 0;
      ids.forEach((id: string) => {
        const index = mockUsers.findIndex((u) => u.id === id);
        if (index !== -1) {
          mockUsers.splice(index, 1);
          deletedCount++;
        }
      });

      return {
        code: 200,
        message: `Deleted ${deletedCount} users successfully`,
        data: { deletedCount },
        success: true,
      };
    },
  },

  // Change password
  {
    url: "/api/users/change-password",
    method: "POST",
    body: (req) => {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return {
          code: 400,
          message: "Password cannot be empty",
          data: null,
          success: false,
        };
      }

      if (oldPassword !== "123456") {
        return {
          code: 400,
          message: "Current password is incorrect",
          data: null,
          success: false,
        };
      }

      if (String(newPassword).length < 6) {
        return {
          code: 400,
          message: "Password must be at least 6 characters",
          data: null,
          success: false,
        };
      }

      return {
        code: 200,
        message: "Password changed successfully",
        data: null,
        success: true,
      };
    },
  },
]);
