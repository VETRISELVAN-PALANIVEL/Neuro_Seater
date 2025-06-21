// 1. Sequential Order (Row-wise)
export function sequentialOrder(students) {
  return [...students].sort((a, b) => {
    // Try to sort by roll number if numeric, else keep order
    const aNum = Number(a.row[0]);
    const bNum = Number(b.row[0]);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return 0;
  });
}

// 2. Serpentine Order (Snake-wise)
export function serpentineOrder(students, rows, cols) {
  const result = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    const rowArr = [];
    for (let c = 0; c < cols; c++) {
      if (idx < students.length) rowArr.push(students[idx++]);
      else rowArr.push(null);
    }
    if (r % 2 === 1) rowArr.reverse();
    result.push(rowArr);
  }
  return result;
}

// 3. Alternate Seating (Gap)
export function alternateSeating(students, totalSeats) {
  const result = Array(totalSeats).fill(null);
  let idx = 0;
  for (let i = 0; i < result.length && idx < students.length; i += 2) {
    result[i] = students[idx++];
  }
  return result;
}

// 4. Even-Odd Roll Number Mixing
export function evenOddMix(students) {
  const even = students.filter(s => Number(s.row[0]) % 2 === 0);
  const odd = students.filter(s => Number(s.row[0]) % 2 !== 0);
  const result = [];
  let i = 0, j = 0;
  while (i < even.length || j < odd.length) {
    if (i < even.length) result.push(even[i++]);
    if (j < odd.length) result.push(odd[j++]);
  }
  return result;
}

// 5. Gender-Based Alternating
export function genderAlternating(students) {
  const males = students.filter(s => (s.Gender || "").toLowerCase().startsWith("m"));
  const females = students.filter(s => (s.Gender || "").toLowerCase().startsWith("f"));
  const result = [];
  let i = 0, j = 0;
  while (i < males.length || j < females.length) {
    if (i < males.length) result.push(males[i++]);
    if (j < females.length) result.push(females[j++]);
  }
  return result;
}

// 6. Randomized Allocation
export function randomizedAllocation(students) {
  const arr = [...students];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}