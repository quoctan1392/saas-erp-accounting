-- Migration: 009_seed_tax_industry_groups.sql
-- Description: Seed tax_industry_groups table with data from taxIndustryGroups.ts
-- Created: 2024-12-27

-- Insert tax industry groups data
INSERT INTO tax_industry_groups (code, name, group_name, vat_rate, pit_rate) VALUES
-- Nhóm 1: Phân phối, cung cấp hàng hóa
('101', 'Hoạt động bán buôn, bán lẻ các loại hàng hóa (trừ giá trị hàng hóa đại lý bán đúng giá hưởng hoa hồng)', 'Nhóm 1: Phân phối, cung cấp hàng hóa', 1.0, 0.5),
('102', 'Khoản thưởng, hỗ trợ đạt doanh số, khuyến mại, chiết khấu thương mại, chiết khấu thanh toán, chi hỗ trợ bằng tiền hoặc không bằng tiền cho hộ khoán', 'Nhóm 1: Phân phối, cung cấp hàng hóa', 1.0, 0.5),
('103', 'Hoạt động phân phối, cung cấp hàng hóa không chịu thuế GTGT, không phải khai thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật về thuế GTGT', 'Nhóm 1: Phân phối, cung cấp hàng hóa', 0.0, 0.5),
('104', 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm ngành nghề này mà tổ chức có trách nhiệm khai thuế GTGT đối với toàn bộ doanh thu của hoạt động hợp tác kinh doanh theo quy định', 'Nhóm 1: Phân phối, cung cấp hàng hóa', 0.0, 0.5),
('105', 'Khoán thưởng, hỗ trợ đạt doanh số, khuyến mại, chiết khấu thương mại... thuộc đối tượng không chịu thuế GTGT', 'Nhóm 1: Phân phối, cung cấp hàng hóa', 0.0, 0.5),
('106', 'Khoản bồi thường vi phạm hợp đồng, bồi thường khác', 'Nhóm 1: Phân phối, cung cấp hàng hóa', NULL, 0.5),

-- Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu
('201', 'Dịch vụ lưu trú', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('202', 'Dịch vụ bốc xếp hàng hóa và hoạt động dịch vụ hỗ trợ khác liên quan đến vận tải', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('203', 'Dịch vụ bưu chính, chuyển phát thư tín và bưu kiện', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('204', 'Dịch vụ môi giới, đấu giá và hoa hồng đại lý', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('205', 'Dịch vụ tư vấn pháp luật, tư vấn tài chính, kế toán, kiểm toán; dịch vụ làm thủ tục hành chính thuế, hải quan', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('206', 'Dịch vụ xử lý dữ liệu, cho thuê cổng thông tin, thiết bị công nghệ thông tin, viễn thông', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('207', 'Dịch vụ hỗ trợ văn phòng và các dịch vụ hỗ trợ kinh doanh khác', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('208', 'Dịch vụ tắm hơi, massage, karaoke, vũ trường, internet, game', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('209', 'Dịch vụ may đo, giặt là; cắt tóc, làm đầu, gội đầu', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('210', 'Dịch vụ sửa chữa khác bao gồm: sửa chữa máy vi tính và các đồ dùng gia đình', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('211', 'Dịch vụ tư vấn, thiết kế, giám sát thi công xây dựng cơ bản', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('212', 'Các dịch vụ khác thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ với mức thuế suất thuế GTGT 10%', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('213', 'Xây dựng, lắp đặt không bao thầu nguyên vật liệu (bao gồm cả lắp đặt máy móc, thiết bị công nghiệp)', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 2.0),
('214', 'Hoạt động cung cấp dịch vụ không chịu thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 0.0, 2.0),
('215', 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm ngành nghề này mà tổ chức có trách nhiệm khai thuế GTGT', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 0.0, 2.0),
('216', 'Khoản bồi thường vi phạm hợp đồng, bồi thường khác', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', NULL, 2.0),
('217', 'Cho thuê tài sản (nhà, đất, cửa hàng, nhà xưởng, kho bãi; cho thuê phương tiện vận tải)', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 5.0),
('218', 'Làm đại lý xổ số, đại lý bảo hiểm, bán hàng đa cấp; khoản bồi thường', 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu', 5.0, 5.0),

-- Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa
('301', 'Sản xuất, gia công, chế biến sản phẩm hàng hóa', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.0, 1.5),
('302', 'Khai thác, chế biến khoáng sản', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.0, 1.5),
('303', 'Vận tải hàng hóa, vận tải hành khách', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.0, 1.5),
('304', 'Dịch vụ kèm theo bán hàng hóa như dịch vụ đào tạo, bảo dưỡng, chuyển giao công nghệ', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.0, 1.5),
('305', 'Dịch vụ ăn uống', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.0, 1.5),
('306', 'Dịch vụ sửa chữa và bảo dưỡng máy móc, phương tiện vận tải, ô tô, mô tô, xe máy', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.0, 1.5),
('307', 'Xây dựng, lắp đặt có bao thầu nguyên vật liệu (bao gồm cả lắp đặt máy móc, thiết bị công nghiệp)', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.0, 1.5),
('308', 'Hoạt động khác thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.0, 1.5),
('309', 'Hoạt động không chịu thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 0.0, 1.5),
('310', 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm này mà tổ chức có trách nhiệm khai thuế GTGT', 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa', 3.0, 1.5),

-- Nhóm 4: Hoạt động kinh doanh khác
('401', 'Hoạt động sản xuất các sản phẩm thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ', 'Nhóm 4: Hoạt động kinh doanh khác', 2.0, 1.0),
('402', 'Hoạt động cung cấp các dịch vụ thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ', 'Nhóm 4: Hoạt động kinh doanh khác', 2.0, 1.0),
('403', 'Hoạt động khác chưa được liệt kê ở các nhóm trước', 'Nhóm 4: Hoạt động kinh doanh khác', 2.0, 1.0)
ON CONFLICT (code) DO NOTHING;
