import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <CheckCircle />
        Verified
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const ApplicationStatus: Story = {
  name: "Application Status Examples",
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          <Clock />
          New
        </Badge>
        <Badge variant="default">
          <AlertCircle />
          Screening
        </Badge>
        <Badge variant="outline">
          <Clock />
          Interview
        </Badge>
        <Badge variant="default">
          <CheckCircle />
          Offered
        </Badge>
        <Badge variant="destructive">
          <XCircle />
          Rejected
        </Badge>
      </div>
    </div>
  ),
};

export const SkillTags: Story = {
  name: "Skill Tags Examples",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">React</Badge>
      <Badge variant="outline">TypeScript</Badge>
      <Badge variant="outline">Node.js</Badge>
      <Badge variant="outline">PostgreSQL</Badge>
      <Badge variant="outline">AWS</Badge>
    </div>
  ),
};
