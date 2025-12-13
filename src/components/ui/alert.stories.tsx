import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <Info />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>This is an informational message.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-[400px]">
      <AlertCircle />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Something went wrong. Please try again.
      </AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <CheckCircle className="text-green-600" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <AlertTriangle className="text-yellow-600" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>This action cannot be undone.</AlertDescription>
    </Alert>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <Info />
      <AlertTitle>Heads up!</AlertTitle>
    </Alert>
  ),
};

export const NoIcon: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <AlertTitle>Note</AlertTitle>
      <AlertDescription>This alert has no icon.</AlertDescription>
    </Alert>
  ),
};
