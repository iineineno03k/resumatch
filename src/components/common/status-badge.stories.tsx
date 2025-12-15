import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ApplicantStatus } from "@/features/applicants/types";
import { StatusBadge } from "./status-badge";

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
        "screening",
        "first_interview",
        "second_interview",
        "final_interview",
        "offer",
        "accepted",
        "rejected",
        "withdrawn",
      ] satisfies ApplicantStatus[],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Screening: Story = {
  args: {
    status: "screening",
  },
};

export const FirstInterview: Story = {
  args: {
    status: "first_interview",
  },
};

export const SecondInterview: Story = {
  args: {
    status: "second_interview",
  },
};

export const FinalInterview: Story = {
  args: {
    status: "final_interview",
  },
};

export const Offer: Story = {
  args: {
    status: "offer",
  },
};

export const Accepted: Story = {
  args: {
    status: "accepted",
  },
};

export const Rejected: Story = {
  args: {
    status: "rejected",
  },
};

export const Withdrawn: Story = {
  args: {
    status: "withdrawn",
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="screening" />
      <StatusBadge status="first_interview" />
      <StatusBadge status="second_interview" />
      <StatusBadge status="final_interview" />
      <StatusBadge status="offer" />
      <StatusBadge status="accepted" />
      <StatusBadge status="rejected" />
      <StatusBadge status="withdrawn" />
    </div>
  ),
};
