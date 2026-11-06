export function parseNumbers(raw: string) {
  const tokens = raw.split(/[,;\s]+/).filter(Boolean);
  const values = tokens.map(Number);
  const bad = tokens.filter((_, i) => !Number.isSafeInteger(values[i]));
  return { values: values.filter(Number.isSafeInteger), bad };
}
