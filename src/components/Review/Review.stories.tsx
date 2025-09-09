import { Meta, StoryObj } from "@storybook/react";
import { Review } from "./Review";

const meta = {
  title: "Components/Review",
  component: Review,
  argTypes: {
    rating: {
      control: { type: "range", min: 0, max: 5, step: 0.1 },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Review>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Excellent: Story = {
  args: {
    rating: 5,
  },
};

export const VeryGood: Story = {
  args: {
    rating: 4.5,
  },
};

export const Adequate: Story = {
  args: {
    rating: 2.5,
  },
};

export const VeryPoor: Story = {
  args: {
    rating: 1,
  },
};
