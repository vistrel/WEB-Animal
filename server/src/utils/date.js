function parseDurationToMs(value) {
  const match = /^(\d+)([smhd])$/i.exec(value);

  if (!match) {
    throw new Error(`Непідтримуваний формат тривалості: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
}

module.exports = {
  parseDurationToMs,
};
