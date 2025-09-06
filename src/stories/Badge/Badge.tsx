import styled, { css } from "styled-components";

const Container = styled.div(
  () => css`
    padding: 0.5em 1em;
    background: #e9e9e9;
    border-radius: 1em;
    display: inline-block;
    span {
      color: #636363;
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
