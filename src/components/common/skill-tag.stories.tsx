import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SkillTag, SkillTagList } from "./skill-tag";

const meta: Meta<typeof SkillTag> = {
  title: "Common/SkillTag",
  component: SkillTag,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SkillTag>;

export const Default: Story = {
  args: {
    name: "React",
  },
};

export const Single: Story = {
  args: {
    name: "TypeScript",
  },
};

export const List: Story = {
  render: () => (
    <SkillTagList
      skills={["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"]}
    />
  ),
};

export const ListWithLimit: Story = {
  render: () => (
    <SkillTagList
      skills={[
        "React",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "AWS",
        "Docker",
        "Kubernetes",
      ]}
      maxDisplay={4}
    />
  ),
};

export const ManySkills: Story = {
  render: () => (
    <div className="max-w-md">
      <SkillTagList
        skills={[
          "JavaScript",
          "TypeScript",
          "React",
          "Next.js",
          "Node.js",
          "Express",
          "PostgreSQL",
          "MongoDB",
          "Redis",
          "AWS",
          "Docker",
          "Kubernetes",
          "GraphQL",
          "REST API",
          "Git",
        ]}
      />
    </div>
  ),
};
