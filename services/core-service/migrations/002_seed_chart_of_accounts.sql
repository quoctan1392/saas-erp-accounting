-- Migration: Seed Chart of Accounts General (Standard Regime - Chế độ kế toán theo TT200)
-- Date: 2024-12-23

-- Clear existing data
TRUNCATE TABLE chart_of_accounts_general;

-- Tài khoản cấp 1: TÀI SẢN
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, description, accounting_regime, active) VALUES
('1', 'TÀI SẢN', 'ASSETS', 'debit', 1, NULL, 'Tài sản', 'standard', true),
('2', 'NỢ PHẢI TRẢ', 'LIABILITIES', 'credit', 1, NULL, 'Nợ phải trả', 'standard', true),
('3', 'VỐN CHỦ SỞ HỮU', 'EQUITY', 'credit', 1, NULL, 'Vốn chủ sở hữu', 'standard', true),
('4', 'DOANH THU', 'REVENUE', 'credit', 1, NULL, 'Doanh thu', 'standard', true),
('5', 'CHI PHÍ SẢN XUẤT', 'COST OF GOODS SOLD', 'debit', 1, NULL, 'Chi phí sản xuất', 'standard', true),
('6', 'CHI PHÍ BÁN HÀNG', 'SELLING EXPENSES', 'debit', 1, NULL, 'Chi phí bán hàng', 'standard', true),
('7', 'CHI PHÍ QUẢN LÝ DOANH NGHIỆP', 'ADMINISTRATIVE EXPENSES', 'debit', 1, NULL, 'Chi phí quản lý doanh nghiệp', 'standard', true),
('8', 'CHI PHÍ KHÁC', 'OTHER EXPENSES', 'debit', 1, NULL, 'Chi phí khác', 'standard', true),
('9', 'THU NHẬP KHÁC', 'OTHER INCOME', 'credit', 1, NULL, 'Thu nhập khác', 'standard', true);

-- Tài khoản cấp 2: Tiền và các khoản tương đương tiền
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('11', 'Tiền mặt', 'Cash', 'debit', 2, '1', 'standard', true),
('111', 'Tiền Việt Nam', 'VND Cash', 'debit', 3, '11', 'standard', true),
('112', 'Ngoại tệ', 'Foreign Currency', 'debit', 3, '11', 'standard', true),
('113', 'Vàng bạc, kim khí quý, đá quý', 'Gold, Silver, Precious Metals', 'debit', 3, '11', 'standard', true);

INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('12', 'Tiền gửi ngân hàng', 'Cash in Bank', 'debit', 2, '1', 'standard', true),
('121', 'Tiền Việt Nam', 'VND in Bank', 'debit', 3, '12', 'standard', true),
('122', 'Ngoại tệ', 'Foreign Currency in Bank', 'debit', 3, '12', 'standard', true);

INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('13', 'Các khoản đầu tư tài chính ngắn hạn', 'Short-term Financial Investments', 'debit', 2, '1', 'standard', true),
('131', 'Đầu tư chứng khoán ngắn hạn', 'Short-term Securities', 'debit', 3, '13', 'standard', true);

-- Phải thu khách hàng
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('13', 'Phải thu khách hàng', 'Accounts Receivable', 'debit', 2, '1', 'standard', true),
('131', 'Phải thu của khách hàng', 'Trade Receivables', 'debit', 3, '13', 'standard', true),
('133', 'Thuế GTGT được khấu trừ', 'Deductible VAT', 'debit', 3, '13', 'standard', true);

-- Hàng tồn kho
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('15', 'Hàng tồn kho', 'Inventories', 'debit', 2, '1', 'standard', true),
('151', 'Nguyên vật liệu', 'Raw Materials', 'debit', 3, '15', 'standard', true),
('152', 'Công cụ dụng cụ', 'Tools and Supplies', 'debit', 3, '15', 'standard', true),
('153', 'Hàng hóa', 'Merchandise', 'debit', 3, '15', 'standard', true),
('154', 'Hàng gửi bán', 'Goods in Transit', 'debit', 3, '15', 'standard', true),
('155', 'Sản phẩm dở dang', 'Work in Process', 'debit', 3, '15', 'standard', true),
('156', 'Thành phẩm', 'Finished Goods', 'debit', 3, '15', 'standard', true);

-- Tài sản cố định
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('21', 'Tài sản cố định hữu hình', 'Tangible Fixed Assets', 'debit', 2, '2', 'standard', true),
('211', 'Nhà cửa, vật kiến trúc', 'Buildings and Structures', 'debit', 3, '21', 'standard', true),
('212', 'Máy móc, thiết bị', 'Machinery and Equipment', 'debit', 3, '21', 'standard', true),
('213', 'Phương tiện vận tải', 'Vehicles', 'debit', 3, '21', 'standard', true);

INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('22', 'Hao mòn tài sản cố định', 'Accumulated Depreciation', 'credit', 2, '2', 'standard', true),
('221', 'Hao mòn TSCĐ hữu hình', 'Accumulated Depreciation - Tangible Assets', 'credit', 3, '22', 'standard', true);

-- Nợ phải trả
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('31', 'Phải trả người bán', 'Accounts Payable', 'credit', 2, '3', 'standard', true),
('331', 'Phải trả cho người bán', 'Trade Payables', 'credit', 3, '31', 'standard', true),
('333', 'Thuế GTGT phải nộp', 'VAT Payable', 'credit', 3, '31', 'standard', true);

INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('33', 'Thuế và các khoản phải nộp Nhà nước', 'Taxes and Other Payables to State', 'credit', 2, '3', 'standard', true),
('333', 'Thuế GTGT phải nộp', 'VAT Payable', 'credit', 3, '33', 'standard', true),
('3331', 'Thuế GTGT đầu ra', 'Output VAT', 'credit', 4, '333', 'standard', true),
('334', 'Thuế thu nhập doanh nghiệp', 'Corporate Income Tax', 'credit', 3, '33', 'standard', true),
('335', 'Thuế thu nhập cá nhân', 'Personal Income Tax', 'credit', 3, '33', 'standard', true),
('336', 'Thuế tài nguyên', 'Resource Tax', 'credit', 3, '33', 'standard', true),
('337', 'Thuế môn bài', 'License Tax', 'credit', 3, '33', 'standard', true),
('338', 'Thuế khác', 'Other Taxes', 'credit', 3, '33', 'standard', true);

INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('34', 'Phải trả người lao động', 'Salaries and Wages Payable', 'credit', 2, '3', 'standard', true),
('341', 'Phải trả công nhân viên', 'Wages Payable', 'credit', 3, '34', 'standard', true);

-- Vốn chủ sở hữu
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('41', 'Vốn đầu tư của chủ sở hữu', 'Owner''s Capital', 'credit', 2, '4', 'standard', true),
('411', 'Vốn góp của chủ sở hữu', 'Contributed Capital', 'credit', 3, '41', 'standard', true);

INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('42', 'Lợi nhuận chưa phân phối', 'Retained Earnings', 'credit', 2, '4', 'standard', true),
('421', 'Lợi nhuận chưa phân phối năm trước', 'Prior Year Retained Earnings', 'credit', 3, '42', 'standard', true),
('422', 'Lợi nhuận chưa phân phối năm nay', 'Current Year Retained Earnings', 'credit', 3, '42', 'standard', true);

-- Doanh thu
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('51', 'Doanh thu bán hàng', 'Sales Revenue', 'credit', 2, '5', 'standard', true),
('511', 'Doanh thu bán hàng hóa', 'Revenue from Sale of Goods', 'credit', 3, '51', 'standard', true),
('512', 'Doanh thu bán thành phẩm', 'Revenue from Sale of Finished Products', 'credit', 3, '51', 'standard', true),
('515', 'Doanh thu cung cấp dịch vụ', 'Revenue from Services', 'credit', 3, '51', 'standard', true);

INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('52', 'Các khoản giảm trừ doanh thu', 'Sales Returns and Allowances', 'debit', 2, '5', 'standard', true),
('521', 'Hàng bán bị trả lại', 'Sales Returns', 'debit', 3, '52', 'standard', true),
('532', 'Giảm giá hàng bán', 'Sales Discounts', 'debit', 3, '52', 'standard', true),
('531', 'Chiết khấu thương mại', 'Trade Discounts', 'debit', 3, '52', 'standard', true);

-- Giá vốn
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('63', 'Giá vốn hàng bán', 'Cost of Goods Sold', 'debit', 2, '6', 'standard', true),
('631', 'Giá vốn hàng hóa', 'COGS - Merchandise', 'debit', 3, '63', 'standard', true),
('632', 'Giá vốn thành phẩm', 'COGS - Finished Products', 'debit', 3, '63', 'standard', true);

-- Chi phí bán hàng
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('64', 'Chi phí bán hàng', 'Selling Expenses', 'debit', 2, '6', 'standard', true),
('641', 'Chi phí nhân viên bán hàng', 'Sales Staff Costs', 'debit', 3, '64', 'standard', true),
('642', 'Chi phí vật liệu, bao bì', 'Packaging Costs', 'debit', 3, '64', 'standard', true),
('643', 'Chi phí dụng cụ', 'Tools Costs', 'debit', 3, '64', 'standard', true),
('644', 'Chi phí khấu hao TSCĐ', 'Depreciation - Selling', 'debit', 3, '64', 'standard', true),
('645', 'Chi phí bảo hành', 'Warranty Costs', 'debit', 3, '64', 'standard', true),
('647', 'Chi phí dịch vụ mua ngoài', 'Outsourced Services', 'debit', 3, '64', 'standard', true),
('649', 'Chi phí bán hàng khác', 'Other Selling Expenses', 'debit', 3, '64', 'standard', true);

-- Chi phí quản lý doanh nghiệp
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('64', 'Chi phí quản lý doanh nghiệp', 'Administrative Expenses', 'debit', 2, '6', 'standard', true),
('641', 'Chi phí nhân viên quản lý', 'Management Staff Costs', 'debit', 3, '64', 'standard', true),
('642', 'Chi phí vật liệu quản lý', 'Office Supplies', 'debit', 3, '64', 'standard', true),
('643', 'Chi phí đồ dùng văn phòng', 'Office Equipment', 'debit', 3, '64', 'standard', true),
('644', 'Chi phí khấu hao TSCĐ', 'Depreciation - Admin', 'debit', 3, '64', 'standard', true),
('645', 'Chi phí thuê văn phòng', 'Office Rent', 'debit', 3, '64', 'standard', true),
('647', 'Chi phí dịch vụ mua ngoài', 'Outsourced Services - Admin', 'debit', 3, '64', 'standard', true),
('649', 'Chi phí quản lý khác', 'Other Admin Expenses', 'debit', 3, '64', 'standard', true);

-- Thu nhập khác  
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('71', 'Thu nhập khác', 'Other Income', 'credit', 2, '7', 'standard', true),
('711', 'Thu nhập từ lãi tiền gửi', 'Interest Income', 'credit', 3, '71', 'standard', true),
('715', 'Thu nhập từ cổ tức', 'Dividend Income', 'credit', 3, '71', 'standard', true),
('718', 'Thu nhập khác', 'Miscellaneous Income', 'credit', 3, '71', 'standard', true);

-- Chi phí khác
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('81', 'Chi phí khác', 'Other Expenses', 'debit', 2, '8', 'standard', true),
('811', 'Chi phí lãi vay', 'Interest Expense', 'debit', 3, '81', 'standard', true),
('818', 'Chi phí khác', 'Miscellaneous Expenses', 'debit', 3, '81', 'standard', true);

-- Xác định kết quả kinh doanh
INSERT INTO chart_of_accounts_general (account_number, account_name, account_name_en, account_nature, account_level, parent_account_number, accounting_regime, active) VALUES
('91', 'Xác định kết quả kinh doanh', 'Determination of Business Results', 'both', 2, '9', 'standard', true),
('911', 'Lãi/lỗ kinh doanh', 'Profit/Loss from Operations', 'both', 3, '91', 'standard', true);

COMMIT;
