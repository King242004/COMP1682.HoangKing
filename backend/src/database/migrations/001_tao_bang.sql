-- Creates all 13 tables of Evenwise (see tai-lieu/Evenwise.md, section 5).
-- Money is always INTEGER VND. Only facts are stored; balances, debts and forecasts are computed.

CREATE TABLE nguoi_dung (
  id               SERIAL PRIMARY KEY,
  email            TEXT NOT NULL UNIQUE,
  mat_khau_bam     TEXT NOT NULL,
  ten_hien_thi     TEXT NOT NULL,
  anh_dai_dien_url TEXT,
  ngay_tao         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vi (
  id             SERIAL PRIMARY KEY,
  nguoi_dung_id  INTEGER NOT NULL REFERENCES nguoi_dung (id),
  ten            TEXT NOT NULL,
  so_du_ban_dau  INTEGER NOT NULL DEFAULT 0 CHECK (so_du_ban_dau >= 0),
  ngay_tao       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- nguoi_dung_id NULL = default category shared by everyone.
CREATE TABLE danh_muc (
  id             SERIAL PRIMARY KEY,
  nguoi_dung_id  INTEGER REFERENCES nguoi_dung (id),
  ten            TEXT NOT NULL,
  loai           TEXT NOT NULL CHECK (loai IN ('thu', 'chi')),
  bieu_tuong     TEXT NOT NULL
);

CREATE TABLE nhom (
  id            SERIAL PRIMARY KEY,
  ten           TEXT NOT NULL,
  ma_moi        TEXT NOT NULL UNIQUE,
  nguoi_tao_id  INTEGER NOT NULL REFERENCES nguoi_dung (id),
  ngay_tao      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE thanh_vien_nhom (
  nhom_id        INTEGER NOT NULL REFERENCES nhom (id) ON DELETE CASCADE,
  nguoi_dung_id  INTEGER NOT NULL REFERENCES nguoi_dung (id),
  ngay_vao       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (nhom_id, nguoi_dung_id)
);

-- An upcoming item belongs to exactly one owner: a person, or a group plan.
-- For a group plan, so_tien is the expected amount per person.
CREATE TABLE khoan_sap_toi (
  id             SERIAL PRIMARY KEY,
  nguoi_dung_id  INTEGER REFERENCES nguoi_dung (id),
  nhom_id        INTEGER REFERENCES nhom (id) ON DELETE CASCADE,
  ten            TEXT NOT NULL,
  loai           TEXT NOT NULL CHECK (loai IN ('thu', 'chi')),
  so_tien        INTEGER NOT NULL CHECK (so_tien > 0),
  ngay_bat_dau   DATE NOT NULL,
  lap_lai        TEXT NOT NULL DEFAULT 'khong' CHECK (lap_lai IN ('khong', 'tuan', 'thang')),
  ngay_ket_thuc  DATE CHECK (ngay_ket_thuc >= ngay_bat_dau),
  ngay_tao       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((nguoi_dung_id IS NULL) <> (nhom_id IS NULL))
);

CREATE TABLE tham_gia_ke_hoach (
  khoan_sap_toi_id  INTEGER NOT NULL REFERENCES khoan_sap_toi (id) ON DELETE CASCADE,
  nguoi_dung_id     INTEGER NOT NULL REFERENCES nguoi_dung (id),
  PRIMARY KEY (khoan_sap_toi_id, nguoi_dung_id)
);

-- khoan_sap_toi_id + ky_ngay mark which occurrence of an upcoming item this transaction paid,
-- so the forecast does not subtract it twice. Both are set together or both are NULL.
CREATE TABLE giao_dich (
  id                SERIAL PRIMARY KEY,
  nguoi_dung_id     INTEGER NOT NULL REFERENCES nguoi_dung (id),
  vi_id             INTEGER NOT NULL REFERENCES vi (id),
  danh_muc_id       INTEGER NOT NULL REFERENCES danh_muc (id),
  loai              TEXT NOT NULL CHECK (loai IN ('thu', 'chi')),
  so_tien           INTEGER NOT NULL CHECK (so_tien > 0),
  ngay              DATE NOT NULL,
  ghi_chu           TEXT,
  anh_url           TEXT,
  khoan_sap_toi_id  INTEGER REFERENCES khoan_sap_toi (id) ON DELETE SET NULL,
  ky_ngay           DATE,
  ngay_tao          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((khoan_sap_toi_id IS NULL) = (ky_ngay IS NULL))
);

CREATE INDEX giao_dich_theo_nguoi_va_ngay ON giao_dich (nguoi_dung_id, ngay);

-- danh_muc_id NULL = budget for all spending.
CREATE TABLE ngan_sach (
  id             SERIAL PRIMARY KEY,
  nguoi_dung_id  INTEGER NOT NULL REFERENCES nguoi_dung (id),
  ten            TEXT NOT NULL,
  so_tien        INTEGER NOT NULL CHECK (so_tien > 0),
  chu_ky         TEXT NOT NULL CHECK (chu_ky IN ('tuan', 'thang')),
  danh_muc_id    INTEGER REFERENCES danh_muc (id),
  ngay_bat_dau   DATE NOT NULL,
  ngay_tao       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- vi_id is the payer's wallet. It can be NULL when someone else records a bill that another member paid.
CREATE TABLE hoa_don (
  id                SERIAL PRIMARY KEY,
  nhom_id           INTEGER NOT NULL REFERENCES nhom (id) ON DELETE CASCADE,
  ten               TEXT NOT NULL,
  nguoi_tra_id      INTEGER NOT NULL REFERENCES nguoi_dung (id),
  vi_id             INTEGER REFERENCES vi (id),
  danh_muc_id       INTEGER NOT NULL REFERENCES danh_muc (id),
  so_tien           INTEGER NOT NULL CHECK (so_tien > 0),
  ngay              DATE NOT NULL,
  ghi_chu           TEXT,
  anh_url           TEXT,
  cach_chia         TEXT NOT NULL CHECK (cach_chia IN ('deu', 'tuy_chinh')),
  khoan_sap_toi_id  INTEGER REFERENCES khoan_sap_toi (id) ON DELETE SET NULL,
  nguoi_tao_id      INTEGER NOT NULL REFERENCES nguoi_dung (id),
  ngay_tao          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX hoa_don_theo_nhom ON hoa_don (nhom_id);

-- The sum of all shares must equal hoa_don.so_tien; the service checks this inside one transaction.
CREATE TABLE phan_chia (
  hoa_don_id     INTEGER NOT NULL REFERENCES hoa_don (id) ON DELETE CASCADE,
  nguoi_dung_id  INTEGER NOT NULL REFERENCES nguoi_dung (id),
  so_tien        INTEGER NOT NULL CHECK (so_tien >= 0),
  PRIMARY KEY (hoa_don_id, nguoi_dung_id)
);

CREATE INDEX phan_chia_theo_nguoi ON phan_chia (nguoi_dung_id);

CREATE TABLE thanh_toan_nhom (
  id              SERIAL PRIMARY KEY,
  nhom_id         INTEGER NOT NULL REFERENCES nhom (id) ON DELETE CASCADE,
  nguoi_tra_id    INTEGER NOT NULL REFERENCES nguoi_dung (id),
  nguoi_nhan_id   INTEGER NOT NULL REFERENCES nguoi_dung (id),
  vi_tra_id       INTEGER REFERENCES vi (id),
  vi_nhan_id      INTEGER REFERENCES vi (id),
  so_tien         INTEGER NOT NULL CHECK (so_tien > 0),
  trang_thai      TEXT NOT NULL DEFAULT 'cho' CHECK (trang_thai IN ('cho', 'da_nhan')),
  ngay_tao        TIMESTAMPTZ NOT NULL DEFAULT now(),
  ngay_xac_nhan   TIMESTAMPTZ,
  CHECK (nguoi_tra_id <> nguoi_nhan_id)
);

-- One promise per person per group: "I will pay all my debt in this group by ngay_hen".
CREATE TABLE hen_tra_no (
  nhom_id        INTEGER NOT NULL REFERENCES nhom (id) ON DELETE CASCADE,
  nguoi_dung_id  INTEGER NOT NULL REFERENCES nguoi_dung (id),
  ngay_hen       DATE NOT NULL,
  ngay_tao       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (nhom_id, nguoi_dung_id)
);
