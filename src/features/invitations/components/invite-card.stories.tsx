import type { Meta, StoryObj } from "@storybook/react";
import { InviteCard } from "./invite-card";

const meta: Meta<typeof InviteCard> = {
  title: "Features/Invitations/InviteCard",
  component: InviteCard,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onAccept: { action: "accept" },
  },
};

export default meta;
type Story = StoryObj<typeof InviteCard>;

/**
 * 有効な招待（ログイン済み）
 */
export const ValidLoggedIn: Story = {
  args: {
    validation: {
      valid: true,
      company: { id: "company-1", name: "株式会社サンプル" },
      role: "member",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
    },
    isLoggedIn: true,
    token: "abc123",
    onAccept: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
  },
};

/**
 * 有効な招待（未ログイン）
 */
export const ValidNotLoggedIn: Story = {
  args: {
    validation: {
      valid: true,
      company: { id: "company-1", name: "株式会社サンプル" },
      role: "member",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    isLoggedIn: false,
    token: "abc123",
    onAccept: async () => ({ success: true }),
  },
};

/**
 * 有効な招待（管理者権限）
 */
export const ValidAdminRole: Story = {
  args: {
    validation: {
      valid: true,
      company: { id: "company-1", name: "株式会社サンプル" },
      role: "admin",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    isLoggedIn: true,
    token: "abc123",
    onAccept: async () => ({ success: true }),
  },
};

/**
 * 無効な招待（見つからない）
 */
export const InvalidNotFound: Story = {
  args: {
    validation: {
      valid: false,
      reason: "not_found",
    },
    isLoggedIn: false,
    token: "invalid-token",
    onAccept: async () => ({ success: false }),
  },
};

/**
 * 無効な招待（期限切れ）
 */
export const InvalidExpired: Story = {
  args: {
    validation: {
      valid: false,
      reason: "expired",
    },
    isLoggedIn: false,
    token: "expired-token",
    onAccept: async () => ({ success: false }),
  },
};

/**
 * 無効な招待（使用済み）
 */
export const InvalidUsed: Story = {
  args: {
    validation: {
      valid: false,
      reason: "used",
    },
    isLoggedIn: false,
    token: "used-token",
    onAccept: async () => ({ success: false }),
  },
};

/**
 * 無効な招待（すでに別会社に所属）
 */
export const InvalidAlreadyMember: Story = {
  args: {
    validation: {
      valid: false,
      reason: "already_member",
      currentCompanyName: "株式会社テスト",
    },
    isLoggedIn: true,
    token: "some-token",
    onAccept: async () => ({ success: false }),
  },
};

/**
 * エラーが発生した場合
 */
export const WithError: Story = {
  args: {
    validation: {
      valid: true,
      company: { id: "company-1", name: "株式会社サンプル" },
      role: "member",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    isLoggedIn: true,
    token: "abc123",
    onAccept: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: false, error: "すでに会社に所属しています" };
    },
  },
};
