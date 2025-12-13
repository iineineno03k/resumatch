import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { SearchInput } from "./search-input";

const meta: Meta<typeof SearchInput> = {
  title: "Common/SearchInput",
  component: SearchInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  render: function DefaultSearch() {
    const [value, setValue] = useState("");
    return (
      <div className="w-[300px]">
        <SearchInput
          value={value}
          onChange={setValue}
          placeholder="応募者を検索..."
        />
      </div>
    );
  },
};

export const WithValue: Story = {
  render: function WithValueSearch() {
    const [value, setValue] = useState("山田");
    return (
      <div className="w-[300px]">
        <SearchInput
          value={value}
          onChange={setValue}
          placeholder="応募者を検索..."
        />
      </div>
    );
  },
};

export const CustomPlaceholder: Story = {
  render: function CustomPlaceholderSearch() {
    const [value, setValue] = useState("");
    return (
      <div className="w-[300px]">
        <SearchInput
          value={value}
          onChange={setValue}
          placeholder="求人タイトルで検索..."
        />
      </div>
    );
  },
};

export const Wide: Story = {
  render: function WideSearch() {
    const [value, setValue] = useState("");
    return (
      <div className="w-[500px]">
        <SearchInput
          value={value}
          onChange={setValue}
          placeholder="検索..."
          className="w-full"
        />
      </div>
    );
  },
};
