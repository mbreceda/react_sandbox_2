import styled, { css } from "styled-components";

const Container = styled.div(
  ({ theme: { color } }) => css`
    padding: 0.5em 1em;
    background: ${color.badgeBackground}
    border-radius: 1em;
    display: inline-block;
    span {
      color: ${color.badgeText};
    }
    span:first-letter {
      text-transform: capitalize;
    }
  `,
);

type BadgeProps = {
  text: string;
  className?: string;
};

export const Badge = ({ text, className }: BadgeProps) => (
  <Container className={className}>
    <span>{text}</span>
  </Container>
);
