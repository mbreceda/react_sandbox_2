type ReviewProps = {
  rating: number;
};

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

  return (
    <>
      <span style={{ color: "#FFD700", marginRight: 4 }}>★</span>
      {rating.toFixed(1)} {reviewText}
    </>
  );
};

export const Review = ({ rating }: ReviewProps) => (
  <div>{getReview(rating)}</div>
);
