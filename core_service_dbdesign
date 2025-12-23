Accounting database schema

```mermaid
erDiagram
    business_profile {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"
        
        string type "Loại hình kinh doanh"
        string tax_number "Mã số thuế"
        string name "Tên công ty"
        string address "Địa chỉ công ty"
        string owner_name "Tên chủ công ty"
        string identity_number "CMND/CCCD"
        string fields_of_operation "Lĩnh vực hoạt động"
        string[] sector "Ngành nghề kinh doanh"
        string accounting_regime "Chế độ kế toán. Khác nhau giữa Hộ kinh doanh và doanh nghiệp tư nhân"
        
        date start_data_date "Ngày bắt đầu dữ liệu, Các form nhập liệu không được trước ngày này, Default 1970-01-01"

        string tax_calculation_method "Phương pháp tính thuế. Default khấu trừ"
        string accounting_currency "Đồng tiền hạch toán. Default VND"

        string tax_frequency "Tần suất kê khai thuế"
        string use_invoice_machine "Có sử dụng máy tính tiền xuất hoá đơn"
        string inventory_method "Phương pháp tính giá xuất kho"

        number initial_cash_on_hand "Số tiền mặt ban đầu"
        number initial_bank_balance "Số dư ban đầu"
    }

    einvocie_provider {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"

        string name "Tên nhà cung cấp"
        string api_key "API key"
        string account "Tên tài khoản"
        string password "Mật khẩu"
        bool is_use "Có dùng nhà cung cấp này không"
    }

    bank_account {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"
        string account_id "ID của tài khoản trong Chart of Accounts custom. Tự động tạo khi lưu tài khoản bank"

        number initial_balance "Số dư ban đầu"
        string bank_name "Tên ngân hàng"
        string account_number "Số tài khoản"
    }

    chart_of_accounts_general {
        id string "ID"
        string account_regime "Chế độ kế toán"
        
        string account_name "Tên tài khoản"
        string account_number "Số tài khoản"
        string account_level "Level account"
        bool active "Tài khoản có hoạt động không"
        string account_nature "Tính chất tài khoản"
        string account_parent_id "ID của tài khoản cha"
    }

    chart_of_accounts_custom {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"
        string user_created "Người tạo"
        string user_updated "Người cập nhật"
        string source "Nguồn tạo tài khoản: general | custom"
        string parent_id "ID của tài khoản cha"

        string account_name "Tên tài khoản"
        string account_number "Số tài khoản"
        string account_nature "Tính chất tài khoản"
        string account_level "Level account"
        bool active "Tài khoản có hoạt động không"
        string characteristics "Đặc điểm tài khoản"
    }    

    business_profile ||--o{ einvocie_provider : "tenant_id"
    business_profile ||--o{ bank_account : "tenant_id"
    chart_of_accounts_general ||--|{ chart_of_accounts_custom : "id"
    bank_account ||--|{ chart_of_accounts_custom : "account_id - id"

    %% Danh mục đối tượng kế toán
    object {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"

        string account_object_code "Mã đối tượng kế toán"
        string account_object_name "Tên đối tượng kế toán"
        
        string address "Địa chỉ đối tượng kế toán"
        string other_address "Địa chỉ khác"
        string[] list_delivery_address "Danh sách địa chỉ giao hàng"

        string subject_group_id "ID của nhóm đối tượng kế toán, link sang bảng subject_group"

        string phone "Số điện thoại đối tượng kế toán"
        bool is_vendor "Có phải là nhà cung cấp không"
        bool is_local_object "Có phải là đối tượng cục bộ không"
        bool is_customer "Có phải là khách hàng không"
        bool is_employee "Có phải là nhân viên không"
        bool is_active "Có hoạt động không"
        string legal_representative "Người đại diện"
        string country "Quốc gia"
        string website "Website"
        string province_or_city "Tỉnh/Thành phố"
        string company_tax_code "Mã số thuế công ty"
        bool is_same_address "Có cùng địa chỉ với công ty không"
        string pay_account_id "Tài khoản công nợ phải trả, link sang bảng chart_of_accounts_custom"
        string receive_account_id "Tài khoản công nợ phải thu, link sang bảng chart_of_accounts_custom"
        string reftype "Loại đối tượng kế toán"
        
        string contact_name "Tên liên hệ"
        string contact_phone "Số điện thoại liên hệ"
        string contact_email "Email liên hệ"
        string contact_position "Chức vụ liên hệ"

        string invoice_receipt_name "Tên đối tượng kế toán hóa đơn nhận"
        string invoice_receipt_phone "Số điện thoại đối tượng kế toán hóa đơn nhận"
        string invoice_receipt_email "Email đối tượng kế toán hóa đơn nhận"

        string identity_number "Số CCCD/CMND"
        string passport_number "Số hộ chiếu"

        string[] list_bank_account_ids "Danh sách tài khoản ngân hàng, link sang bảng bank_account"
        string note "Ghi chú"
    }

    %% Danh mục nhóm đối tượng kế toán
    subject_group {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"

        string group_code "Mã nhóm đối tượng kế toán"
        string name "Tên nhóm đối tượng kế toán"
        string note "Ghi chú"
        string parent_group_id "ID của nhóm cha"
    }

    subject ||--|{ bank_account : "bank_account_ids"
    subject ||--|{ subject_group : "subject_group_id"
    subject_group ||--|{ subject_group : "parent_group_id"

    %% Danh mục hàng hóa
    item {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"

        string name "Tên hàng hóa"
        string code "Mã hàng hóa"
        string type "Loại hàng hóa: goods, service, material, finished_goods, tool_and_equipment"

        string list_item_category_id "Danh sách ID của nhóm hàng hóa dịch vụ, link sang bảng item_category"
        number minimum_stock "Số lượng tồn kho tối thiểu, mặc định null"
        number maximum_stock "Số lượng tồn kho tối đa, mặc định null"
        bool is_active "Có hoạt động không"
        string unit_id "ID của đơn vị tính, link sang bảng unit"

        number sell_price "Giá bán"
        number import_tax_rate "Thuế nhập khẩu, đã chia 100"
        number export_tax_rate "Thuế xuất khẩu, đã chia 100"
        number vat_rate "Thuế GTGT, đã chia 100"
        number special_consumption_tax_rate "Thuế tiêu thụ đặc biệt, đã chia 100"

        string discount_account_id "ID của tài khoản khoản chiết khấu, link sang bảng chart_of_accounts_custom"
        string sale_off_account_id "ID của tài khoản giảm giá, link sang bảng chart_of_accounts_custom"
        string return_account_id "ID của tài khoản trả lại, link sang bảng chart_of_accounts_custom"
        string inventory_account_id "ID của tài khoản kho, link sang bảng chart_of_accounts_custom"
        string revenue_account_id "ID của tài khoản doanh thu, link sang bảng chart_of_accounts_custom"
        string cogs_account_id "ID của tài khoản chi phí, link sang bảng chart_of_accounts_custom"

        string purchase_description "Mô tả mua hàng"
        string sale_description "Mô tả bán hàng"
  
        string sale_account_id "ID của tài khoản doanh thu bán hàng, link sang bảng chart_of_accounts_custom"

        string tax_reduction_type "Loại giảm giá thuế: not_defined | not_tax_reduction | tax_reduction"
        number purchase_last_unit_price "Giá mua gần nhất"
        string specific_warehouse_id "ID của kho ngầm định"
        string special_consumption_tax_group_id "ID của nhóm hàng hoá chịu thuế tiêu thụ đặc biệt, link sang bảng special_consumption_tax_group"

        string[] list_image_url "Danh sách URL hình ảnh"
        string default_image_url "URL hình ảnh mặc định"
    }

    %% Nhóm hàng hoá chịu thuế tiêu thụ đặc biệt
    special_consumption_tax_group {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"
        
        string code "Mã nhóm hàng hoá chịu thuế tiêu thụ đặc biệt"
        string name "Tên nhóm hàng hoá chịu thuế tiêu thụ đặc biệt"
        bool is_active "Có hoạt động không"
        string unit_id "ID của đơn vị tính, link sang bảng unit"
        string parent_group_id "ID của nhóm cha"
        number rate "Thuế suất, đã chia 100"
    }

    %% Danh mục đơn vị tính
    unit {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"

        string name "Tên đơn vị tính"
        string code "Mã đơn vị tính"
        bool is_active "Có hoạt động không"
    }

    %% Danh mục nhóm hàng hóa dịch vụ
    item_category {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"

        string name "Tên nhóm hàng hóa dịch vụ"
        string code "Mã nhóm hàng hóa dịch vụ"
        string parent_category_id "ID của nhóm cha"
    }

    %% Danh mục kho. Luôn tạo 1 kho default cho mỗi tenant
    warehouse {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"
        
        string name "Tên kho"
        string code "Mã kho"
        string address "Địa chỉ kho"
        bool is_active "Có hoạt động không"
        string inventory_account_id "ID của tài khoản kho, tài khoản 15x"
    }

    %% Hàng hóa trong kho - WIP
    inventory_transactions {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"

        string item_id "ID của hàng hóa, link sang bảng item"
        string warehouse_id "ID của kho, link sang bảng warehouse"
        datetime posted_date "Ngày hạch toán - phải ghi sổ mới có"
        datetime transaction_date "Ngày giao dịch"
        string transaction_no "Số chứng từ"
        string transaction_type "Loại chứng từ: in (nhập kho) | out (xuất kho) | transfer (điều chuyển)"
        string description "Mô tả"
        number unit_price "Giá đơn vị"
        number quantity "Số lượng"
        number amount "Số tiền"
    }

    %% Chứng từ bán hàng
    sale_voucher {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"
        
        string code "Mã chứng từ"
        datetime posted_date "Ngày hạch toán - phải ghi sổ mới có"
        datetime transaction_date "Ngày giao dịch"
        string transaction_no "Số chứng từ"
        string transaction_code "Mã nghiệp vụ (Lấy theo policy )"
        string payment_type "Loại thanh toán: pay_later | pay_now"
        string payment_method "Phương thức thanh toán: cash (tiền mặt) | bank_transfer (chuyển khoản)"
        bool is_sale_with_outward "Có lập luôn phiếu xuất không"
        bool is_sale_with_invoice "Có lập luôn hóa đơn không"
        
        string account_object_id "ID của đối tượng mua hàng, link sang bảng object"
        string account_object_name "Tên đối tượng mua hàng"
        string account_object_address "Địa chỉ đối tượng mua hàng"
        string account_object_tax_code "Mã số thuế đối tượng mua hàng"
        string account_object_code "Mã đối tượng mua hàng"

        string currency_id "ID của đồng tiền: vnd | usd | ..."
        number exchange_rate "Tỷ giá"
        number total_sale_amount_oc "Tổng số tiền bán nguyên tệ"
        number total_sale_amount "Tổng số tiền bán nội tệ"
        number total_amount_oc "Tổng số tiền bán nguyên tệ"
        number total_amount "Tổng số tiền bán nội tệ"
        number total_discount_amount_oc "Tổng số tiền chiết khấu nguyên tệ"
        number total_discount_amount "Tổng số tiền chiết khấu nội tệ"
        string discount_type "Loại chiết khấu: not_discount (không chiết khấu) | by_item (theo mặt hàng) | by_invoice_amount (theo tổng tiền của hóa đơn) | by_percent (theo % số tiền hoá đơn)"
        number total_vat_amount_oc "Tổng số tiền thuế GTGT nguyên tệ"
        number total_vat_amount "Tổng số tiền thuế GTGT nội tệ"
        number total_export_tax_amount "Tổng số tiền thuế xuất khẩu"

        string employee_id "ID của nhân viên, link sang bảng object"
        string employee_name "Tên nhân viên"
        string employee_code "Mã nhân viên"

        number discount_rate "Tỷ lệ chiết khấu"

        string[] attached_file_ids "Danh sách link file đính kèm"
    }

    %% Chi tiết bán hàng
    sale_voucher_detail {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"
        
        string item_id "ID của hàng hóa, link sang bảng item"
        string item_name "Tên hàng hóa"
        string item_code "Mã hàng hóa"
        string item_type "Loại hàng hóa: goods | service | material | finished_goods | tool_and_equipment"

        string sale_voucher_refid "ID của chứng từ bán hàng"
        
        number display_order "Thứ tự hiển thị khi user nhập"
        bool is_promotion "Có phải là khuyến mãi không"
        bool is_commercial_abatement "Có phải là giảm giá thương mại không"
        number quantity "Số lượng"
        number unit_price "Giá / đơn vị"
        number unit_price_after_tax "Giá đơn vị sau thuế"
        number unit_price_after_discount "Giá đơn vị sau chiết khấu"
        number amount_oc "Số tiền nguyên tệ"
        number amount "Số tiền nội tệ"
        number discount_rate "Tỷ lệ chiết khấu"
        number discount_amount_oc "Số tiền chiết khấu nguyên tệ"
        number discount_amount "Số tiền chiết khấu"
        number amount_after_tax "Số tiền sau thuế"
        number vat_amount_oc "Số tiền thuế GTGT nguyên tệ"
        number vat_amount "Số tiền thuế GTGT"

        number export_tax_rate "Thuế xuất khẩu, đã chia 100"
        number export_tax_amount "Số tiền thuế xuất khẩu"

        number exchange_rate "Tỉ giá"
        string description "Mô tả"

        datetime posted_date "Ngày hạch toán"
    }

    %% Chứng từ xuất kho
    outward_voucher {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"
        
        string sale_voucher_refid "ID của chứng từ bán hàng"
        string code "Mã chứng từ"
        datetime posted_date "Ngày hạch toán - phải ghi sổ mới có"
        datetime transaction_date "Ngày giao dịch"
        string transaction_no "Số chứng từ"
        string transaction_code "Mã nghiệp vụ (Lấy theo policy )"
        
        string account_object_id "ID của đối tượng mua hàng, link sang bảng object"
        string account_object_name "Tên đối tượng mua hàng"
        string account_object_address "Địa chỉ đối tượng mua hàng"
        string account_object_tax_code "Mã số thuế đối tượng mua hàng"
        string account_object_code "Mã đối tượng mua hàng"

        string employee_id "ID của nhân viên, link sang bảng object"
        string employee_name "Tên nhân viên"
        string employee_code "Mã nhân viên"

        string description "Mô tả"
        string[] attached_file_ids "Danh sách link file đính kèm"
    }

    %% Chứng từ xuất kho chi tiết
    outward_voucher_detail {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"
        
        string item_id "ID của hàng hóa, link sang bảng item"
        string item_name "Tên hàng hóa"
        string item_code "Mã hàng hóa"
        string item_type "Loại hàng hóa: goods | service | material | finished_goods | tool_and_equipment"

        string object_id "ID của đối tượng mua hàng, link sang bảng object (mã khách hàng)"
        string object_name "Tên đối tượng mua hàng"
        string object_code "Mã đối tượng mua hàng"
        string object_address "Địa chỉ đối tượng mua hàng"

        string outward_refid "ID của chứng từ xuất kho"

        number quantity "Số lượng"
        number cogs_unit_price "Giá vốn / đơn vị"
        number cogs_amount "Tiền vốn"
        
        number display_order "Thứ tự hiển thị khi user nhập"
        
        string description "Mô tả"

        datetime posted_date "Ngày hạch toán"
    }

    %% Chứng từ thu tiền
    receipt_voucher {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"

        string sale_voucher_refid "ID của chứng từ bán hàng"

        string account_object_id "ID của đối tượng mua hàng, link sang bảng object"
        string account_object_name "Tên đối tượng mua hàng"
        string account_object_address "Địa chỉ đối tượng mua hàng"
        string account_object_tax_code "Mã số thuế đối tượng mua hàng"
        string account_object_code "Mã đối tượng mua hàng"

        string employee_id "ID của nhân viên, link sang bảng object"
        string employee_name "Tên nhân viên"
        string employee_code "Mã nhân viên"

        string description "Mô tả"
        string[] attached_file_ids "Danh sách link file đính kèm"

        datetime posted_date "Ngày hạch toán"
        datetime transaction_datetime "Ngày giao dịch"
        string transaction_no "Số chứng từ"
        string transaction_code "Mã nghiệp vụ (Lấy theo policy)"
    }

    %% Chứng từ thu tiền chi tiết
    receipt_voucher_detail {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"
        
        string description "Mô tả"
        string receipt_voucher_refid "ID của chứng từ thu tiền"

        string debit_account_id "ID của tài khoản công nợ phải trả, link sang bảng chart_of_accounts_custom"
        string credit_account_id "ID của tài khoản công nợ phải thu, link sang bảng chart_of_accounts_custom"

        string account_bank_id "ID của tài khoản ngân hàng, link sang bảng bank_account"
        number amount "Số tiền"

        datetime posted_date "Ngày hạch toán"
    }

    %% Hoá đơn
    invoice {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"
        
        string account_object_id "ID của đối tượng mua hàng, link sang bảng object"
        string account_object_name "Tên đối tượng mua hàng"
        string account_object_address "Địa chỉ đối tượng mua hàng"
        string account_object_tax_code "Mã số thuế đối tượng mua hàng"
        string account_object_code "Mã đối tượng mua hàng"

        string identity_number "Số CCCD/CMND"
        string passport_number "Số hộ chiếu"
        string phone_number "Số điện thoại"

        string transaction_code "Mã nghiệp vụ (Lấy theo policy )"
        string payment_method "Phương thức thanh toán: cash (tiền mặt) | bank_transfer (chuyển khoản) | both (tiền mặt và chuyển khoản)"

        string currency_id "ID của đồng tiền: vnd | usd | ..."
        number exchange_rate "Tỷ giá"
        number total_sale_amount_oc "Tổng số tiền bán nguyên tệ"
        number total_sale_amount "Tổng số tiền bán nội tệ"
        number total_amount_oc "Tổng số tiền bán nguyên tệ"
        number total_amount "Tổng số tiền bán nội tệ"
        number total_discount_amount_oc "Tổng số tiền chiết khấu nguyên tệ"
        number total_discount_amount "Tổng số tiền chiết khấu nội tệ"
        string discount_type "Loại chiết khấu: not_discount (không chiết khấu) | by_item (theo mặt hàng) | by_invoice_amount (theo tổng tiền của hóa đơn) | by_percent (theo % số tiền hoá đơn)"
        number total_vat_amount_oc "Tổng số tiền thuế GTGT nguyên tệ"
        number total_vat_amount "Tổng số tiền thuế GTGT nội tệ"
        number total_export_tax_amount "Tổng số tiền thuế xuất khẩu"

        string employee_id "ID của nhân viên, link sang bảng object"
        string employee_name "Tên nhân viên"
        string employee_code "Mã nhân viên"
        string status "draft | published | cancelled"

        number discount_rate "Tỷ lệ chiết khấu"

        string[] attached_file_ids "Danh sách link file đính kèm"
        
        string invoice_form "Mẫu số hoá đơn"
        string invoice_sign "Ký hiệu hoá đơn"
        string invoice_number "Số hoá đơn"
        string invoice_date "Ngày hoá đơn"

        string ref_id "ID của chứng từ liên quan"
        string ref_type "Loại chứng từ liên quan: sale_voucher"
    }

    %% Chi tiết hoá đơn
    invoice_detail {
        string id "ID"
        string tenant_id "ID của tenant"
        string created_at "Ngày tạo"
        string updated_at "Ngày cập nhật"

        string item_id "ID của hàng hóa, link sang bảng item"
        string item_name "Tên hàng hóa"
        string item_code "Mã hàng hóa"
        string item_type "Loại hàng hóa: goods | service | material | finished_goods | tool_and_equipment"

        string invoice_refid "ID của hoá đơn"
        
        number display_order "Thứ tự hiển thị khi user nhập"
        number quantity "Số lượng"
        number unit_price "Giá / đơn vị"
        number amount_oc "Số tiền nguyên tệ"
        number amount "Số tiền"
        number discount_rate "Tỷ lệ chiết khấu"
        number discount_amount_oc "Số tiền chiết khấu nguyên tệ"
        number discount_amount "Số tiền chiết khấu"
        number amount_after_tax "Số tiền sau thuế"
        number vat_amount_oc "Số tiền thuế GTGT nguyên tệ"
        number vat_amount "Số tiền thuế GTGT"

        number export_tax_rate "Thuế xuất khẩu, đã chia 100"
        number export_tax_amount "Số tiền thuế xuất khẩu"

        number exchange_rate "Tỉ giá"

        datetime posted_date "Ngày hạch toán"
    }

    item ||--|{ item_category : "list_item_category_id"
    item ||--|{ unit : "unit_id"
    item ||--|{ chart_of_accounts_custom : "*_account_id"
    item ||--|{ special_consumption_tax_group : "special_consumption_tax_group_id"
    %% item ||--|{ chart_of_accounts_custom : "discount_account_id"
    %% item ||--|{ chart_of_accounts_custom : "sale_off_account_id"
    %% item ||--|{ chart_of_accounts_custom : "return_account_id"
    %% item ||--|{ chart_of_accounts_custom : "cogs_account_id"
    %% item ||--|{ chart_of_accounts_custom : "sale_account_id"
    %% item ||--|{ chart_of_accounts_custom : "revenue_account_id"
    %% item ||--|{ chart_of_accounts_custom : "inventory_account_id"

    special_consumption_tax_group ||--|{ unit : "unit_id"
    warehouse ||--|{ chart_of_accounts_custom : "inventory_account_id"
    receipt_voucher ||--|{ sale_voucher : "sale_voucher_refid"

    sale_voucher ||--|{ object : "account_object_id, employee_id"
    outward_voucher ||--|{ object : "account_object_id, employee_id"
    outward_voucher_detail ||--|{ item : "item_id"
    outward_voucher_detail ||--|{ outward_voucher : "outward_refid"

    sale_voucher_detail ||--|{ sale_voucher : "sale_voucher_refid"
    sale_voucher_detail ||--|{ item : "item_id"

    inventory_transactions ||--|{ item : "item_id"
    inventory_transactions ||--|{ warehouse : "warehouse_id"

    receipt_voucher ||--|{ object : "account_object_id"
    receipt_voucher_detail ||--|{ bank_account : "account_bank_id"

    invoice ||--|{ object : "account_object_id"
    invoice_detail ||--|{ item : "item_id"
    invoice_detail ||--|{ invoice : "invoice_refid"
```
