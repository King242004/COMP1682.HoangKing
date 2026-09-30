import { describe, expect, it } from 'vitest';

import { kyHienTai, tinhConLaiNganSach } from './TinhConLaiNganSach';

describe('kyHienTai', () => {
  it('finds the current week and month', () => {
    expect(kyHienTai('tuan', '2026-10-10')).toEqual({ tuNgay: '2026-10-05', denNgay: '2026-10-11' });
    expect(kyHienTai('thang', '2026-10-10')).toEqual({ tuNgay: '2026-10-01', denNgay: '2026-10-31' });
  });
});

describe('tinhConLaiNganSach', () => {
  it('matches the example in the document: 1.500.000 budget, 1.104.000 spent, 22 days → 18.000/day', () => {
    expect(tinhConLaiNganSach(1500000, 1104000, '2026-10-31', '2026-10-10')).toEqual({
      daTieu: 1104000,
      conLai: 396000,
      soNgayConLai: 22,
      moiNgay: 18000,
    });
  });

  it('gives 0 per day once the budget is used up', () => {
    const ketQua = tinhConLaiNganSach(1000000, 1200000, '2026-10-31', '2026-10-10');
    expect(ketQua.conLai).toBe(-200000);
    expect(ketQua.moiNgay).toBe(0);
  });
});
