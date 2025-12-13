import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { StarRating } from "./star-rating";

const meta: Meta<typeof StarRating> = {
  title: "Common/StarRating",
  component: StarRating,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 5, step: 1 },
    },
    max: {
      control: { type: "number", min: 1, max: 10 },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    readonly: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StarRating>;

export const Default: Story = {
  args: {
    value: 3,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Full: Story = {
  args: {
    value: 5,
  },
};

export const Readonly: Story = {
  args: {
    value: 4,
    readonly: true,
  },
};

export const Small: Story = {
  args: {
    value: 3,
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    value: 4,
    size: "lg",
  },
};

export const Interactive: Story = {
  render: function InteractiveRating() {
    const [value, setValue] = useState(0);
    return (
      <div className="flex flex-col items-center gap-4">
        <StarRating value={value} onChange={setValue} />
        <p className="text-sm text-muted-foreground">Selected: {value} stars</p>
      </div>
    );
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm w-12">Small:</span>
        <StarRating value={3} size="sm" readonly />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm w-12">Medium:</span>
        <StarRating value={3} size="md" readonly />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm w-12">Large:</span>
        <StarRating value={3} size="lg" readonly />
      </div>
    </div>
  ),
};
