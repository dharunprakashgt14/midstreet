let sequencePerMonth = 1;

export const generateBillNumber = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  const currentKey = `${month}-${year}`;
  // In a real app this would persist per month; for now we just increment.
  const seq = String(sequencePerMonth).padStart(4, "0");
  sequencePerMonth += 1;

  return `MS-${year}-${seq}`;
};


