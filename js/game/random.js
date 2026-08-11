export function nextRandom(random) {
  const nextState = (random.state + 0x6D2B79F5) >>> 0;
  let value = nextState;
  value = Math.imul(value ^ value >>> 15, value | 1);
  value ^= value + Math.imul(value ^ value >>> 7, value | 61);
  return { random: { ...random, state: nextState }, value: ((value ^ value >>> 14) >>> 0) / 4294967296 };
}

export function rollDie(random) {
  const next = nextRandom(random);
  return { random: next.random, value: Math.floor(next.value * 6) + 1 };
}
