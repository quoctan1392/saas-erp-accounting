export class TaxIndustryGroupResponseDto {
  id: string;
  code: string;
  name: string;
  groupName: string;
  vatRate?: number | null;
  pitRate: number;
}
