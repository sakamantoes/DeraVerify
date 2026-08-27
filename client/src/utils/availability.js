export const getNumberAvailabilityInfo = (item) => {
  const stock = Number(item.stock ?? 0);

  // Providers that expose stock (e.g. SMSBower)
  if (Number.isFinite(stock) && stock > 0) {
    if (stock >= 100) {
      return {
        label: "High Availability",
        detail: `${stock} in stock`,
        score: stock,
        className:
          "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
      };
    }

    if (stock >= 25) {
      return {
        label: "Good Availability",
        detail: `${stock} in stock`,
        score: stock,
        className: "border-sky-400/20 bg-sky-500/10 text-sky-300",
      };
    }

    if (stock >= 5) {
      return {
        label: "Limited Availability",
        detail: `${stock} in stock`,
        score: stock,
        className: "border-amber-400/20 bg-amber-500/10 text-amber-300",
      };
    }

    return {
      label: "Very Limited",
      detail: `${stock} in stock`,
      score: stock,
      className:
        "border-orange-400/20 bg-orange-500/10 text-orange-300",
    };
  }

  // Providers that don't expose stock (e.g. SMSPool)
  if (item?.availability === true) {
    return {
      label: "Available",
      detail: "Stock unavailable",
      score: 1,
      className: "border-blue-400/20 bg-blue-500/10 text-blue-300",
    };
  }

  return {
    label: "Unavailable",
    detail: "No active route",
    score: 0,
    className: "border-red-light/20 bg-red-light/10 text-red-light",
  };
};