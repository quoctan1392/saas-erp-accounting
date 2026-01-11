-- Create tax_industry_groups table
CREATE TABLE IF NOT EXISTS tax_industry_groups (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  group_name VARCHAR(255) NOT NULL,
  vat_rate NUMERIC(5,2),
  pit_rate NUMERIC(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTE: seed data below is a small subset. Add the full list as needed.
INSERT INTO tax_industry_groups (code, name, group_name, vat_rate, pit_rate) VALUES
  -- Nhóm 1: Phân phối, cung cấp hàng hóa
  ('101', 'Hoạt động bán buôn, bán lẻ các loại hàng hóa (trừ giá trị hàng hóa đại lý bán đúng giá hưởng hoa hồng)', 'Nhóm 1: Phân phối, cung cấp hàng hóa', 1.00, 0.50),
  ('102', 'Khoản thưởng, hỗ trợ đạt doanh số, khuyến mại, chiết khấu thương mại, chiết khấu thanh toán, chi hỗ trợ bằng tiền hoặc không bằng tiền cho hộ khoán', 'Nhóm 1: Phân phối, cung cấp hàng hóa', 1.00, 0.50),
  ('103', 'Hoạt động phân phối, cung cấp hàng hóa không chịu thuế GTGT, không phải khai thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật về thuế GTGT', 'Nhóm 1: Phân phối, cung cấp hàng hóa', 0.00, 0.50),
  ('104', 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm ngành nghề này mà tổ chức có trách nhiệm khai thuế GTGT đối với toàn bộ doanh thu của hoạt động hợp tác kinh doanh theo quy định', 'Nhóm 1: Phân phối, cung cấp hàng hóa', 0.00, 0.50),
  ('105', 'Khoản thưởng, hỗ trợ đạt doanh số, khuyến mại... thuộc đối tượng không chịu thuế GTGT', 'Nhóm 1: Phân phối, cung cấp hàng hóa', 0.00, 0.50),
  ('106', 'Khoản bồi thường vi phạm hợp đồng, bồi thường khác', 'Nhóm 1: Phân phối, cung cấp hàng hóa', NULL, 0.50),

  -- Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu
  ('201', 'Dịch vụ lưu trú', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('202', 'Dịch vụ bốc xếp hàng hóa và hoạt động dịch vụ hỗ trợ khác liên quan đến vận tải', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('203', 'Dịch vụ bưu chính, chuyển phát thư tín và bưu kiện', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('204', 'Dịch vụ môi giới, đấu giá và hoa hồng đại lý', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('205', 'Dịch vụ tư vấn pháp luật, tư vấn tài chính, kế toán, kiểm toán', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('206', 'Dịch vụ xử lý dữ liệu, cho thuê cổng thông tin, thiết bị công nghệ thông tin', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('207', 'Dịch vụ hỗ trợ văn phòng và các dịch vụ hỗ trợ kinh doanh khác', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('208', 'Dịch vụ tắm hơi, massage, karaoke, vũ trường, giải trí', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('209', 'Dịch vụ may đo, giặt là; cắt tóc, làm đầu, gội đầu', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('210', 'Dịch vụ sửa chữa khác bao gồm: sửa chữa máy vi tính và các đồ dùng gia đình', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('211', 'Dịch vụ tư vấn, thiết kế, giám sát thi công xây dựng cơ bản', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('212', 'Các dịch vụ khác thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ với mức thuế suất 10%', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('213', 'Xây dựng, lắp đặt không bao thầu nguyên vật liệu (bao gồm cả lắp đặt máy móc, thiết bị công nghiệp)', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 2.00),
  ('214', 'Hoạt động cung cấp dịch vụ không chịu thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 0.00, 2.00),
  ('215', 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm ngành nghề này mà tổ chức có trách nhiệm khai thuế GTGT', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 0.00, 2.00),
  ('216', 'Khoản bồi thường vi phạm hợp đồng, bồi thường khác', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', NULL, 2.00),
  ('217', 'Cho thuê tài sản (nhà, đất, cửa hàng, kho bãi; phương tiện vận tải; tài sản khác)', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 5.00),
  ('218', 'Làm đại lý xổ số, đại lý bảo hiểm, bán hàng đa cấp; khoản bồi thường', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.00, 5.00),

  -- Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa
  ('301', 'Sản xuất, gia công, chế biến sản phẩm hàng hóa', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.00, 1.50),
  ('302', 'Khai thác, chế biến khoáng sản', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.00, 1.50),
  ('303', 'Vận tải hàng hóa, vận tải hành khách', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.00, 1.50),
  ('304', 'Dịch vụ kèm theo bán hàng hóa như đào tạo, bảo dưỡng, chuyển giao công nghệ', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.00, 1.50),
  ('305', 'Dịch vụ ăn uống', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.00, 1.50),
  ('306', 'Dịch vụ sửa chữa và bảo dưỡng máy móc, phương tiện vận tải', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.00, 1.50),
  ('307', 'Xây dựng, lắp đặt có bao thầu nguyên vật liệu', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.00, 1.50),
  ('308', 'Hoạt động khác thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.00, 1.50),
  ('309', 'Hoạt động không chịu thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 0.00, 1.50),
  ('310', 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm này mà tổ chức có trách nhiệm khai thuế GTGT', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.00, 1.50),

  -- Nhóm 4: Hoạt động kinh doanh khác
  ('401', 'Hoạt động sản xuất các sản phẩm thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ', 'Nhóm 4: Hoạt động kinh doanh khác', 2.00, 1.00),
  ('402', 'Hoạt động cung cấp các dịch vụ thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ', 'Nhóm 4: Hoạt động kinh doanh khác', 2.00, 1.00),
  ('403', 'Hoạt động khác chưa được liệt kê ở các nhóm trước', 'Nhóm 4: Hoạt động kinh doanh khác', 2.00, 1.00);

CREATE INDEX idx_tax_industry_groups_code ON tax_industry_groups(code);

-- trigger to update updated_at
CREATE OR REPLACE FUNCTION update_tax_industry_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tax_industry_groups_updated_at
BEFORE UPDATE ON tax_industry_groups
FOR EACH ROW
EXECUTE FUNCTION update_tax_industry_groups_updated_at();
