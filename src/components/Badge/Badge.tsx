import styled, { css } from "styled-components";
import { Body } from "../typography";

const Container = styled.div(
  ({ theme: { color, borderRadius } }) => css`
    padding: 0.5em 1em;
    background: ${color.badgeBackground};
    border-radius: ${borderRadius.m};
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
    <Body type="span" size="S">
      {text}
    </Body>
  </Container>
);
