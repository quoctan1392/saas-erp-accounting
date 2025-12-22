/**
 * Tax Industry Groups for HKD (Household Business)
 * Data structure matching Danh mục ngành nghề tính thuế GTGT, TNCN
 */

export interface TaxIndustryGroup {
  /** Mã nhóm ngành */
  code: string;
  /** Tên danh mục ngành nghề */
  name: string;
  /** Tỷ lệ % tính thuế GTGT (as number, e.g., 1.00 for 1%) */
  vatRate?: number;
  /** Thuế suất thuế TNCN (as number, e.g., 0.50 for 0.5%) */
  pitRate: number;
  /** Tên nhóm (e.g., "Nhóm 1: Phân phối, cung cấp hàng hóa") */
  groupName: string;
}

/**
 * Danh sách nhóm ngành nghề tính thuế GTGT, TNCN
 * TODO: Import full list from requirements
 */
const taxIndustryGroups: TaxIndustryGroup[] = [
  // Nhóm 1: Phân phối, cung cấp hàng hóa
  {
    code: '101',
    name: 'Hoạt động bán buôn, bán lẻ các loại hàng hóa (trừ giá trị hàng hóa đại lý bán đúng giá hưởng hoa hồng)',
    vatRate: 1.00,
    pitRate: 0.50,
    groupName: 'Nhóm 1: Phân phối, cung cấp hàng hóa',
  },
  {
    code: '102',
    name: 'Khoán thưởng, hỗ trợ đạt doanh số, khuyến mại, chiết khấu thương mại, chiết khấu thanh toán, chi hỗ trợ bằng tiền hoặc không bằng tiền cho hộ khoán; (Mới bổ sung)',
    vatRate: 1.00,
    pitRate: 0.50,
    groupName: 'Nhóm 1: Phân phối, cung cấp hàng hóa',
  },
  {
    code: '103',
    name: 'Hoạt động phân phối, cung cấp hàng hóa không chịu thuế GTGT, không phải khai thuế GTGT, thuộc diện chịu thuế GTGT 0% theo pháp luật về thuế GTGT;',
    vatRate: 0.00,
    pitRate: 0.50,
    groupName: 'Nhóm 1: Phân phối, cung cấp hàng hóa',
  },
  {
    code: '104',
    name: 'Hoạt động hợp tác kinh doanh với tổ chức thuộc nhóm ngành nghề này mà tổ chức có trách nhiệm khai thuế GTGT đối với toàn bộ doanh thu của hoạt động hợp tác kinh doanh theo quy định;',
    vatRate: 0.00,
    pitRate: 0.50,
    groupName: 'Nhóm 1: Phân phối, cung cấp hàng hóa',
  },
  {
    code: '105',
    name: 'Khoán thưởng, hỗ trợ đạt doanh số, khuyến mại, chiết khấu thương mại, chiết khấu thanh toán, chi hỗ trợ bằng tiền hoặc không bằng tiền cho hộ khoán thuộc nhóm ngành nghề này mà hộ khoán có trách nhiệm khai thuế GTGT đối với toàn bộ doanh thu theo quy định;',
    vatRate: 0.00,
    pitRate: 0.50,
    groupName: 'Nhóm 1: Phân phối, cung cấp hàng hóa',
  },
  // Add more items as needed - user will import the full list
];

export default taxIndustryGroups;
