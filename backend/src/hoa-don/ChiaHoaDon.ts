export type PhanChia = {
  nguoiDungId: number;
  soTien: number;
};

// Chia đều hóa đơn cho nhiều người (tai-lieu/Evenwise.md, mục 4.5).
// Mỗi người nhận số tiền chia cho số người, làm tròn xuống; số đồng lẻ còn thiếu
// cộng lần lượt cho những người đứng đầu danh sách. Tổng luôn khớp đúng.
// Ví dụ: 100.000 chia 3 người → 33.334, 33.333, 33.333.
export function chiaDeu(soTien: number, nguoiDungIds: number[]): PhanChia[] {
  const soNguoi = nguoiDungIds.length;
  const moiNguoi = Math.floor(soTien / soNguoi);
  const dongLe = soTien - moiNguoi * soNguoi;

  return nguoiDungIds.map((nguoiDungId, viTri) => ({
    nguoiDungId,
    soTien: viTri < dongLe ? moiNguoi + 1 : moiNguoi,
  }));
}

// Khi chia tùy chỉnh: còn thiếu (dương) hoặc dư (âm) bao nhiêu so với hóa đơn.
// App hiện con số này là "Còn lại"; chỉ lưu được hóa đơn khi nó đúng bằng 0.
export function tinhConLai(soTien: number, phanChia: PhanChia[]): number {
  const daChia = phanChia.reduce((tong, phan) => tong + phan.soTien, 0);
  return soTien - daChia;
}
