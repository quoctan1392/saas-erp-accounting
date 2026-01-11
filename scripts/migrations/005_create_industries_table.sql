-- Create industries table
CREATE TABLE IF NOT EXISTS industries (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(500) NOT NULL,
  display_text VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert industry data
INSERT INTO industries (code, name, display_text) VALUES
  ('1', 'Dịch vụ chăm sóc sức khỏe, sắc đẹp', '1 - Dịch vụ chăm sóc sức khỏe, sắc đẹp'),
  ('2', 'Dịch vụ cho thuê bảo vệ, vệ sĩ', '2 - Dịch vụ cho thuê bảo vệ, vệ sĩ'),
  ('3', 'Dịch vụ vận tải', '3 - Dịch vụ vận tải'),
  ('4', 'Dịch vụ cho thuê kho bãi', '4 - Dịch vụ cho thuê kho bãi'),
  ('5', 'Dịch vụ cho thuê máy móc, thiết bị', '5 - Dịch vụ cho thuê máy móc, thiết bị'),
  ('6', 'Dịch vụ sửa chữa, bảo dưỡng và lắp đặt máy móc thiết bị', '6 - Dịch vụ sửa chữa, bảo dưỡng và lắp đặt máy móc thiết bị'),
  ('7', 'Dịch vụ cung ứng lao động và việc làm', '7 - Dịch vụ cung ứng lao động và việc làm'),
  ('8', 'Dịch vụ cung ứng phần mềm', '8 - Dịch vụ cung ứng phần mềm'),
  ('9', 'Dịch vụ du lịch', '9 - Dịch vụ du lịch'),
  ('10', 'Dịch vụ giáo dục và đào tạo', '10 - Dịch vụ giáo dục và đào tạo'),
  ('11', 'Dịch vụ lưu trú, khách sạn', '11 - Dịch vụ lưu trú, khách sạn'),
  ('12', 'Dịch vụ nhà hàng, ăn uống', '12 - Dịch vụ nhà hàng, ăn uống'),
  ('13', 'Dịch vụ môi giới bất động sản', '13 - Dịch vụ môi giới bất động sản'),
  ('14', 'Dịch vụ nông nghiệp', '14 - Dịch vụ nông nghiệp'),
  ('15', 'Dịch vụ truyền thông, quảng cáo, tổ chức sự kiện', '15 - Dịch vụ truyền thông, quảng cáo, tổ chức sự kiện'),
  ('16', 'Dịch vụ viễn thông', '16 - Dịch vụ viễn thông'),
  ('17', 'Dịch vụ tư vấn quản lý, hỗ trợ kinh doanh (kế toán, kiểm toán, tư vấn quản trị…)', '17 - Dịch vụ tư vấn quản lý, hỗ trợ kinh doanh (kế toán, kiểm toán, tư vấn quản trị…)'),
  ('18', 'Dịch vụ luật sư tư vấn', '18 - Dịch vụ luật sư tư vấn'),
  ('19', 'Dịch vụ y tế', '19 - Dịch vụ y tế'),
  ('20', 'Dịch vụ vệ sinh môi trường đô thị', '20 - Dịch vụ vệ sinh môi trường đô thị'),
  ('21', 'Dịch vụ khác', '21 - Dịch vụ khác'),
  ('22', 'Nghiên cứu khoa học và phát triển công nghệ', '22 - Nghiên cứu khoa học và phát triển công nghệ'),
  ('23', 'Đầu tư kinh doanh bất động sản', '23 - Đầu tư kinh doanh bất động sản'),
  ('24', 'Kinh doanh dược phẩm', '24 - Kinh doanh dược phẩm'),
  ('25', 'Kinh doanh thực phẩm, nông lâm sản, thủy hải sản', '25 - Kinh doanh thực phẩm, nông lâm sản, thủy hải sản'),
  ('26', 'Kinh doanh máy móc, thiết bị cơ khí, kim khí', '26 - Kinh doanh máy móc, thiết bị cơ khí, kim khí'),
  ('27', 'Kinh doanh phụ tùng ô tô, xe máy và xe có động cơ khác', '27 - Kinh doanh phụ tùng ô tô, xe máy và xe có động cơ khác'),
  ('28', 'Kinh doanh nhôm, kính', '28 - Kinh doanh nhôm, kính'),
  ('29', 'Kinh doanh văn phòng phẩm', '29 - Kinh doanh văn phòng phẩm'),
  ('30', 'Kinh doanh tổng hợp, bán lẻ, siêu thị', '30 - Kinh doanh tổng hợp, bán lẻ, siêu thị'),
  ('31', 'Kinh doanh mặt hàng giày da, may mặc', '31 - Kinh doanh mặt hàng giày da, may mặc'),
  ('32', 'Sản xuất hóa mỹ phẩm', '32 - Sản xuất hóa mỹ phẩm'),
  ('33', 'Sản xuất gốm, sứ, thủy tinh', '33 - Sản xuất gốm, sứ, thủy tinh'),
  ('34', 'Sản xuất điện máy thiết bị gia dụng', '34 - Sản xuất điện máy thiết bị gia dụng'),
  ('35', 'Sản xuất thiết bị y tế', '35 - Sản xuất thiết bị y tế'),
  ('36', 'Sản xuất máy móc, thiết bị cơ khí, kim khí', '36 - Sản xuất máy móc, thiết bị cơ khí, kim khí'),
  ('37', 'Sản xuất máy vi tính và linh kiện điện tử', '37 - Sản xuất máy vi tính và linh kiện điện tử'),
  ('38', 'Sản xuất ô tô, xe máy', '38 - Sản xuất ô tô, xe máy'),
  ('39', 'Sản xuất phụ tùng ô tô, xe máy và xe có động cơ khác', '39 - Sản xuất phụ tùng ô tô, xe máy và xe có động cơ khác'),
  ('40', 'Sản xuất sắt, thép và các kim loại khác', '40 - Sản xuất sắt, thép và các kim loại khác'),
  ('41', 'Sản xuất vật liệu xây dựng', '41 - Sản xuất vật liệu xây dựng'),
  ('42', 'Sản xuất nhôm, kính', '42 - Sản xuất nhôm, kính'),
  ('43', 'Sản xuất mặt hàng đồ uống (rượu, bia, nước giải khát, nước đóng chai, …)', '43 - Sản xuất mặt hàng đồ uống (rượu, bia, nước giải khát, nước đóng chai, …)'),
  ('44', 'Sản xuất mặt hàng dệt, giày da, hàng may mặc', '44 - Sản xuất mặt hàng dệt, giày da, hàng may mặc'),
  ('45', 'Sản xuất vật tư nông nghiệp', '45 - Sản xuất vật tư nông nghiệp'),
  ('46', 'Sản xuất sản phẩm từ nhựa, cao su, giấy', '46 - Sản xuất sản phẩm từ nhựa, cao su, giấy'),
  ('47', 'Sản xuất chế biến thực phẩm', '47 - Sản xuất chế biến thực phẩm'),
  ('48', 'Sản xuất chế biến thủy hải sản', '48 - Sản xuất chế biến thủy hải sản'),
  ('49', 'Sản xuất nông nghiệp', '49 - Sản xuất nông nghiệp'),
  ('50', 'Sản xuất bao bì', '50 - Sản xuất bao bì'),
  ('51', 'Sản xuất, chế biến gỗ, thiết bị nội thất và các sản phẩm từ gỗ, tre, nứa,…', '51 - Sản xuất, chế biến gỗ, thiết bị nội thất và các sản phẩm từ gỗ, tre, nứa,…'),
  ('52', 'In ấn, xuất bản', '52 - In ấn, xuất bản'),
  ('53', 'Khai khoáng', '53 - Khai khoáng'),
  ('54', 'Xây lắp', '54 - Xây lắp'),
  ('55', 'Sản xuất khác (Không cụ thể)', '55 - Sản xuất khác (Không cụ thể)');

-- Create index on code for faster lookups
CREATE INDEX idx_industries_code ON industries(code);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_industries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_industries_updated_at
BEFORE UPDATE ON industries
FOR EACH ROW
EXECUTE FUNCTION update_industries_updated_at();
