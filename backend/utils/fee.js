const RENT_DAYS = 14;

/**
 * Rental fee formula (per Notes section):
 *   fee = days * formatCopyPrice * countOfBook
 * `days` defaults to the standard 14-day rental period.
 */
function calcLineFee(pricePerDay, count, days = RENT_DAYS) {
  return +(days * pricePerDay * count).toFixed(2);
}

function calcTotalFee(lines) {
  return +lines.reduce((sum, l) => sum + l.lineFee, 0).toFixed(2);
}

module.exports = { RENT_DAYS, calcLineFee, calcTotalFee };
