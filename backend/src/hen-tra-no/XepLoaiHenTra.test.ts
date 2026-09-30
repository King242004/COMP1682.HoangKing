import { describe, expect, it } from 'vitest';

import { xepLoaiHenTra } from './XepLoaiHenTra';

describe('xepLoaiHenTra', () => {
  it('does not remind when the promise is more than 2 days away', () => {
    expect(xepLoaiHenTra('2026-10-15', '2026-10-10')).toEqual({ loai: 'chua_toi', soNgay: 5 });
  });

  it('reminds (yellow) from 2 days before until the day itself', () => {
    expect(xepLoaiHenTra('2026-10-12', '2026-10-10')).toEqual({ loai: 'sap_toi', soNgay: 2 });
    expect(xepLoaiHenTra('2026-10-10', '2026-10-10')).toEqual({ loai: 'sap_toi', soNgay: 0 });
  });

  it('warns (red) after the promised day, with how many days late', () => {
    expect(xepLoaiHenTra('2026-10-07', '2026-10-10')).toEqual({ loai: 'qua_hen', soNgay: 3 });
  });
});
