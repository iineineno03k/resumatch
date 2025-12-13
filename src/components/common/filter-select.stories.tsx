import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { FilterSelect } from "./filter-select";

const meta: Meta<typeof FilterSelect> = {
  title: "Common/FilterSelect",
  component: FilterSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilterSelect>;

const statusOptions = [
  { value: "new", label: "新規" },
  { value: "screening", label: "書類選考" },
  { value: "interview", label: "面接" },
  { value: "offered", label: "内定" },
  { value: "rejected", label: "不採用" },
  { value: "hired", label: "採用" },
];

const jobOptions = [
  { value: "1", label: "バックエンドエンジニア" },
  { value: "2", label: "フロントエンドエンジニア" },
  { value: "3", label: "デザイナー" },
];

export const Status: Story = {
  render: function StatusFilter() {
    const [value, setValue] = useState("all");
    return (
      <FilterSelect
        value={value}
        onChange={setValue}
        options={statusOptions}
        placeholder="ステータス"
        allLabel="すべてのステータス"
      />
    );
  },
};

export const Jobs: Story = {
  render: function JobFilter() {
    const [value, setValue] = useState("all");
    return (
      <FilterSelect
        value={value}
        onChange={setValue}
        options={jobOptions}
        placeholder="求人"
        allLabel="すべての求人"
      />
    );
  },
};

export const WithoutAll: Story = {
  render: function WithoutAllFilter() {
    const [value, setValue] = useState("new");
    return (
      <FilterSelect
        value={value}
        onChange={setValue}
        options={statusOptions}
        placeholder="ステータス"
        showAll={false}
      />
    );
  },
};

export const Selected: Story = {
  render: function SelectedFilter() {
    const [value, setValue] = useState("interview");
    return (
      <FilterSelect
        value={value}
        onChange={setValue}
        options={statusOptions}
        placeholder="ステータス"
      />
    );
  },
};

export const MultipleFilters: Story = {
  render: function MultipleFiltersExample() {
    const [status, setStatus] = useState("all");
    const [job, setJob] = useState("all");
    return (
      <div className="flex gap-2">
        <FilterSelect
          value={job}
          onChange={setJob}
          options={jobOptions}
          placeholder="求人"
          allLabel="すべての求人"
        />
        <FilterSelect
          value={status}
          onChange={setStatus}
          options={statusOptions}
          placeholder="ステータス"
          allLabel="すべてのステータス"
        />
      </div>
    );
  },
};
