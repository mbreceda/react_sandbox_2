import styled from "styled-components";

import { Body } from "../typography";

type ReviewProps = {
  rating: number;
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const getReview = (rating?: number) => {
  if (!rating) {
    return "No reviews yet";
  }

  let reviewText = "";

  if (rating >= 2 && rating < 4) {
    reviewText = "Adquate";
  } else if (rating >= 4 && rating < 5) {
    reviewText = "Very good";
  } else if (rating > 5) {
    reviewText = "Excellent";
  }

  return `★ ${rating.toFixed(1)} ${reviewText}`;
};

export const Review = ({ rating }: ReviewProps) => (
  <Wrapper>
    <Body type="span" size="S" className="review-text">
      {getReview(rating)}
    </Body>
  </Wrapper>
);
