import { describe, expect, it } from 'vitest';

import signUpload from './signUpload';

describe('signUpload', () => {
  // Ví dụ mẫu trong tài liệu "Generating authentication signatures" của Cloudinary.
  it('matches the example from the Cloudinary documentation', () => {
    const signature = signUpload(
      { timestamp: 1315060510, public_id: 'sample_image', eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop' },
      'abcd',
    );
    expect(signature).toBe('bfd09f95f331f558cbd1320e67aa8d488770583e');
  });

  it('does not depend on the order the parameters were written in', () => {
    const first = signUpload({ timestamp: 100, folder: 'evenwise' }, 'secret');
    const second = signUpload({ folder: 'evenwise', timestamp: 100 }, 'secret');
    expect(first).toBe(second);
  });
});
