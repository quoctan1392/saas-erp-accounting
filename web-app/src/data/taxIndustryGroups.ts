/**
 * Tax Industry Groups shape.
 *
 * NOTE: local seed removed — data must be loaded from the server via
 * `/api/tax-industry-groups`. Keep this file present so imports of the
 * `TaxIndustryGroup` type work in development; export an empty list to
 * avoid accidentally shipping duplicate/local data.
 */

export interface TaxIndustryGroup {
  code: string;
  name: string;
  vatRate?: number;
  pitRate: number;
  groupName: string;
}

const taxIndustryGroups: TaxIndustryGroup[] = [
  // Nhóm 1: Phân phối, cung cấp hàng hóa
  {
    code: '101',
    name: 'Hoạt động bán buôn, bán lẻ các loại hàng hóa (trừ giá trị hàng hóa đại lý bán đúng giá hưởng hoa hồng)',
    vatRate: 1.0,
    pitRate: 0.5,
    groupName: 'Nhóm 1: Phân phối, cung cấp hàng hóa',
  },
  {
    code: '102',
    name: 'Khoản thưởng, hỗ trợ đạt doanh số, khuyến mại, chiết khấu thương mại, chiết khấu thanh toán, chi hỗ trợ bằng tiền hoặc không bằng tiền cho hộ khoán',
    vatRate: 1.0,
    pitRate: 0.5,
    groupName: 'Nhóm 1: Phân phối, cung cấp hàng hóa',
  },
  {
    code: '103',
    name: 'Hoạt động phân phối, cung cấp hàng hóa không chịu thuế GTGT, không phải khai thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật về thuế GTGT',
    vatRate: 0.0,
    pitRate: 0.5,
    groupName: 'Nhóm 1: Phân phối, cung cấp hàng hóa',
  },
  {
    code: '104',
    name: 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm ngành nghề này mà tổ chức có trách nhiệm khai thuế GTGT đối với toàn bộ doanh thu của hoạt động hợp tác kinh doanh theo quy định',
    vatRate: 0.0,
    pitRate: 0.5,
    groupName: 'Nhóm 1: Phân phối, cung cấp hàng hóa',
  },
  {
    code: '105',
    name: 'Khoán thưởng, hỗ trợ đạt doanh số, khuyến mại, chiết khấu thương mại... thuộc đối tượng không chịu thuế GTGT',
    vatRate: 0.0,
    pitRate: 0.5,
    groupName: 'Nhóm 1: Phân phối, cung cấp hàng hóa',
  },
  {
    code: '106',
    name: 'Khoản bồi thường vi phạm hợp đồng, bồi thường khác',
    pitRate: 0.5,
    groupName: 'Nhóm 1: Phân phối, cung cấp hàng hóa',
  },

  // Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu
  {
    code: '201',
    name: 'Dịch vụ lưu trú',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '202',
    name: 'Dịch vụ bốc xếp hàng hóa và hoạt động dịch vụ hỗ trợ khác liên quan đến vận tải',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '203',
    name: 'Dịch vụ bưu chính, chuyển phát thư tín và bưu kiện',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '204',
    name: 'Dịch vụ môi giới, đấu giá và hoa hồng đại lý',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '205',
    name: 'Dịch vụ tư vấn pháp luật, tư vấn tài chính, kế toán, kiểm toán; dịch vụ làm thủ tục hành chính thuế, hải quan',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '206',
    name: 'Dịch vụ xử lý dữ liệu, cho thuê cổng thông tin, thiết bị công nghệ thông tin, viễn thông',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '207',
    name: 'Dịch vụ hỗ trợ văn phòng và các dịch vụ hỗ trợ kinh doanh khác',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '208',
    name: 'Dịch vụ tắm hơi, massage, karaoke, vũ trường, internet, game',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '209',
    name: 'Dịch vụ may đo, giặt là; cắt tóc, làm đầu, gội đầu',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '210',
    name: 'Dịch vụ sửa chữa khác bao gồm: sửa chữa máy vi tính và các đồ dùng gia đình',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '211',
    name: 'Dịch vụ tư vấn, thiết kế, giám sát thi công xây dựng cơ bản',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '212',
    name: 'Các dịch vụ khác thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ với mức thuế suất thuế GTGT 10%',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '213',
    name: 'Xây dựng, lắp đặt không bao thầu nguyên vật liệu (bao gồm cả lắp đặt máy móc, thiết bị công nghiệp)',
    vatRate: 5.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '214',
    name: 'Hoạt động cung cấp dịch vụ không chịu thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật',
    vatRate: 0.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '215',
    name: 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm ngành nghề này mà tổ chức có trách nhiệm khai thuế GTGT',
    vatRate: 0.0,
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '216',
    name: 'Khoản bồi thường vi phạm hợp đồng, bồi thường khác',
    pitRate: 2.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '217',
    name: 'Cho thuê tài sản (nhà, đất, cửa hàng, nhà xưởng, kho bãi; cho thuê phương tiện vận tải)',
    vatRate: 5.0,
    pitRate: 5.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },
  {
    code: '218',
    name: 'Làm đại lý xổ số, đại lý bảo hiểm, bán hàng đa cấp; khoản bồi thường',
    vatRate: 5.0,
    pitRate: 5.0,
    groupName: 'Nhóm 2: Dịch vụ, xây dựng không bao thầu nguyên vật liệu',
  },

  // Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa
  {
    code: '301',
    name: 'Sản xuất, gia công, chế biến sản phẩm hàng hóa',
    vatRate: 3.0,
    pitRate: 1.5,
    groupName: 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa',
  },
  {
    code: '302',
    name: 'Khai thác, chế biến khoáng sản',
    vatRate: 3.0,
    pitRate: 1.5,
    groupName: 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa',
  },
  {
    code: '303',
    name: 'Vận tải hàng hóa, vận tải hành khách',
    vatRate: 3.0,
    pitRate: 1.5,
    groupName: 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa',
  },
  {
    code: '304',
    name: 'Dịch vụ kèm theo bán hàng hóa như dịch vụ đào tạo, bảo dưỡng, chuyển giao công nghệ',
    vatRate: 3.0,
    pitRate: 1.5,
    groupName: 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa',
  },
  {
    code: '305',
    name: 'Dịch vụ ăn uống',
    vatRate: 3.0,
    pitRate: 1.5,
    groupName: 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa',
  },
  {
    code: '306',
    name: 'Dịch vụ sửa chữa và bảo dưỡng máy móc, phương tiện vận tải, ô tô, mô tô, xe máy',
    vatRate: 3.0,
    pitRate: 1.5,
    groupName: 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa',
  },
  {
    code: '307',
    name: 'Xây dựng, lắp đặt có bao thầu nguyên vật liệu (bao gồm cả lắp đặt máy móc, thiết bị công nghiệp)',
    vatRate: 3.0,
    pitRate: 1.5,
    groupName: 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa',
  },
  {
    code: '308',
    name: 'Hoạt động khác thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ',
    vatRate: 3.0,
    pitRate: 1.5,
    groupName: 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa',
  },
  {
    code: '309',
    name: 'Hoạt động không chịu thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật',
    vatRate: 0.0,
    pitRate: 1.5,
    groupName: 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa',
  },
  {
    code: '310',
    name: 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm này mà tổ chức có trách nhiệm khai thuế GTGT',
    vatRate: 3.0,
    pitRate: 1.5,
    groupName: 'Nhóm 3: Sản xuất, vận tải, dịch vụ gắn với hàng hóa',
  },

  // Nhóm 4: Hoạt động kinh doanh khác
  {
    code: '401',
    name: 'Hoạt động sản xuất các sản phẩm thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ',
    vatRate: 2.0,
    pitRate: 1.0,
    groupName: 'Nhóm 4: Hoạt động kinh doanh khác',
  },
  {
    code: '402',
    name: 'Hoạt động cung cấp các dịch vụ thuộc đối tượng tính thuế GTGT theo phương pháp khấu trừ',
    vatRate: 2.0,
    pitRate: 1.0,
    groupName: 'Nhóm 4: Hoạt động kinh doanh khác',
  },
  {
    code: '403',
    name: 'Hoạt động khác chưa được liệt kê ở các nhóm trước',
    vatRate: 2.0,
    pitRate: 1.0,
    groupName: 'Nhóm 4: Hoạt động kinh doanh khác',
  },
];

export default taxIndustryGroups;
