export type PhanChia = {
  nguoiDungId: number;
  soTien: number;
};

// Splits a bill evenly between people (tai-lieu/Evenwise.md, section 4.5).
// Each person gets the amount divided by the number of people, rounded down; the leftover
// dong(s) go one by one to the people at the start of the list. The total is always exact.
// Example: 100.000 for 3 people → 33.334, 33.333, 33.333.
export function chiaDeu(soTien: number, nguoiDungIds: number[]): PhanChia[] {
  const soNguoi = nguoiDungIds.length;
  const moiNguoi = Math.floor(soTien / soNguoi);
  const dongLe = soTien - moiNguoi * soNguoi;

  return nguoiDungIds.map((nguoiDungId, viTri) => ({
    nguoiDungId,
    soTien: viTri < dongLe ? moiNguoi + 1 : moiNguoi,
  }));
}

// For a custom split: how much is still missing (positive) or over (negative) compared with the bill.
// The app shows this as "Còn lại"; a bill can only be saved when it is exactly 0.
export function tinhConLai(soTien: number, phanChia: PhanChia[]): number {
  const daChia = phanChia.reduce((tong, phan) => tong + phan.soTien, 0);
  return soTien - daChia;
}
