import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { type ApplicantStatus, StatusBadge } from "./status-badge";

const meta: Meta<typeof StatusBadge> = {
  title: "Common/StatusBadge",
  component: StatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: [
        "new",
        "screening",
        "interview",
        "offered",
        "rejected",
        "hired",
      ] satisfies ApplicantStatus[],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const New: Story = {
  args: {
    status: "new",
  },
};

export const Screening: Story = {
  args: {
    status: "screening",
  },
};

export const Interview: Story = {
  args: {
    status: "interview",
  },
};

export const Offered: Story = {
  args: {
    status: "offered",
  },
};

export const Rejected: Story = {
  args: {
    status: "rejected",
  },
};

export const Hired: Story = {
  args: {
    status: "hired",
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="new" />
      <StatusBadge status="screening" />
      <StatusBadge status="interview" />
      <StatusBadge status="offered" />
      <StatusBadge status="rejected" />
      <StatusBadge status="hired" />
    </div>
  ),
};
